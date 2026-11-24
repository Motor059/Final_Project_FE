import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type usePTPage from "@/hooks/usePTPage";
import usePTRecorder from "@/hooks/usePTRecorder";
import { getPTPresentationDraft, PT_TEXT_MAX_LENGTH, releasePTPresentationDraft, setPTTextMode } from "@/lib/ptPresentation";
import type { PTPresentationRequest, PTSession } from "@/types/pt";
import { resolvePTTaskSettings } from "@/lib/ptTaskSettings";

export default function usePTPresentation(session: PTSession, flow: ReturnType<typeof usePTPage>, confirmingText: boolean) {
  const [mode, setMode] = useState(() => getPTPresentationDraft(session.sessionId).mode);
  const [text, setText] = useState(() => getPTPresentationDraft(session.sessionId).text);
  const [pendingDraft, setPending] = useState<PTPresentationRequest | null>(() => getPTPresentationDraft(session.sessionId).pending);
  const presentationResolved = !!session.presentation || ["CANCELLED", "COMPLETED"].includes(session.phase);
  const pending = presentationResolved ? null : pendingDraft;
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emptyWarning, setEmptyWarning] = useState(false);
  const mounted = useRef(true);
  const working = useRef(false);
  const generation = useRef(0);
  const timedOut = useRef(false);
  const invalidateSubmission = useCallback(() => {
    generation.current++;
    working.current = false;
  }, []);
  const presenting = session.phase === "PRESENTING" && session.status === "IN_PROGRESS";
  const localDeadline = flow.receivedAt + Date.parse(session.presentationDeadline ?? "") - Date.parse(session.serverTime);
  const submissionClosed = flow.serverNow > Date.parse(session.presentationDeadline ?? "") + 60_000;
  const recorder = usePTRecorder(presenting && mode === "AUDIO" && !pending && !flow.isExpired, localDeadline, resolvePTTaskSettings(session.task.settings).presentationSeconds);

  useEffect(() => {
    mounted.current = true;
    working.current = false;
    return () => {
      mounted.current = false;
      invalidateSubmission();
      timedOut.current = false;
    };
  }, [invalidateSubmission]);

  useEffect(() => {
    if (presentationResolved) {
      releasePTPresentationDraft(session.sessionId);
    }
  }, [session.sessionId, presentationResolved]);

  const changeText = (value: string) => {
    if (pending || preparing || flow.busy || submissionClosed) return;
    const draft = getPTPresentationDraft(session.sessionId);
    draft.text = value.slice(0, PT_TEXT_MAX_LENGTH);
    setText(draft.text);
    setLocalError(null);
  };
  const switchToText = () => {
    if (pending || preparing || flow.busy || !presenting || submissionClosed) return;
    recorder.discard();
    setPTTextMode(session.sessionId);
    setMode("TEXT");
    setLocalError(null);
  };

  const submit = async () => {
    if (working.current || flow.busy || flow.exitOpen || confirmingText || !presenting || flow.isExpired) return;
    const draft = getPTPresentationDraft(session.sessionId);
    const previous = draft.pending;
    if (!previous && performance.now() > localDeadline + 60_000) {
      setLocalError("발표 제출 시간이 지났어요. 면접을 취소하고 새로 시작해 주세요.");
      return;
    }
    if (!previous && mode === "TEXT" && !text.trim()) {
      setEmptyWarning(true);
      return;
    }
    working.current = true;
    const attempt = ++generation.current;
    setPreparing(true);
    setLocalError(null);
    try {
      let request = previous;
      if (!request) {
        if (mode === "TEXT") {
          request = { inputType: "TEXT", request: { requestId: crypto.randomUUID(), transcript: text.trim() } };
        } else {
          const recording = await recorder.stop();
          if (!mounted.current || attempt !== generation.current) return;
          request = { inputType: "AUDIO", request: { requestId: crypto.randomUUID(), ...recording } };
        }
        draft.pending = request;
        setPending(request);
      }
      const succeeded = request.inputType === "TEXT"
        ? await flow.submitTextPresentation(request.request)
        : await flow.submitAudioPresentation(request.request);
      if (!mounted.current || attempt !== generation.current) return;
      if (succeeded) {
        releasePTPresentationDraft(session.sessionId);
        setPending(null);
      }
    } catch (failure) {
      if (!mounted.current || attempt !== generation.current) return;
      if (mode === "AUDIO" && !draft.pending) recorder.discard();
      setLocalError(failure instanceof Error ? failure.message : "발표 제출을 준비하지 못했어요. 다시 시도해 주세요.");
    } finally {
      if (mounted.current && attempt === generation.current) {
        working.current = false;
        setPreparing(false);
      }
    }
  };
  const submitOnTimeout = useEffectEvent(() => { void submit(); });

  useEffect(() => {
    if (!presenting || flow.remainingSeconds !== 0 || flow.busy || flow.exitOpen || confirmingText || timedOut.current || pending || flow.isExpired) return;
    timedOut.current = true;
    submitOnTimeout();
  }, [presenting, flow.remainingSeconds, flow.busy, flow.exitOpen, flow.isExpired, pending, confirmingText]);

  const abortForCancel = useCallback(() => {
    invalidateSubmission();
    setPreparing(false);
  }, [invalidateSubmission]);

  return {
    mode, text, changeText, pending, preparing, localError, emptyWarning,
    closeEmptyWarning: () => setEmptyWarning(false), switchToText, submit,
    recorder, submissionClosed, abortForCancel,
  };
}
