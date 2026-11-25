import { useEffect, useRef } from 'react';
import { createQuestionAudioPlayback, type QuestionAudioPlayback } from '@/lib/questionAudio';
import { useInterviewStore } from '@/store/useInterviewStore';

export function useQuestionSpeech() {
  const { sessionId, currentQuestion, phase, recordingAttempt, questionAudioEnabled, isPaused } = useInterviewStore();
  const playbackRef = useRef<QuestionAudioPlayback | null>(null);
  const questionId = currentQuestion?.questionId;
  const content = currentQuestion?.content;

  useEffect(() => {
    if (phase !== 'ASKING' || !sessionId || !questionId || !content) return;
    const state = useInterviewStore.getState();
    if (state.questionSpeechPresented) return;

    const finish = (message?: string) => {
      const current = useInterviewStore.getState();
      if (current.sessionId !== sessionId || current.currentQuestion?.questionId !== questionId || current.recordingAttempt !== recordingAttempt || current.phase !== 'ASKING' || current.isFinished || current.questionError) return;
      current.setQuestionSpeechError(message ?? null);
      current.completeQuestionPresentation(questionId, recordingAttempt, 'SPEECH');
    };

    state.setQuestionSpeechError(null);
    if (!questionAudioEnabled) {
      finish();
      return;
    }

    const playback = createQuestionAudioPlayback({
      questionId,
      content,
      paused: state.isPaused,
      onComplete: finish,
    });
    playbackRef.current = playback;
    return () => {
      playback.dispose();
      if (playbackRef.current === playback) playbackRef.current = null;
    };
  }, [sessionId, questionId, content, phase, recordingAttempt, questionAudioEnabled]);

  useEffect(() => {
    playbackRef.current?.setPaused(isPaused);
  }, [isPaused]);
}
