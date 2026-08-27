import { api } from './axios';
import type { ApiResponse, SessionData, CurrentQuestionData, AnswerSubmitData, SkipTopicData,StartInterviewData, AnalyzeSessionData } from './api';

export const interviewApi = {
  // 세션 조회 API
  getSessionInfo: async (sessionId: number): Promise<SessionData> => {
    const response = await api.get<ApiResponse<SessionData>>(`/api/v1/sessions/${sessionId}`);
    return response.data.data;
  },

  // 현재 질문 조회 API
  getCurrentQuestion: async (sessionId: number): Promise<CurrentQuestionData> => {
    const response = await api.get<ApiResponse<CurrentQuestionData>>(`/api/v1/sessions/${sessionId}/current-question`);
    return response.data.data;
  },

  // 음성 답변 제출 API
  submitAudioAnswer: async (questionId: number, audioBlob: Blob, durationSeconds: number): Promise<AnswerSubmitData> => {
    const formData = new FormData();
    formData.append('questionId', String(questionId));
    formData.append('audioFile', audioBlob, `answer_${questionId}.webm`); 
    formData.append('durationSeconds', String(Math.floor(durationSeconds)));

    const response = await api.post<ApiResponse<AnswerSubmitData>>('/api/v1/answers/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data.data;
  },

  // 세션 폐기 API
  cancelSession: async (sessionId: number): Promise<void> => {
    await api.post<ApiResponse<null>>(`/api/v1/sessions/${sessionId}/cancel`);
  },

  // 텍스트 답변 제출 API
  submitTextAnswer: async (questionId: number, transcript: string): Promise<AnswerSubmitData> => {
    const response = await api.post<ApiResponse<AnswerSubmitData>>('/api/v1/answers/text', {
      questionId,
      transcript,
    });
    return response.data.data;
  },

  // 주제 건너뛰기 API
  skipTopic: async (questionId: number): Promise<SkipTopicData> => {
    const response = await api.post<ApiResponse<SkipTopicData>>(`/api/v1/questions/${questionId}/skip`);
    return response.data.data;
  },

  // 면접 시작 API
  startSession: async (sessionId: number): Promise<StartInterviewData> => {
    const response = await api.post<ApiResponse<StartInterviewData>>(`/api/v1/sessions/${sessionId}/start`);
    return response.data.data;
  },

  // 채점 요청 API
  analyzeSession: async (sessionId: number): Promise<AnalyzeSessionData> => {
    const response = await api.post<ApiResponse<AnalyzeSessionData>>(`/api/v1/sessions/${sessionId}/analyze`);
    return response.data.data;
  },
};