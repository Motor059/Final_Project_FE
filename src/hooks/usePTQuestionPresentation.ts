import { useEffect, useRef, useState } from "react";
import { createQuestionAudioPlayback, type QuestionAudioPlayback } from "@/lib/questionAudio";
import type { PTQuestion } from "@/types/pt";

export default function usePTQuestionPresentation(question: PTQuestion, paused: boolean) {
  const content = question.content;
  const questionId = question.questionId;
  const key = `${questionId}:${content}`;
  const [typedText, setTypedText] = useState({ key, text: "" });
  const [typedKey, setTypedKey] = useState<string | null>(null);
  const [speech, setSpeech] = useState<{ key: string; error: string | null } | null>(null);
  const [audioEnabled] = useState(() => {
    try { return localStorage.getItem("questionAudioEnabled") === "true"; }
    catch { return false; }
  });
  const pausedRef = useRef(paused);
  const playbackRef = useRef<QuestionAudioPlayback | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    playbackRef.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    let active = true;
    let index = 0;
    const characters = Array.from(content);
    const typingTimer = setInterval(() => {
      if (!active || pausedRef.current) return;
      if (index === characters.length) { clearInterval(typingTimer); setTypedKey(key); return; }
      setTypedText({ key, text: characters.slice(0, ++index).join("") });
    }, 60);

    const playback = audioEnabled ? createQuestionAudioPlayback({
      questionId,
      content,
      paused: pausedRef.current,
      onComplete: (error) => {
        if (active) setSpeech({ key, error: error ?? null });
      },
    }) : null;
    playbackRef.current = playback;

    return () => {
      active = false;
      clearInterval(typingTimer);
      playback?.dispose();
      if (playbackRef.current === playback) playbackRef.current = null;
    };
  }, [key, questionId, content, audioEnabled]);

  const text = typedText.key === key ? typedText.text : "";
  const spoken = !audioEnabled || speech?.key === key;
  const speechError = speech?.key === key ? speech.error : null;
  return { text, ready: typedKey === key && spoken, speechError };
}
