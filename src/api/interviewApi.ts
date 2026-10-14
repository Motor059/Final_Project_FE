import { api } from '@/api/axios';
import type {
  ApiResponse, SessionData, CurrentQuestionData, AnswerSubmitData,
  SkipTopicData, StartInterviewData, AnalyzeSessionData, TextAnswerRequest,
} from './api';

function audioFileName(questionId: number, mimeType: string) {
  const mime = mimeType.split(';')[0].trim().toLowerCase();
  const extensions: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/mpeg': 'mp3',
  };
  return `answer_${questionId}.${extensions[mime] ?? 'bin'}`;
}

export const interviewApi = {
  // 세션 조회 API
  getSessionInfo: async (sessionId: number, signal?: AbortSignal): Promise<SessionData> => {
    const response = await api.get<ApiResponse<SessionData>>(`/api/v1/sessions/${sessionId}`, { signal });
    return response.data.data;
  },

  // 현재 질문 조회 API
  getCurrentQuestion: async (sessionId: number, signal?: AbortSignal): Promise<CurrentQuestionData> => {
    const response = await api.get<ApiResponse<CurrentQuestionData>>(`/api/v1/sessions/${sessionId}/current-question`, { signal });
    return response.data.data;
  },

  // 음성 답변 제출 API
  submitAudioAnswer: async (sessionId: number, questionId: number, audioBlob: Blob, durationSeconds: number): Promise<AnswerSubmitData> => {
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
      throw new Error('녹음 시간이 올바르지 않습니다. 다시 답변해 주세요.');
    }
    const formData = new FormData();
    formData.append('questionId', String(questionId));
    formData.append('audio', audioBlob, audioFileName(questionId, audioBlob.type));
    formData.append('durationSeconds', String(Math.floor(durationSeconds)));

    const response = await api.post<ApiResponse<AnswerSubmitData>>(`/api/v1/sessions/${sessionId}/answers/audio`, formData, {
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
  submitTextAnswer: async (sessionId: number, questionId: number, transcript: string): Promise<AnswerSubmitData> => {
    const request: TextAnswerRequest = {
      questionId,
      transcript: transcript.trim(),
    };
    const response = await api.post<ApiResponse<AnswerSubmitData>>(`/api/v1/sessions/${sessionId}/answers/text`, request);
    return response.data.data;
  },

  // 질문 건너뛰기 API
  skipTopic: async (sessionId: number, questionId: number): Promise<SkipTopicData> => {
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      throw new Error('세션 정보가 올바르지 않습니다. 면접을 다시 불러와 주세요.');
    }
    if (!Number.isSafeInteger(questionId) || questionId <= 0) {
      throw new Error('질문 정보가 올바르지 않습니다. 면접을 다시 불러와 주세요.');
    }
    const response = await api.post<ApiResponse<SkipTopicData>>(`/api/v1/questions/${questionId}/skip`, undefined, {
      params: { sessionId },
    });
    const result = response.data.data;
    if (result?.nextAction?.type !== 'FOLLOW_UP' && result?.nextAction?.type !== 'NEXT_MAIN' && result?.nextAction?.type !== 'FINISH') {
      throw new Error('스킵 응답을 확인하지 못했습니다.');
    }
    return result;
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
