import { useEffect, useRef, useState } from "react";
import type { PTQuestion } from "@/types/pt";

export default function usePTQuestionPresentation(question: PTQuestion, paused: boolean) {
  const [text, setText] = useState("");
  const [typed, setTyped] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let active = true;
    let index = 0;
    let speechTimer: ReturnType<typeof setInterval> | undefined;
    let ownedUtterance: SpeechSynthesisUtterance | null = null;
    setText(""); setTyped(false); setSpoken(false); setSpeechError(null);
    const characters = Array.from(question.content);
    const typingTimer = setInterval(() => {
      if (!active || pausedRef.current) return;
      if (index === characters.length) { clearInterval(typingTimer); setTyped(true); return; }
      setText(characters.slice(0, ++index).join(""));
    }, 60);

    let enabled = false;
    try { enabled = localStorage.getItem("questionAudioEnabled") === "true"; } catch { /* 기본값은 끔이다. */ }
    const synthesis = "speechSynthesis" in window ? window.speechSynthesis : null;
    let finished = false;
    const finishSpeech = (message?: string) => {
      if (!active || finished) return;
      finished = true;
      clearInterval(speechTimer);
      if (ownedUtterance) { ownedUtterance.onend = null; ownedUtterance.onerror = null; }
      utteranceRef.current = null;
      if (message) { synthesis?.cancel(); setSpeechError(message); }
      setSpoken(true);
    };
    if (!enabled) finishSpeech();
    else if (!synthesis || typeof SpeechSynthesisUtterance === "undefined") finishSpeech("이 브라우저에서는 질문 음성을 재생할 수 없어요. 화면을 보고 답변해 주세요.");
    else {
      const utterance = new SpeechSynthesisUtterance(question.content);
      ownedUtterance = utterance;
      utteranceRef.current = utterance;
      utterance.lang = "ko-KR";
      const voice = synthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("ko"));
      if (voice) utterance.voice = voice;
      utterance.onend = () => finishSpeech();
      utterance.onerror = () => finishSpeech("질문 음성을 재생하지 못했어요. 화면을 보고 답변해 주세요.");
      synthesis.cancel();
      try {
        synthesis.speak(utterance);
        if (pausedRef.current) synthesis.pause(); else synthesis.resume();
      } catch { finishSpeech("질문 음성을 재생하지 못했어요. 화면을 보고 답변해 주세요."); }
      let remaining = Math.min(180_000, Math.max(45_000, question.content.length * 400));
      let previous = performance.now();
      if (!finished) speechTimer = setInterval(() => {
        const now = performance.now();
        if (!pausedRef.current) remaining -= now - previous;
        previous = now;
        if (remaining <= 0) finishSpeech("질문 음성 재생이 지연되어 종료했어요. 화면을 보고 답변해 주세요.");
      }, 250);
    }
    return () => {
      active = false;
      clearInterval(typingTimer); clearInterval(speechTimer);
      if (ownedUtterance) {
        ownedUtterance.onend = null; ownedUtterance.onerror = null;
        if (utteranceRef.current === ownedUtterance) utteranceRef.current = null;
        synthesis?.cancel();
      }
    };
  }, [question.questionId, question.content]);

  useEffect(() => {
    if (!utteranceRef.current || !("speechSynthesis" in window)) return;
    if (paused) window.speechSynthesis.pause(); else window.speechSynthesis.resume();
  }, [paused]);
  return { text, ready: typed && spoken, speechError };
}
