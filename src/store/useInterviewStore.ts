import { create } from 'zustand';
import { interviewApi } from '@/api/interviewApi';
import type { CurrentQuestionData } from '@/api/api';
import { isAxiosError } from 'axios';

interface InterviewState {
  sessionId: number | null;
  currentQuestion: CurrentQuestionData | null;
  
  phase: 'PREPARING' | 'ASKING' | 'RECORDING' | 'THINKING'; 
  inputMode: 'AUDIO' | 'TEXT';                              
  answerText: string;                                       
  timeLeft: number;       
  isFinished: boolean;

  setSessionId: (id: number) => void;
  setPhase: (phase: InterviewState['phase']) => void;
  setInputMode: (mode: InterviewState['inputMode']) => void;
  setAnswerText: (text: string) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  resetInterview: () => void;

  startAndFetchFirstQuestion: (sessionId: number) => Promise<void>;
  fetchNextQuestion: () => Promise<void>;
  submitTextAnswerAndNext: () => Promise<void>;
  submitAudioAnswerAndNext: (audioBlob: Blob, durationSeconds: number) => Promise<void>;
  skipToNextMain: () => Promise<void>;
  cancelCurrentSession: () => Promise<void>;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  sessionId: null,
  currentQuestion: null,
  phase: 'PREPARING',
  inputMode: 'AUDIO',
  answerText: '',
  timeLeft: 180,
  isFinished: false,

  setSessionId: (id) => set({ sessionId: id }),
  setPhase: (phase) => set({ phase }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setAnswerText: (text) => set({ answerText: text }),
  setTimeLeft: (time) => set((state) => ({ 
    timeLeft: typeof time === 'function' ? time(state.timeLeft) : time 
  })),

  resetInterview: () => set({
    sessionId: null,
    currentQuestion: null,
    phase: 'PREPARING',
    inputMode: 'AUDIO',
    answerText: '',
    timeLeft: 180,
    isFinished: false
  }),

  // 면접 시작 및 첫 질문 세팅
  startAndFetchFirstQuestion: async (sessionId: number) => {
    set({ sessionId, phase: 'PREPARING' });
    try {
      await interviewApi.startSession(sessionId); 
      
      await get().fetchNextQuestion();
    } catch (error) {
      console.error("면접 시작 에러:", error);
    }
  },

  // 다음 질문 조회
  fetchNextQuestion: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const questionData = await interviewApi.getCurrentQuestion(sessionId);
      
      set({ 
        currentQuestion: questionData, 
        phase: 'ASKING', 
        answerText: '',
        timeLeft: 180 
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        console.log("진행할 질문이 없습니다. 면접을 종료합니다.");
        set({ isFinished: true });
        return;
      }
      console.error("질문 조회 에러:", error);
    }
  },

  // 텍스트 답변 제출 및 nextAction 처리
  submitTextAnswerAndNext: async () => {
    const { currentQuestion, answerText } = get();
    if (!currentQuestion || !answerText.trim()) return;

    set({ phase: 'THINKING' });

    try {
      const result = await interviewApi.submitTextAnswer(currentQuestion.questionId, answerText);
      const { type, message } = result.nextAction;

      if (type === 'FINISH') {
        set({ isFinished: true });
      } else if (type === 'RETRY_INPUT') {
        alert(message || "답변이 너무 짧습니다. 다시 입력해 주세요.");
        set({ phase: 'RECORDING' });
      } else {
        await get().fetchNextQuestion();
      }
    } catch (error) {
      console.error("텍스트 답변 제출 에러:", error);
      set({ phase: 'RECORDING' }); 
    }
  },

  // 음성 답변 제출 및 nextAction 처리
  submitAudioAnswerAndNext: async (audioBlob: Blob, durationSeconds: number) => {
    const { currentQuestion } = get();
    if (!currentQuestion) return;

    set({ phase: 'THINKING' }); 

    try {
      const result = await interviewApi.submitAudioAnswer(currentQuestion.questionId, audioBlob, durationSeconds);
      const { type, message } = result.nextAction;

      if (type === 'FINISH') {
        set({ isFinished: true });
      } else if (type === 'RETRY_INPUT') {
        alert(message || "음성이 잘 인식되지 않았습니다. 다시 녹음해 주세요.");
        set({ phase: 'RECORDING' });
      } else {
        await get().fetchNextQuestion();
      }
    } catch (error) {
      console.error("음성 답변 제출 에러:", error);
      set({ phase: 'RECORDING' });
    }
  },

  // 질문 스킵 및 nextAction 처리
  skipToNextMain: async () => {
    const { currentQuestion } = get();
    if (!currentQuestion) return;

    set({ phase: 'PREPARING' });

    try {
      const result = await interviewApi.skipTopic(currentQuestion.questionId);
      const { type } = result.nextAction;

      if (type === 'FINISH') {
        set({ isFinished: true });
      } else {
        await get().fetchNextQuestion();
      }
    } catch (error) {
      console.error("질문 스킵 에러:", error);
      set({ phase: 'RECORDING' });
    }
  },

  // 세션 폐기
  cancelCurrentSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      await interviewApi.cancelSession(sessionId);
      get().resetInterview();
    } catch (error) {
      console.error("세션 폐기 에러:", error);
    }
  }
}));