import { useEffect } from 'react';
import { useInterviewStore } from '@/store/useInterviewStore';
import { clearInterviewTimer, loadInterviewTimer, newInterviewTimer, remainingInterviewMs, saveInterviewTimer } from '@/lib/interviewTimer';

export function useInterviewTimer() {
  const { sessionId, currentQuestion, recordingAttempt, phase, isSubmitting, isFinished, isPaused, inputMode, audioStatus, skipError } = useInterviewStore();
  const questionId = currentQuestion?.questionId;

  useEffect(() => {
    if (!sessionId || !questionId) return;
    if (isFinished) { clearInterviewTimer(sessionId, questionId); return; }
    // A refreshed question must keep its saved deadline while it is presented again.
    if (phase === 'ASKING' || phase === 'PREPARING') return;
    const timer = loadInterviewTimer(sessionId, questionId) ?? newInterviewTimer(sessionId, questionId, useInterviewStore.getState().timeLeft);
    const running = phase === 'RECORDING' && !isSubmitting && !isPaused && (inputMode === 'TEXT' || audioStatus === 'READY');
    if (!running) {
      timer.remainingMs = remainingInterviewMs(timer);
      timer.deadline = null;
      saveInterviewTimer(timer);
      useInterviewStore.getState().setTimeLeft(Math.ceil(timer.remainingMs / 1000));
      return;
    }
    timer.deadline ??= Date.now() + timer.remainingMs;
    saveInterviewTimer(timer);
    const tick = () => {
      const current = useInterviewStore.getState();
      if (current.sessionId !== sessionId || current.currentQuestion?.questionId !== questionId || current.recordingAttempt !== recordingAttempt ||
        current.phase !== 'RECORDING' || current.isSubmitting || current.isFinished || current.isPaused ||
        (current.inputMode === 'AUDIO' && current.audioStatus !== 'READY')) return;
      const seconds = Math.ceil(remainingInterviewMs(timer) / 1000);
      if (current.timeLeft !== seconds) current.setTimeLeft(seconds);
      if (seconds === 0 && !current.skipError) void current.skipCurrentQuestion('TIMEOUT');
    };
    tick();
    const interval = setInterval(tick, 250);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', tick);
    window.addEventListener('pageshow', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', tick);
      window.removeEventListener('pageshow', tick);
    };
  }, [sessionId, questionId, recordingAttempt, phase, isSubmitting, isFinished, isPaused, inputMode, audioStatus, skipError]);
}
