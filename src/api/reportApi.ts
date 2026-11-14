import { api } from '@/api/axios';
import type { ApiResponse, StartScoringData, PollingStatusData } from './api';
import type { ReportResponseData } from '../types/report'; 

export const reportApi = {
  // 채점 시작 요청 (POST)
  requestFeedback: async (sessionId: number, signal?: AbortSignal): Promise<StartScoringData> => {
    // 중복 실행은 공통 분석 관리자가 세션/계정별로 제어한다.
    const response = await api.post<ApiResponse<StartScoringData>>(`/api/v1/sessions/${sessionId}/feedback`, undefined, { signal, timeout: 30000 });
    return response.data.data;
  },

  // 채점 상태 조회 - 폴링용 (GET)
  getFeedbackStatus: async (sessionId: number, signal?: AbortSignal): Promise<PollingStatusData> => {
    const response = await api.get<ApiResponse<PollingStatusData>>(`/api/v1/sessions/${sessionId}/feedback/status`, { signal, timeout: 20000 });
    return response.data.data;
  },

  // 최종 결과 리포트 조회 (GET)
  getFinalReport: async (sessionId: number, signal?: AbortSignal): Promise<ReportResponseData> => {
    const response = await api.get<ApiResponse<ReportResponseData>>(`/api/v1/sessions/${sessionId}/feedback`, { signal, timeout: 20000 });
    return response.data.data;
  }
};
