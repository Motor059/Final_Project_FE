import { useEffect } from 'react';
import { useInterviewStore } from '@/store/useInterviewStore';

export function useInterviewTimer() {
  const { phase, timeLeft, isSubmitting, isFinished, isPaused, inputMode, audioStatus, skipError, setTimeLeft, skipCurrentQuestion } = useInterviewStore();

  useEffect(() => {
    if (phase !== 'RECORDING' || isSubmitting || isFinished || isPaused || (inputMode === 'AUDIO' && audioStatus !== 'READY')) return;
    if (timeLeft === 0) {
      const current = useInterviewStore.getState();
      if (current.timeLeft === 0 && !current.isSubmitting && !current.skipError) void skipCurrentQuestion('TIMEOUT');
      return;
    }
    const timer = setInterval(() => {
      const current = useInterviewStore.getState();
      if (current.phase === 'RECORDING' && !current.isSubmitting && !current.isFinished && !current.isPaused && (current.inputMode === 'TEXT' || current.audioStatus === 'READY')) {
        setTimeLeft((previous) => previous - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft, isSubmitting, isFinished, isPaused, inputMode, audioStatus, skipError, setTimeLeft, skipCurrentQuestion]);
}
