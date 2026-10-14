import { useEffect } from 'react';
import { useInterviewStore } from '@/store/useInterviewStore';

interface RecognitionEvent {
  results: { length: number; [index: number]: { [index: number]: { transcript: string } } };
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  start: () => void;
  abort: () => void;
}
type RecognitionConstructor = new () => Recognition;

export function useSpeechRecognition() {
  const { phase, inputMode, isSubmitting, isFinished, isPaused, audioStatus, sessionId, currentQuestion, recordingAttempt } = useInterviewStore();
  const questionId = currentQuestion?.questionId;

  useEffect(() => {
    if (phase !== 'RECORDING' || inputMode !== 'AUDIO' || isSubmitting || isFinished || isPaused || audioStatus !== 'READY' || !sessionId || !questionId) return;
    const browser = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    let active = true;
    const previousTranscript = useInterviewStore.getState().answerText;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';
    recognition.onresult = (event) => {
      const current = useInterviewStore.getState();
      if (!active || current.phase !== 'RECORDING' || current.inputMode !== 'AUDIO' || current.isSubmitting || current.isPaused || current.sessionId !== sessionId || current.currentQuestion?.questionId !== questionId || current.recordingAttempt !== recordingAttempt) return;
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      current.setAnswerText([previousTranscript, transcript].filter(Boolean).join(' '));
    };
    try {
      recognition.start();
    } catch (error) {
      console.warn('브라우저 음성 인식을 시작하지 못했습니다:', error);
    }
    return () => {
      active = false;
      recognition.onresult = null;
      try {
        recognition.abort();
      } catch (error) {
        console.warn('음성 인식 정리 실패:', error);
      }
    };
  }, [phase, inputMode, isSubmitting, isFinished, isPaused, audioStatus, sessionId, questionId, recordingAttempt]);
}
