import { api } from './axios';
import type { ApiResponse, StartScoringData, PollingStatusData } from './api';
import type { ReportResponseData } from '../types/report'; 

export const reportApi = {
  // 채점 시작 요청 (POST)
  requestFeedback: async (sessionId: number): Promise<StartScoringData> => {
    const response = await api.post<ApiResponse<StartScoringData>>(`/api/v1/sessions/${sessionId}/feedback`);
    return response.data.data;
  },

  // 채점 상태 조회 - 폴링용 (GET)
  getFeedbackStatus: async (sessionId: number): Promise<PollingStatusData> => {
    const response = await api.get<ApiResponse<PollingStatusData>>(`/api/v1/sessions/${sessionId}/feedback/status`);
    return response.data.data;
  },

  // 최종 결과 리포트 조회 (GET)
  getFinalReport: async (sessionId: number): Promise<ReportResponseData> => {
    const response = await api.get<ApiResponse<ReportResponseData>>(`/api/v1/sessions/${sessionId}/feedback`);
    return response.data.data;
  }
};