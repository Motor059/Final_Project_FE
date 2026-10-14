import { api } from '@/api/axios';
import type { ApiResponse, StartScoringData, PollingStatusData } from './api';
import type { ReportResponseData } from '../types/report'; 

const feedbackRequests = new Map<number, Promise<StartScoringData>>();

export const reportApi = {
  // 채점 시작 요청 (POST)
  requestFeedback: (sessionId: number): Promise<StartScoringData> => {
    const existing = feedbackRequests.get(sessionId);
    if (existing) return existing;
    const request: Promise<StartScoringData> = api.post<ApiResponse<StartScoringData>>(`/api/v1/sessions/${sessionId}/feedback`)
      .then((response) => response.data.data)
      .finally(() => { if (feedbackRequests.get(sessionId) === request) feedbackRequests.delete(sessionId); });
    feedbackRequests.set(sessionId, request);
    return request;
  },

  // 채점 상태 조회 - 폴링용 (GET)
  getFeedbackStatus: async (sessionId: number, signal?: AbortSignal): Promise<PollingStatusData> => {
    const response = await api.get<ApiResponse<PollingStatusData>>(`/api/v1/sessions/${sessionId}/feedback/status`, { signal });
    return response.data.data;
  },

  // 최종 결과 리포트 조회 (GET)
  getFinalReport: async (sessionId: number, signal?: AbortSignal): Promise<ReportResponseData> => {
    const response = await api.get<ApiResponse<ReportResponseData>>(`/api/v1/sessions/${sessionId}/feedback`, { signal });
    return response.data.data;
  }
};
