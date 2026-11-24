import { useEffect, useRef, useState } from "react";
import type { PTQuestion } from "@/types/pt";

export default function usePTQuestionPresentation(question: PTQuestion, paused: boolean) {
  const content = question.content;
  const key = `${question.questionId}:${content}`;
  const [typedText, setTypedText] = useState({ key, text: "" });
  const [typedKey, setTypedKey] = useState<string | null>(null);
  const [speech, setSpeech] = useState<{ key: string; error: string | null } | null>(null);
  const [audioEnabled] = useState(() => {
    try { return localStorage.getItem("questionAudioEnabled") === "true"; }
    catch { return false; }
  });
  const speechSupported = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  const pausedRef = useRef(paused);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let active = true;
    let index = 0;
    let speechTimer: ReturnType<typeof setInterval> | undefined;
    let ownedUtterance: SpeechSynthesisUtterance | null = null;
    const characters = Array.from(content);
    const typingTimer = setInterval(() => {
      if (!active || pausedRef.current) return;
      if (index === characters.length) { clearInterval(typingTimer); setTypedKey(key); return; }
      setTypedText({ key, text: characters.slice(0, ++index).join("") });
    }, 60);

    const synthesis = audioEnabled && speechSupported ? window.speechSynthesis : null;
    let finished = false;
    const finishSpeech = (message?: string) => {
      if (!active || finished) return;
      finished = true;
      clearInterval(speechTimer);
      if (ownedUtterance) { ownedUtterance.onend = null; ownedUtterance.onerror = null; }
      utteranceRef.current = null;
      if (message) synthesis?.cancel();
      setSpeech({ key, error: message ?? null });
    };

    if (synthesis) {
      // Start after commit so StrictMode cleanup can cancel a stale utterance.
      void Promise.resolve().then(() => {
        if (!active) return;
        try {
          const utterance = new SpeechSynthesisUtterance(content);
          ownedUtterance = utterance;
          utteranceRef.current = utterance;
          utterance.lang = "ko-KR";
          const voice = synthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("ko"));
          if (voice) utterance.voice = voice;
          utterance.onend = () => finishSpeech();
          utterance.onerror = () => finishSpeech("질문 음성을 재생하지 못했어요. 화면을 보고 답변해 주세요.");
          synthesis.cancel();
          synthesis.speak(utterance);
          if (pausedRef.current) synthesis.pause(); else synthesis.resume();
          let remaining = Math.min(180_000, Math.max(45_000, content.length * 400));
          let previous = performance.now();
          if (!finished) speechTimer = setInterval(() => {
            const now = performance.now();
            if (!pausedRef.current) remaining -= now - previous;
            previous = now;
            if (remaining <= 0) finishSpeech("질문 음성 재생이 지연되어 종료했어요. 화면을 보고 답변해 주세요.");
          }, 250);
        } catch {
          finishSpeech("질문 음성을 재생하지 못했어요. 화면을 보고 답변해 주세요.");
        }
      });
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
  }, [key, content, audioEnabled, speechSupported]);

  useEffect(() => {
    if (!utteranceRef.current || !("speechSynthesis" in window)) return;
    if (paused) window.speechSynthesis.pause(); else window.speechSynthesis.resume();
  }, [paused]);

  const text = typedText.key === key ? typedText.text : "";
  const spoken = !audioEnabled || !speechSupported || speech?.key === key;
  const speechError = audioEnabled && !speechSupported
    ? "이 브라우저에서는 질문 음성을 재생할 수 없어요. 화면을 보고 답변해 주세요."
    : speech?.key === key ? speech.error : null;
  return { text, ready: typedKey === key && spoken, speechError };
}
