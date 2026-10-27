import { api } from '@/api/axios';
import type { HistoryResponse } from '@/types/history';
import type { ApiResponse } from '@/api/api';

export const getHistoryList = async (): Promise<HistoryResponse> => {
  const response = await api.get<ApiResponse<HistoryResponse>>(
    '/api/v1/users/me/sessions'
  );

  return response.data.data;
};