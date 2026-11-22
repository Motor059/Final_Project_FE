import { api } from '@/api/axios';
import type { HistoryResponse } from '@/types/history';
import type { ApiResponse } from '@/api/api';
import { getAuthVersion, hasMemberSession } from '@/lib/authStorage';

let cachedHistory: { version: number; receivedAt: number; data: HistoryResponse } | null = null;

export function getCachedHistory(): HistoryResponse | null {
  return cachedHistory && hasMemberSession() && cachedHistory.version === getAuthVersion() &&
    Date.now() - cachedHistory.receivedAt < 60_000 ? cachedHistory.data : null;
}

export const getHistoryList = async (): Promise<HistoryResponse> => {
  const version = getAuthVersion();
  const response = await api.get<ApiResponse<HistoryResponse>>(
    '/api/v1/users/me/sessions'
  );

  const data = response.data.data;
  if (version === getAuthVersion() && hasMemberSession()) cachedHistory = { version, receivedAt: Date.now(), data };
  return data;
};
