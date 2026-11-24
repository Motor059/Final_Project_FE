import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError, isCancel } from "axios";
import { mergePTSessionProgress, ptApi } from "@/api/ptApi";
import { ptSessionTrackState } from "@/lib/ptTaskSettings";
import { getAuthSessionIdentity, getAuthVersion } from "@/lib/authStorage";
import { completePTCreation, ptErrorMessage } from "@/lib/ptSession";
import type { PTAudioAnswerRequest, PTAudioPresentationRequest, PTProgress, PTQuestion, PTQuestionProgress, PTSession, PTTextAnswerRequest, PTTextPresentationRequest, PTTrack } from "@/types/pt";

type SessionAction = { type: "TRACK"; track: PTTrack } | { type: "START" } | { type: "CANCEL" }
  | { type: "SUBMIT_TEXT"; request: PTTextPresentationRequest }
  | { type: "SUBMIT_AUDIO"; request: PTAudioPresentationRequest };
type QuestionAction = { type: "NEXT" }
  | { type: "ANSWER_TEXT"; question: PTQuestion; request: PTTextAnswerRequest }
  | { type: "ANSWER_AUDIO"; question: PTQuestion; request: PTAudioAnswerRequest };
type Action = SessionAction | QuestionAction;
function isQuestionAction(action: Action): action is QuestionAction {
  return action.type === "NEXT" || action.type === "ANSWER_TEXT" || action.type === "ANSWER_AUDIO";
}
interface SessionState {
  scope: number | undefined;
  session: PTSession | null;
  receivedAt: number;
  isLoading: boolean;
  error: string | null;
  busy: Action["type"] | null;
  actionError: string | null;
  failedAction: Action | null;
  questions: PTQuestionProgress | null;
  questionError: string | null;
}
interface Operations {
  load: () => Promise<PTSession | null>;
  mutate: (action: Action) => Promise<boolean>;
  retryAction: () => Promise<boolean>;
  readQuestions: () => Promise<PTQuestionProgress | null>;
  peekQuestions: () => PTQuestionProgress | null;
  clearQuestionErrors: () => void;
}

const initialState: SessionState = {
  scope: undefined, session: null, receivedAt: 0, isLoading: true, error: null,
  busy: null, actionError: null, failedAction: null,
  questions: null, questionError: null,
};

function actionApplied(action: SessionAction, session: PTProgress) {
  if (action.type === "TRACK") return session.phase === "PREPARING" && session.track === action.track;
  if (action.type === "START") return session.phase === "PRESENTING";
  if (action.type === "SUBMIT_TEXT" || action.type === "SUBMIT_AUDIO") {
    return session.status === "IN_PROGRESS" && !!session.presentation &&
      ["GENERATING", "QUESTIONING"].includes(session.phase) &&
      session.presentation.inputType === (action.type === "SUBMIT_TEXT" ? "TEXT" : "AUDIO");
  }
  return session.phase === "CANCELLED" && session.status === "CANCELLED";
}

export default function usePTSession(sessionId: number | undefined) {
  const [state, setState] = useState<SessionState>(() => ({ ...initialState, scope: sessionId }));
  const operations = useRef<Operations | null>(null);

  useEffect(() => {
    let active = true;
    let current: PTSession | null = null;
    let busy: Action["type"] | null = null;
    let failedAction: Action | null = null;
    let revision = 0;
    let readController: AbortController | null = null;
    let mutationController: AbortController | null = null;
    let reading: Promise<PTSession | null> | null = null;
    let questions: PTQuestionProgress | null = null;
    let questionController: AbortController | null = null;
    let questionReading: Promise<PTQuestionProgress | null> | null = null;
    const version = getAuthVersion();
    const owner = getAuthSessionIdentity();
    setState({ ...initialState, scope: sessionId });

    const sameAuth = () => version === getAuthVersion() && owner !== null && owner === getAuthSessionIdentity();
    const invalidateAuth = () => {
      current = null;
      setState({ ...initialState, scope: sessionId, isLoading: false, error: "이 면접을 시작한 계정의 인증이 필요합니다. 로그인하거나 새 면접을 시작해 주세요." });
    };
    const updateSession = (session: PTSession) => {
      current = session;
      if (session.phase === "CANCELLED" && questions) {
        questions = { ...questions, status: session.status, phase: session.phase, processing: false, question: null, nextAction: "NONE" };
      }
      const receivedAt = performance.now();
      setState((previous) => ({ ...previous, session, questions, receivedAt, isLoading: false, error: null }));
    };
    const updateQuestions = (data: PTQuestionProgress) => {
      if (!current) return;
      questions = data;
      current = { ...current, status: data.status, phase: data.phase, nextAction: data.nextAction };
      const answerResolved = (failedAction?.type === "ANSWER_TEXT" || failedAction?.type === "ANSWER_AUDIO") && data.answeredCount >= failedAction.question.ordinal;
      if (answerResolved) failedAction = null;
      setState((previous) => ({ ...previous, session: current, questions: data, questionError: null,
        ...(answerResolved ? { actionError: null, failedAction: null } : {}),
      }));
    };
    const terminalFailure = (failure: unknown) => isAxiosError(failure) && [401, 403, 404, 410].includes(failure.response?.status ?? 0);

    const load = (duringMutation = false): Promise<PTSession | null> => {
      if (!active || (busy && !duringMutation) || questionReading) return Promise.resolve(null);
      if (reading) return reading;
      if (!sessionId) {
        setState({ ...initialState, scope: sessionId, isLoading: false, error: "PT 세션 주소를 확인해 주세요. 면접 설정에서 다시 시작할 수 있어요." });
        return Promise.resolve(null);
      }
      if (!sameAuth()) {
        invalidateAuth();
        return Promise.resolve(null);
      }
      const requestRevision = revision;
      const controller = new AbortController();
      readController = controller;
      setState((previous) => ({ ...previous, isLoading: !current, error: null }));
      const promise = (async () => {
        try {
          const data = await ptApi.getSession(sessionId, controller.signal);
          if (!active || controller.signal.aborted || requestRevision !== revision) return null;
          if (!sameAuth()) { invalidateAuth(); return null; }
          if (data.sessionId !== sessionId) throw new Error("요청한 PT 면접과 응답이 일치하지 않습니다.");
          updateSession(data);
          completePTCreation(sessionId);
          return data;
        } catch (failure) {
          if (!active || controller.signal.aborted || requestRevision !== revision) return null;
          if (!sameAuth()) { invalidateAuth(); return null; }
          if (isCancel(failure)) return null;
          if (terminalFailure(failure)) current = null;
          setState((previous) => ({ ...previous, session: current, error: ptErrorMessage(failure, "PT 면접을 불러오지 못했습니다. 다시 불러와 주세요.") }));
          return null;
        } finally {
          if (readController === controller) {
            reading = null;
            readController = null;
            if (active && requestRevision === revision) setState((previous) => ({ ...previous, isLoading: false }));
          }
        }
      })();
      reading = promise;
      return promise;
    };

    const readQuestions = (duringMutation = false): Promise<PTQuestionProgress | null> => {
      if (!active || !sessionId || !current || (busy && !duringMutation) || reading) return Promise.resolve(null);
      if (questionReading) return questionReading;
      if (!sameAuth()) { invalidateAuth(); return Promise.resolve(null); }
      const requestRevision = revision;
      const controller = new AbortController();
      questionController = controller;
      const promise = (async () => {
        try {
          const data = await ptApi.getCurrentQuestion(sessionId, controller.signal);
          if (!active || controller.signal.aborted || requestRevision !== revision) return null;
          if (!sameAuth()) { invalidateAuth(); return null; }
          updateQuestions(data);
          return data;
        } catch (failure) {
          if (!active || controller.signal.aborted || requestRevision !== revision) return null;
          if (!sameAuth()) { invalidateAuth(); return null; }
          if (isCancel(failure)) return null;
          const message = ptErrorMessage(failure, "현재 질문을 확인하지 못했어요. 상태를 다시 확인해 주세요.");
          if (terminalFailure(failure)) {
            current = null;
            setState((previous) => ({ ...previous, session: null, error: message }));
          } else setState((previous) => ({ ...previous, questionError: message }));
          return null;
        } finally {
          if (questionController === controller) {
            questionController = null;
            questionReading = null;
          }
        }
      })();
      questionReading = promise;
      return promise;
    };

    const mutate = async (action: Action): Promise<boolean> => {
      if (!active || !sessionId || !current) return false;
      const interruptSubmission = action.type === "CANCEL" && !!busy && ["SUBMIT_TEXT", "SUBMIT_AUDIO", "NEXT", "ANSWER_TEXT", "ANSWER_AUDIO"].includes(busy);
      if (busy && !interruptSubmission) return false;
      if (interruptSubmission) {
        mutationController?.abort();
        mutationController = null;
        busy = null;
      }
      if (!sameAuth()) { invalidateAuth(); return false; }
      const trackState = ptSessionTrackState(current);
      const allowed = isQuestionAction(action)
        ? action.type === "NEXT"
          ? ["IN_PROGRESS", "COMPLETED", "ANALYZING"].includes(current.status) && ["GENERATING", "QUESTIONING", "COMPLETED"].includes(current.phase) && !questions?.processing
          : ["IN_PROGRESS", "COMPLETED", "ANALYZING"].includes(current.status) && ["GENERATING", "QUESTIONING", "COMPLETED"].includes(current.phase)
        : action.type === "CANCEL"
        ? ["IN_PROGRESS", "CANCELLED"].includes(current.status)
        : current.status === "IN_PROGRESS" && (action.type === "SUBMIT_TEXT" || action.type === "SUBMIT_AUDIO"
          ? current.phase === "PRESENTING" || (!!current.presentation && ["GENERATING", "QUESTIONING"].includes(current.phase))
          : action.type === "TRACK" ? current.phase === "PREPARING" && trackState.settings.trackSelectionRequired && trackState.settings.allowedTracks.includes(action.track)
            : ["PREPARING", "PRESENTING"].includes(current.phase) && trackState.ready);
      if (!allowed) {
        setState((previous) => ({ ...previous, actionError: "현재 면접 상태에서는 이 작업을 진행할 수 없어요. 상태를 다시 확인해 주세요." }));
        return false;
      }

      revision++;
      readController?.abort();
      readController = null;
      reading = null;
      questionController?.abort();
      questionController = null;
      questionReading = null;
      busy = action.type;
      failedAction = null;
      const controller = new AbortController();
      mutationController = controller;
      setState((previous) => ({ ...previous, busy, isLoading: false, actionError: null, questionError: null, failedAction: null }));
      let reconcile = false;
      let succeeded = false;
      try {
        if (isQuestionAction(action)) {
          const progress = action.type === "NEXT"
            ? await ptApi.generateNextQuestion(sessionId, controller.signal)
            : action.type === "ANSWER_TEXT"
              ? (await ptApi.submitTextAnswer(sessionId, action.question.questionId, action.request, controller.signal)).progress
              : (await ptApi.submitAudioAnswer(sessionId, action.question.questionId, action.request, controller.signal)).progress;
          if (!active || controller.signal.aborted) return false;
          if (!sameAuth()) { invalidateAuth(); return false; }
          updateQuestions(progress);
        } else {
          const progress = action.type === "SUBMIT_TEXT"
            ? await ptApi.submitTextPresentation(sessionId, action.request, controller.signal)
            : action.type === "SUBMIT_AUDIO"
              ? await ptApi.submitAudioPresentation(sessionId, action.request, controller.signal, trackState.settings.presentationSeconds)
              : action.type === "TRACK"
                ? await ptApi.selectTrack(sessionId, action.track, controller.signal)
                : action.type === "START"
                  ? await ptApi.startPresentation(sessionId, controller.signal)
                  : await ptApi.cancelSession(sessionId, controller.signal);
          if (!active || controller.signal.aborted) return false;
          if (!sameAuth()) { invalidateAuth(); return false; }
          updateSession(mergePTSessionProgress(current, progress));
          if (!actionApplied(action, progress)) throw new Error("PT 면접 상태가 변경됐어요. 상태를 다시 확인해 주세요.");
        }
        succeeded = true;
      } catch (failure) {
        if (!active || controller.signal.aborted) return false;
        if (!sameAuth()) { invalidateAuth(); return false; }
        if (isCancel(failure)) return false;
        failedAction = action;
        const message = ptErrorMessage(failure, "요청을 완료하지 못했어요. 같은 작업을 다시 시도해 주세요.");
        if (terminalFailure(failure) && !(isQuestionAction(action) && isAxiosError(failure) && failure.response?.status === 404)) {
          current = null;
          failedAction = null;
          setState((previous) => ({ ...previous, session: null, error: message, actionError: null, failedAction: null }));
        } else {
          setState((previous) => ({ ...previous, actionError: message, failedAction: action }));
          reconcile = !isAxiosError(failure) || !failure.response || failure.response.status === 409 || (isQuestionAction(action) && failure.response.status === 404);
        }
      } finally {
        if (mutationController === controller) {
          if (reconcile && active && !controller.signal.aborted) {
            if (isQuestionAction(action)) {
              const latest = await readQuestions(true);
              if (active && latest && action.type === "NEXT" && (latest.processing || !!latest.question || latest.phase === "COMPLETED")) {
                failedAction = null;
                setState((previous) => ({ ...previous, actionError: null, failedAction: null }));
                succeeded = true;
              }
            } else {
              const latest = await load(true);
              if (active && latest && action.type !== "SUBMIT_TEXT" && action.type !== "SUBMIT_AUDIO" && actionApplied(action, latest)) {
                failedAction = null;
                setState((previous) => ({ ...previous, actionError: null, failedAction: null }));
                succeeded = true;
              }
            }
          }
          mutationController = null;
          busy = null;
          if (active) setState((previous) => ({ ...previous, busy: null }));
        }
      }
      return active && succeeded;
    };

    operations.current = {
      load, mutate, readQuestions, peekQuestions: () => questions,
      clearQuestionErrors: () => {
        if (failedAction?.type === "NEXT") failedAction = null;
        setState((previous) => ({ ...previous, actionError: null, questionError: null, failedAction }));
      },
      retryAction: () => failedAction ? mutate(failedAction) : Promise.resolve(false),
    };
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void load().then((data) => {
        if (active && data && ["GENERATING", "QUESTIONING", "COMPLETED"].includes(data.phase)) void readQuestions();
      });
    };
    void load();
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      active = false;
      operations.current = null;
      readController?.abort();
      questionController?.abort();
      mutationController?.abort();
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [sessionId]);

  const retry = useCallback(() => operations.current?.load() ?? Promise.resolve(null), []);
  const selectTrack = useCallback((track: PTTrack) => operations.current?.mutate({ type: "TRACK", track }) ?? Promise.resolve(false), []);
  const startPresentation = useCallback(() => operations.current?.mutate({ type: "START" }) ?? Promise.resolve(false), []);
  const cancelSession = useCallback(() => operations.current?.mutate({ type: "CANCEL" }) ?? Promise.resolve(false), []);
  const submitTextPresentation = useCallback((request: PTTextPresentationRequest) => operations.current?.mutate({ type: "SUBMIT_TEXT", request }) ?? Promise.resolve(false), []);
  const submitAudioPresentation = useCallback((request: PTAudioPresentationRequest) => operations.current?.mutate({ type: "SUBMIT_AUDIO", request }) ?? Promise.resolve(false), []);
  const retryAction = useCallback(() => operations.current?.retryAction() ?? Promise.resolve(false), []);
  const readQuestions = useCallback(() => operations.current?.readQuestions() ?? Promise.resolve(null), []);
  const generateNextQuestion = useCallback(async () => {
    const current = operations.current;
    return current && await current.mutate({ type: "NEXT" }) ? current.peekQuestions() : null;
  }, []);
  const submitTextAnswer = useCallback((question: PTQuestion, request: PTTextAnswerRequest) => operations.current?.mutate({ type: "ANSWER_TEXT", question, request }) ?? Promise.resolve(false), []);
  const submitAudioAnswer = useCallback((question: PTQuestion, request: PTAudioAnswerRequest) => operations.current?.mutate({ type: "ANSWER_AUDIO", question, request }) ?? Promise.resolve(false), []);
  const clearQuestionErrors = useCallback(() => operations.current?.clearQuestionErrors(), []);
  return { ...(state.scope === sessionId ? state : { ...initialState, scope: sessionId }), retry, selectTrack, startPresentation, cancelSession, retryAction, submitTextPresentation, submitAudioPresentation,
    readQuestions, generateNextQuestion, submitTextAnswer, submitAudioAnswer, clearQuestionErrors,
  };
}
