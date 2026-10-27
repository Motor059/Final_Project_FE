import { create } from 'zustand';
import { interviewApi } from '@/api/interviewApi';
import type { CurrentQuestionData } from '@/api/api';
import { isAxiosError } from 'axios';
import { useAlertStore } from '@/store/useAlertStore';

const ANSWER_SECONDS = 180;

export interface AudioRecordingResult {
  blob: Blob;
  durationSeconds: number;
}
type StopAudioRecording = () => Promise<AudioRecordingResult>;

interface PendingAnswer {
  questionId: number;
  transcript: string;
  recording: AudioRecordingResult | null;
}

interface InterviewState {
  sessionId: number | null;
  currentQuestion: CurrentQuestionData | null;
  currentMainIndex: number;
  phase: 'PREPARING' | 'ASKING' | 'RECORDING' | 'THINKING';
  inputMode: 'AUDIO' | 'TEXT';
  answerText: string;
  timeLeft: number;
  isFinished: boolean;
  isSubmitting: boolean;
  isSkipping: boolean;
  skipError: string | null;
  recordingAttempt: number;
  questionError: string | null;
  isSessionUnavailable: boolean;
  stopAudioRecording: StopAudioRecording | null;
  isExitModalOpen: boolean;
  exitTargetPath: string;
  isPaused: boolean;
  audioStatus: 'IDLE' | 'REQUESTING' | 'READY' | 'ERROR';
  audioError: string | null;
  questionAudioEnabled: boolean;
  questionPresented: boolean;
  questionTextPresented: boolean;
  questionSpeechPresented: boolean;
  questionSpeechError: string | null;
  pendingAnswer: PendingAnswer | null;
  answerError: string | null;

  setSessionId: (id: number) => void;
  setPhase: (phase: InterviewState['phase']) => void;
  setInputMode: (mode: InterviewState['inputMode']) => void;
  setAnswerText: (text: string) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  setStopAudioRecording: (handler: StopAudioRecording | null) => void;
  setExitModalOpen: (isOpen: boolean) => void;
  setExitTargetPath: (path: string) => void;
  setPaused: (paused: boolean) => void;
  setAudioStatus: (status: InterviewState['audioStatus']) => void;
  failAudio: (message: string) => void;
  setQuestionAudioEnabled: (enabled: boolean) => void;
  completeQuestionPresentation: (questionId: number, attempt: number, source: 'TEXT' | 'SPEECH') => void;
  setQuestionSpeechError: (message: string | null) => void;
  restartAnswer: () => void;
  resetInterview: () => void;
  detachInterview: () => void;
  startAndFetchFirstQuestion: (sessionId: number) => Promise<void>;
  fetchNextQuestion: (preserveCurrentAnswer?: boolean) => Promise<void>;
  retryQuestion: () => Promise<void>;
  submitAnswerAndNext: (retryPending?: boolean) => Promise<void>;
  skipCurrentQuestion: (reason?: 'MANUAL' | 'TIMEOUT') => Promise<void>;
  cancelCurrentSession: () => Promise<void>;
}

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message || fallback;
  }
  return fallback;
}

const initialState = {
  sessionId: null,
  currentQuestion: null,
  currentMainIndex: 1,
  phase: 'PREPARING' as const,
  inputMode: 'AUDIO' as const,
  answerText: '',
  timeLeft: ANSWER_SECONDS,
  isFinished: false,
  isSubmitting: false,
  isSkipping: false,
  skipError: null,
  recordingAttempt: 0,
  questionError: null,
  isSessionUnavailable: false,
  stopAudioRecording: null,
  isExitModalOpen: false,
  exitTargetPath: '',
  isPaused: false,
  audioStatus: 'IDLE' as const,
  audioError: null,
  questionAudioEnabled: localStorage.getItem('questionAudioEnabled') === 'true',
  questionPresented: false,
  questionTextPresented: false,
  questionSpeechPresented: false,
  questionSpeechError: null,
  pendingAnswer: null,
  answerError: null,
};

let interviewVersion = 0;
let interviewController: AbortController | null = null;
let initialization: { sessionId: number; version: number; promise: Promise<void> } | null = null;
const inactiveStatuses = new Set(['COMPLETED', 'CANCELLED', 'CANCELED', 'FAILED']);

export const useInterviewStore = create<InterviewState>((set, get) => ({
  ...initialState,
  setSessionId: (id) => set({ sessionId: id }),
  setPhase: (phase) => {
    if (phase === 'RECORDING' && (get().phase !== 'ASKING' || get().isFinished || get().isSubmitting || get().isPaused || !get().questionPresented)) return;
    set({ phase });
  },
  setInputMode: (mode) => {
    const state = get();
    if (state.phase !== 'RECORDING' || state.isSubmitting || state.isFinished || state.isPaused) return;
    if (state.inputMode === 'TEXT' && mode === 'AUDIO') return;
    set({ inputMode: mode });
  },
  setAnswerText: (text) => set({ answerText: text }),
  setTimeLeft: (time) => set((state) => ({
    timeLeft: Math.max(0, typeof time === 'function' ? time(state.timeLeft) : time),
  })),
  setStopAudioRecording: (handler) => set({ stopAudioRecording: handler }),
  setExitModalOpen: (isOpen) => set({ isExitModalOpen: isOpen }),
  setExitTargetPath: (path) => set({ exitTargetPath: path }),
  setPaused: (paused) => {
    const state = get();
    set({ isPaused: paused });
    if (!paused && state.phase === 'ASKING' && state.questionPresented && !state.isFinished && !state.questionError) {
      set({ phase: 'RECORDING' });
    }
  },
  setAudioStatus: (status) => set({ audioStatus: status }),
  failAudio: (message) => set({ audioStatus: 'ERROR', audioError: message, inputMode: 'TEXT', stopAudioRecording: null }),
  setQuestionAudioEnabled: (enabled) => {
    localStorage.setItem('questionAudioEnabled', String(enabled));
    set({ questionAudioEnabled: enabled });
  },
  completeQuestionPresentation: (questionId, attempt, source) => {
    const state = get();
    if (state.phase !== 'ASKING' || state.currentQuestion?.questionId !== questionId || state.recordingAttempt !== attempt || state.isFinished || state.questionError) return;
    const questionTextPresented = state.questionTextPresented || source === 'TEXT';
    const questionSpeechPresented = state.questionSpeechPresented || source === 'SPEECH';
    const questionPresented = questionTextPresented && questionSpeechPresented;
    set({
      questionTextPresented,
      questionSpeechPresented,
      questionPresented,
      phase: questionPresented && !state.isPaused ? 'RECORDING' : 'ASKING',
    });
  },
  setQuestionSpeechError: (message) => set({ questionSpeechError: message }),
  restartAnswer: () => {
    const state = get();
    if (!state.pendingAnswer || state.isSubmitting || state.isPaused || state.questionError || state.isFinished) return;
    set({
      phase: 'RECORDING', pendingAnswer: null, answerError: null,
      answerText: state.inputMode === 'TEXT' ? state.answerText : '',
      timeLeft: ANSWER_SECONDS, recordingAttempt: state.recordingAttempt + 1,
      audioStatus: 'IDLE', stopAudioRecording: null,
    });
  },
  resetInterview: () => {
    interviewController?.abort();
    interviewController = null;
    interviewVersion++;
    initialization = null;
    set({ ...initialState, questionAudioEnabled: get().questionAudioEnabled });
  },
  detachInterview: () => {
    interviewController?.abort();
    interviewController = null;
    interviewVersion++;
    initialization = null;
    set({ stopAudioRecording: null, isSubmitting: false, isSkipping: false, isPaused: false, audioStatus: 'IDLE' });
  },

  startAndFetchFirstQuestion: (sessionId) => {
    if (initialization?.sessionId === sessionId && initialization.version === interviewVersion) return initialization.promise;
    get().resetInterview();
    interviewController = new AbortController();
    const signal = interviewController.signal;
    set({ sessionId });
    const version = interviewVersion;
    const isCurrent = () => version === interviewVersion && get().sessionId === sessionId;
    const promise = (async () => {
      try {
        let session = await interviewApi.getSessionInfo(sessionId, signal);
        if (!isCurrent()) return;
        let status = session.status.trim().toUpperCase();
        if (status === 'READY') {
          try {
            await interviewApi.startSession(sessionId);
            if (!isCurrent()) return;
            status = 'IN_PROGRESS';
          } catch (error) {
            if (!isCurrent()) return;
            if (!isAxiosError(error) || error.response?.status !== 409) throw error;
            session = await interviewApi.getSessionInfo(sessionId, signal);
            if (!isCurrent()) return;
            status = session.status.trim().toUpperCase();
            if (status !== 'IN_PROGRESS' && status !== 'COMPLETED') throw error;
          }
        }
        if (status === 'IN_PROGRESS') {
          await get().fetchNextQuestion();
        } else if (status === 'COMPLETED') {
          set({ isFinished: true, isSubmitting: false });
        } else {
          set({
            phase: 'THINKING',
            isSessionUnavailable: inactiveStatuses.has(status),
            questionError: '이 면접은 현재 진행할 수 없습니다. 상태를 다시 확인하거나 새 면접을 설정해 주세요.',
          });
        }
      } catch (error) {
        if (!isCurrent()) return;
        const missing = isAxiosError(error) && error.response?.status === 404;
        set({
          phase: 'THINKING', isSubmitting: false, isSessionUnavailable: missing,
          questionError: errorMessage(error, '면접 상태를 확인하지 못했습니다. 다시 시도해 주세요.'),
        });
      } finally {
        if (initialization?.version === version && initialization.sessionId === sessionId) initialization = null;
      }
    })();
    initialization = { sessionId, version, promise };
    return promise;
  },

  fetchNextQuestion: async (preserveCurrentAnswer = false) => {
    const { sessionId, currentMainIndex, currentQuestion } = get();
    if (!sessionId) return;
    const version = interviewVersion;
    set({ questionError: null });
    try {
      const questionData = await interviewApi.getCurrentQuestion(sessionId, interviewController?.signal);
      if (version !== interviewVersion || get().sessionId !== sessionId) return;
      if (!Number.isSafeInteger(questionData.questionId) || typeof questionData.content !== 'string' || !questionData.content.trim()) {
        throw new Error('질문 정보를 확인하지 못했습니다. 다시 불러와 주세요.');
      }
      if (preserveCurrentAnswer && questionData.questionId === currentQuestion?.questionId) {
        set({ phase: get().pendingAnswer ? 'THINKING' : 'RECORDING', isSubmitting: false, isSkipping: false });
        return;
      }
      const nextMainIndex = questionData.type === 'MAIN'
        ? questionData.mainProgress?.current ?? questionData.seq ?? questionData.mainOrder ?? currentMainIndex
        : currentMainIndex;
      set({
        currentQuestion: questionData,
        currentMainIndex: nextMainIndex,
        phase: 'ASKING',
        inputMode: get().inputMode,
        answerText: '',
        timeLeft: ANSWER_SECONDS,
        isSubmitting: false,
        isSkipping: false,
        skipError: null,
        isFinished: false,
        recordingAttempt: get().recordingAttempt + 1,
        stopAudioRecording: null,
        questionError: null,
        isSessionUnavailable: false,
        audioStatus: 'IDLE', audioError: null,
        questionPresented: false, questionTextPresented: false, questionSpeechPresented: false, questionSpeechError: null,
        pendingAnswer: null, answerError: null,
      });
    } catch (error) {
      if (version !== interviewVersion || get().sessionId !== sessionId) return;
      if (isAxiosError(error) && error.response?.status === 409) {
        try {
          const session = await interviewApi.getSessionInfo(sessionId, interviewController?.signal);
          if (version !== interviewVersion || get().sessionId !== sessionId) return;
          const status = session.status.trim().toUpperCase();
          if (status === 'COMPLETED') {
            set({ phase: 'THINKING', isFinished: true, isSubmitting: false, isSkipping: false, skipError: null, pendingAnswer: null, answerError: null });
            return;
          }
          set({
            phase: 'THINKING', isSubmitting: false, isSkipping: false,
            isSessionUnavailable: inactiveStatuses.has(status),
            questionError: error.response?.data?.message || '면접 상태가 맞지 않아 질문을 불러올 수 없습니다. 다시 시도해 주세요.',
          });
          return;
        } catch (statusError) {
          if (version !== interviewVersion || get().sessionId !== sessionId) return;
          console.warn('충돌 후 면접 상태 조회 실패:', statusError);
        }
      }
      set({
        phase: 'THINKING',
        isSubmitting: false,
        isSkipping: false,
        isSessionUnavailable: isAxiosError(error) && error.response?.status === 404,
        questionError: preserveCurrentAnswer
          ? '면접 진행 상태를 확인하지 못했습니다. 현재 질문을 다시 불러온 뒤 계속해 주세요.'
          : errorMessage(error, '다음 질문을 불러오지 못했습니다. 다시 시도해 주세요.'),
      });
    }
  },

  retryQuestion: async () => {
    const { sessionId, currentQuestion, isSubmitting, isFinished, isPaused, isSessionUnavailable } = get();
    if (!sessionId || isSubmitting || isFinished || isPaused || isSessionUnavailable) return;
    set({ phase: 'THINKING', isSubmitting: true, isSkipping: false });
    if (currentQuestion) await get().fetchNextQuestion(!!get().pendingAnswer || (get().timeLeft === 0 && !!get().skipError));
    else await get().startAndFetchFirstQuestion(sessionId);
  },

  submitAnswerAndNext: async (retryPending = false) => {
    const state = get();
    const { sessionId, currentQuestion, inputMode, answerText, stopAudioRecording } = state;
    if (!sessionId || !currentQuestion || state.isSubmitting || state.isFinished || state.isPaused || state.isExitModalOpen || useAlertStore.getState().isOpen) return;
    if (retryPending ? !state.pendingAnswer || !!state.questionError : state.phase !== 'RECORDING') return;
    if (!retryPending && state.timeLeft === 0) {
      await get().skipCurrentQuestion('TIMEOUT');
      return;
    }
    if (!retryPending && inputMode === 'TEXT' && !answerText.trim()) {
      useAlertStore.getState().showAlert('답변이 너무 짧습니다. 내용을 입력해 주세요.');
      return;
    }
    if (!retryPending && inputMode === 'AUDIO' && state.audioStatus !== 'READY') return;

    const version = interviewVersion;
    const questionId = currentQuestion.questionId;
    const isCurrent = () => version === interviewVersion && get().sessionId === sessionId && get().currentQuestion?.questionId === questionId;
    let prepared = retryPending ? state.pendingAnswer : null;
    set({ isSubmitting: true, skipError: null, answerError: retryPending ? state.answerError : null });
    try {
      if (retryPending) {
        await get().fetchNextQuestion(true);
        if (!isCurrent() || get().pendingAnswer !== prepared || get().questionError || get().isFinished) return;
        set({ isSubmitting: true });
      } else {
        let recording: AudioRecordingResult | null = null;
        if (inputMode === 'AUDIO') {
          if (!stopAudioRecording) throw new Error('마이크가 준비되지 않았습니다. 텍스트로 입력하거나 다시 시도해 주세요.');
          recording = await stopAudioRecording();
          if (!isCurrent()) return;
          if (!recording.blob.size) throw new Error('녹음된 음성이 없습니다. 다시 답변해 주세요.');
        }
        prepared = { questionId, transcript: answerText.trim(), recording };
        set({ pendingAnswer: prepared });
      }
      if (!isCurrent() || !prepared) return;
      if (get().isPaused || get().isExitModalOpen || useAlertStore.getState().isOpen) {
        set({ phase: 'THINKING', isSubmitting: false, answerError: '답변 제출이 일시정지됐습니다. 계속하려면 같은 답변 다시 제출을 눌러 주세요.' });
        return;
      }
      set({ phase: 'THINKING' });
      const result = prepared.recording
        ? await interviewApi.submitAudioAnswer(sessionId, questionId, prepared.recording.blob, prepared.recording.durationSeconds)
        : await interviewApi.submitTextAnswer(sessionId, questionId, prepared.transcript);
      if (!isCurrent()) return;
      if (result.nextAction.type === 'FINISH') {
        set({ phase: 'THINKING', isFinished: true, isSubmitting: false, pendingAnswer: null, answerError: null });
      } else if (result.nextAction.type === 'RETRY_INPUT') {
        set({ phase: 'RECORDING', isSubmitting: false, pendingAnswer: null, answerError: null, timeLeft: ANSWER_SECONDS, recordingAttempt: get().recordingAttempt + 1, audioStatus: 'IDLE', stopAudioRecording: null });
        useAlertStore.getState().showAlert(result.nextAction.message || '답변이 너무 짧거나 인식되지 않았습니다. 다시 답변해 주세요.');
      } else if (result.nextAction.type === 'FOLLOW_UP' || result.nextAction.type === 'NEXT_MAIN') {
        set({ pendingAnswer: null, answerError: null });
        await get().fetchNextQuestion();
      } else {
        throw new Error('답변 처리 응답을 확인하지 못했습니다.');
      }
    } catch (error) {
      if (!isCurrent()) return;
      const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
      if (prepared && type !== 'RETRY_INPUT' && type !== 'TOO_SHORT') {
        set({ phase: 'THINKING', answerError: `${errorMessage(error, '답변 처리 결과를 확인하지 못했습니다.')} 같은 답변을 다시 제출하거나 다시 답변해 주세요.` });
        await get().fetchNextQuestion(true);
        return;
      }
      set({
        phase: 'RECORDING', isSubmitting: false, pendingAnswer: null, answerError: null,
        timeLeft: prepared || state.timeLeft === 0 ? ANSWER_SECONDS : state.timeLeft,
        recordingAttempt: get().recordingAttempt + 1, audioStatus: 'IDLE', stopAudioRecording: null,
      });
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        useAlertStore.getState().showAlert(errorMessage(error, '답변 처리 중 문제가 발생했습니다. 다시 답변해 주세요.'));
      }
    }
  },

  skipCurrentQuestion: async (reason = 'MANUAL') => {
    const { currentQuestion, sessionId, isSubmitting, isFinished, isSessionUnavailable, questionError, phase, isPaused } = get();
    if (!sessionId || !currentQuestion || isSubmitting || isFinished || isSessionUnavailable || questionError || isPaused || get().isExitModalOpen || useAlertStore.getState().isOpen || phase !== 'RECORDING') return;
    if (reason === 'TIMEOUT' && get().timeLeft !== 0) return;
    const version = interviewVersion;
    set({ isSubmitting: true, isSkipping: true, skipError: null });
    try {
      const result = await interviewApi.skipTopic(sessionId, currentQuestion.questionId);
      if (version !== interviewVersion || get().sessionId !== sessionId) return;
      if (result.nextAction.type === 'FINISH') {
        set({ isFinished: true, isSubmitting: false, isSkipping: false, skipError: null });
      } else {
        set({ phase: 'THINKING', isSkipping: false });
        await get().fetchNextQuestion();
      }
    } catch (error) {
      if (version !== interviewVersion || get().sessionId !== sessionId) return;
      const status = isAxiosError(error) ? error.response?.status : undefined;
      console.error('질문 스킵 실패:', { sessionId, questionId: currentQuestion.questionId, status });
      const message = get().timeLeft === 0
        ? `답변 시간이 끝났지만 다음 질문으로 이동하지 못했습니다. ${errorMessage(error, '잠시 후 다시 시도해 주세요.')} 아래 버튼으로 다시 시도해 주세요.`
        : status !== undefined && status >= 500
          ? `스킵 요청에 서버 오류(${status})가 발생했습니다. 현재 질문에 계속 답변하거나 잠시 후 다시 시도해 주세요.`
          : `질문을 건너뛰지 못했습니다. ${errorMessage(error, '잠시 후 다시 시도해 주세요.')}`;
      set({ skipError: message });
      await get().fetchNextQuestion(true);
    }
  },

  cancelCurrentSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      await interviewApi.cancelSession(sessionId);
      if (get().sessionId === sessionId) get().resetInterview();
    } catch (error) {
      console.error('세션 폐기 에러:', error);
      if (isAxiosError(error) && error.response?.status === 404) {
        if (get().sessionId === sessionId) get().resetInterview();
        return;
      }
      if (isAxiosError(error) && error.response?.status === 409) {
        const session = await interviewApi.getSessionInfo(sessionId);
        if (inactiveStatuses.has(session.status.trim().toUpperCase())) {
          if (get().sessionId === sessionId) get().resetInterview();
          return;
        }
      }
      throw error;
    }
  },
}));
