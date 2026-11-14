import { useCallback, useEffect, useRef, useState } from "react";
import type usePTPage from "@/hooks/usePTPage";

export default function usePTQuestions(flow: ReturnType<typeof usePTPage>) {
  const { session, questions, busy, actionError, questionError, exitOpen, isExpired,
    readQuestions, generateNextQuestion, clearQuestionErrors } = flow;
  const [retryCount, setRetryCount] = useState(0);
  const [waitError, setWaitError] = useState<string | null>(null);
  const wait = useRef({ key: "", startedAt: 0 });
  const key = `${session?.sessionId}:${questions?.answeredCount ?? 0}`;
  const phase = session?.phase;
  const enabled = !!session && ["GENERATING", "QUESTIONING", "COMPLETED"].includes(session.phase) && !isExpired;

  useEffect(() => {
    if (wait.current.key !== key) {
      wait.current = { key, startedAt: performance.now() };
      setWaitError(null);
    }
  }, [key]);

  useEffect(() => {
    if (busy === "NEXT" || busy === "ANSWER_TEXT" || busy === "ANSWER_AUDIO") wait.current.startedAt = performance.now();
  }, [busy]);

  useEffect(() => {
    if (questions && !questions.processing && ((questions.nextAction === "ANSWER" && questions.question) || questions.phase === "COMPLETED")) setWaitError(null);
  }, [questions?.processing, questions?.question?.questionId, questions?.nextAction, questions?.phase]);

  useEffect(() => {
    if (!enabled || busy || exitOpen || questionError || waitError || (actionError && !questions?.processing)) return;
    if (questions && questions.phase === phase && !questions.processing &&
      ((questions.nextAction === "ANSWER" && questions.question) || questions.nextAction === "FINISH" || questions.nextAction === "NONE")) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (milliseconds = 3000) => {
      if (active) timer = setTimeout(() => { void pump(); }, milliseconds);
    };
    const pump = async () => {
      if (!active) return;
      if (performance.now() - wait.current.startedAt > 210_000) {
        setWaitError("질문 또는 음성 처리가 지연되고 있어요. 상태를 다시 확인하거나 면접을 취소해 주세요.");
        return;
      }
      const current = await readQuestions();
      if (!active) return;
      if (!current) { schedule(500); return; }
      if (current.phase === "COMPLETED" || current.phase === "CANCELLED") return;
      if (current.processing) { schedule(); return; }
      if (current.nextAction === "ANSWER" && current.question) return;
      if (current.phase === "GENERATING" && current.nextAction === "GENERATE_QUESTION") {
        const generated = await generateNextQuestion();
        if (!active || !generated) return;
        if (generated.processing) schedule();
        else if (!generated.question && generated.phase !== "COMPLETED") {
          setWaitError("질문을 확인하지 못했어요. 상태를 다시 확인해 주세요.");
        }
      } else setWaitError("현재 면접 상태에서 질문을 확인할 수 없어요. 상태를 다시 확인해 주세요.");
    };
    void pump();
    return () => { active = false; clearTimeout(timer); };
  }, [enabled, phase, busy, questions?.answeredCount, actionError, questionError, exitOpen, waitError,
    retryCount, key, readQuestions, generateNextQuestion, questions?.phase, questions?.processing,
    questions?.nextAction, questions?.question?.questionId]);

  const retry = useCallback(() => {
    wait.current.startedAt = performance.now();
    clearQuestionErrors();
    setWaitError(null);
    setRetryCount((count) => count + 1);
  }, [clearQuestionErrors]);
  return { waitError, retry };
}
