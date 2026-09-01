import { api } from '@/api/axios';
import type { HistoryResponse } from '@/types/history';

export const getHistoryList = async (): Promise<HistoryResponse> => {
  const response = await api.get(
    '/api/v1/users/me/sessions'
  );

  return response.data.data;
};