import { useEffect, useRef } from 'react';
import { useInterviewStore } from '@/store/useInterviewStore';

export function useQuestionSpeech() {
  const { sessionId, currentQuestion, phase, recordingAttempt, questionAudioEnabled, isPaused } = useInterviewStore();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const watchdogRef = useRef<{ pause: () => void; resume: () => void } | null>(null);
  const questionId = currentQuestion?.questionId;
  const content = currentQuestion?.content;

  useEffect(() => {
    if (phase !== 'ASKING' || !sessionId || !questionId || !content) return;
    let active = true;
    let completed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let ownedUtterance: SpeechSynthesisUtterance | null = null;
    const synthesis = 'speechSynthesis' in window ? window.speechSynthesis : null;
    const finish = (message?: string) => {
      if (!active || completed) return;
      completed = true;
      if (timer !== null) clearTimeout(timer);
      watchdogRef.current = null;
      const utterance = utteranceRef.current;
      if (utterance) { utterance.onend = null; utterance.onerror = null; }
      utteranceRef.current = null;
      const current = useInterviewStore.getState();
      if (current.sessionId !== sessionId || current.currentQuestion?.questionId !== questionId || current.recordingAttempt !== recordingAttempt || current.phase !== 'ASKING') return;
      if (message) {
        synthesis?.cancel();
        useInterviewStore.getState().setQuestionSpeechError(message);
      }
      useInterviewStore.getState().completeQuestionPresentation(questionId, recordingAttempt, 'SPEECH');
    };
    const state = useInterviewStore.getState();
    if (state.questionSpeechPresented) return;
    state.setQuestionSpeechError(null);
    if (!questionAudioEnabled) {
      finish();
    } else if (!synthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      finish('이 브라우저는 질문 음성을 지원하지 않습니다. 화면의 질문을 보고 답변해 주세요.');
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      ownedUtterance = utterance;
      utterance.lang = 'ko-KR';
      utterance.rate = 1;
      const koreanVoice = synthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('ko'));
      if (koreanVoice) utterance.voice = koreanVoice;
      utterance.onend = () => finish();
      utterance.onerror = () => finish('질문 음성을 재생하지 못했습니다. 화면의 질문을 보고 답변해 주세요.');
      utteranceRef.current = utterance;
      synthesis.cancel();
      if (!state.isPaused) synthesis.resume();
      try { synthesis.speak(utterance); }
      catch { finish('질문 음성을 재생하지 못했습니다. 화면의 질문을 보고 답변해 주세요.'); }
      if (!completed) {
        let remaining = Math.min(180000, Math.max(45000, content.length * 400));
        let startedAt = 0;
        const resume = () => {
          if (!active || completed || timer !== null) return;
          startedAt = performance.now();
          timer = setTimeout(() => finish('질문 음성 재생이 지연되어 종료했습니다. 화면의 질문을 보고 답변해 주세요.'), remaining);
        };
        const pause = () => {
          if (timer === null) return;
          clearTimeout(timer);
          timer = null;
          remaining = Math.max(1, remaining - (performance.now() - startedAt));
        };
        watchdogRef.current = { pause, resume };
        if (state.isPaused) synthesis.pause();
        else resume();
      }
    }
    return () => {
      active = false;
      if (timer !== null) clearTimeout(timer);
      watchdogRef.current = null;
      if (ownedUtterance) {
        ownedUtterance.onend = null;
        ownedUtterance.onerror = null;
        if (utteranceRef.current === ownedUtterance) utteranceRef.current = null;
        synthesis?.cancel();
      }
    };
  }, [sessionId, questionId, content, phase, recordingAttempt, questionAudioEnabled]);

  useEffect(() => {
    if (!utteranceRef.current || !('speechSynthesis' in window)) return;
    if (isPaused) {
      watchdogRef.current?.pause();
      window.speechSynthesis.pause();
    } else {
      watchdogRef.current?.resume();
      window.speechSynthesis.resume();
    }
  }, [isPaused]);
}
