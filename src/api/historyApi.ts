import { axiosInstance } from './axiosInstance';
import type { HistoryResponse } from '@/types/history';

export const getHistoryList = async (): Promise<HistoryResponse> => {
  const response = await axiosInstance.get<HistoryResponse>(
    '/api/v1/users/me/sessions'
  );

  return response.data;
};