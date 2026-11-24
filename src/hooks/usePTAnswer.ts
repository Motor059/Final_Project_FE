import { useCallback, useEffect, useRef, useState } from "react";
import type usePTPage from "@/hooks/usePTPage";
import usePTRecorder from "@/hooks/usePTRecorder";
import { getPTAnswerDraft, releasePTAnswerDraft } from "@/lib/ptAnswerDraft";
import { getPTInputMode, PT_TEXT_MAX_LENGTH, setPTInputMode, setPTTextMode } from "@/lib/ptPresentation";
import type { PTAnswerRequest, PTQuestion } from "@/types/pt";

export default function usePTAnswer(sessionId: number, question: PTQuestion, flow: ReturnType<typeof usePTPage>, ready: boolean) {
  const [text, setText] = useState(() => getPTAnswerDraft(sessionId, question).text);
  const [mode, setMode] = useState(() => getPTInputMode(sessionId));
  const [textModeLocked, setTextModeLocked] = useState(() => getPTAnswerDraft(sessionId, question).textModeLocked);
  const [pending, setPending] = useState<PTAnswerRequest | null>(() => getPTAnswerDraft(sessionId, question).pending);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyWarning, setEmptyWarning] = useState(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  const working = useRef(false);
  const invalidateSubmission = useCallback(() => {
    generation.current++;
    working.current = false;
  }, []);
  const answerable = flow.questions?.phase === "QUESTIONING" && !flow.questions.processing &&
    flow.questions.question?.questionId === question.questionId && flow.questions.nextAction === "ANSWER";
  const recorder = usePTRecorder(ready && answerable && mode === "AUDIO" && !pending && (!flow.busy || flow.busy === "CANCEL") && !flow.isExpired, Infinity, Infinity);

  useEffect(() => {
    mounted.current = true;
    working.current = false;
    return () => { mounted.current = false; invalidateSubmission(); };
  }, [invalidateSubmission]);
  const changeText = (value: string) => {
    if (pending || preparing || flow.busy) return;
    const draft = getPTAnswerDraft(sessionId, question);
    draft.text = value.slice(0, PT_TEXT_MAX_LENGTH);
    setText(draft.text);
    setError(null);
  };
  const switchToText = () => {
    if (!ready || !answerable || mode !== "AUDIO" || pending || preparing || flow.busy || flow.exitOpen) return;
    recorder.discard();
    const draft = getPTAnswerDraft(sessionId, question);
    draft.textModeLocked = true;
    setTextModeLocked(true);
    setPTTextMode(sessionId);
    setMode("TEXT");
    setError(null);
  };
  const switchToAudio = () => {
    if (!ready || !answerable || mode !== "TEXT" || textModeLocked || pending || preparing || flow.busy || flow.exitOpen) return;
    setPTInputMode(sessionId, "AUDIO");
    setMode("AUDIO");
    setError(null);
  };
  const submit = async () => {
    if (!ready || !answerable || working.current || flow.busy || flow.exitOpen || flow.isExpired) return;
    const draft = getPTAnswerDraft(sessionId, question);
    if (!draft.pending && mode === "TEXT" && !text.trim()) { setEmptyWarning(true); return; }
    working.current = true;
    const attempt = ++generation.current;
    setPreparing(true);
    setError(null);
    try {
      let request = draft.pending;
      if (!request) {
        if (mode === "TEXT") request = { inputType: "TEXT", request: { requestId: crypto.randomUUID(), transcript: text.trim() } };
        else {
          const recording = await recorder.stop();
          if (!mounted.current || attempt !== generation.current) return;
          request = { inputType: "AUDIO", request: { requestId: crypto.randomUUID(), ...recording } };
        }
        draft.pending = request;
        setPending(request);
      }
      const succeeded = request.inputType === "TEXT"
        ? await flow.submitTextAnswer(question, request.request)
        : await flow.submitAudioAnswer(question, request.request);
      if (succeeded) releasePTAnswerDraft(sessionId, question.ordinal);
      if (!mounted.current || attempt !== generation.current) return;
      if (succeeded) setPending(null);
    } catch (failure) {
      if (!mounted.current || attempt !== generation.current) return;
      setError(failure instanceof Error ? failure.message : "답변을 준비하지 못했어요. 다시 시도해 주세요.");
    } finally {
      if (mounted.current && attempt === generation.current) { working.current = false; setPreparing(false); }
    }
  };
  const abortForCancel = useCallback(() => {
    invalidateSubmission();
    setPreparing(false);
  }, [invalidateSubmission]);
  return { text, mode, textModeLocked, pending, preparing, error, emptyWarning, recorder, changeText, switchToText, switchToAudio, submit, abortForCancel,
    closeEmptyWarning: () => setEmptyWarning(false),
  };
}
