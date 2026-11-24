import { api } from '@/api/axios';
import type { HistoryResponse, InterviewFormat } from '@/types/history';
import type { ApiResponse } from '@/api/api';
import { getAuthVersion, hasMemberSession } from '@/lib/authStorage';
import { reportApi } from '@/api/reportApi';

let cachedHistory: { version: number; receivedAt: number; data: HistoryResponse } | null = null;
let formatCacheVersion = -1;
const knownFormats = new Map<number, InterviewFormat>();

export function normalizeHistoryFormat(value: unknown): InterviewFormat | null {
  if (typeof value !== 'string') return null;
  const format = value.trim().toUpperCase();
  return format === 'QA' || format === 'PT' ? format : null;
}

function currentFormats() {
  const version = getAuthVersion();
  if (formatCacheVersion !== version) {
    formatCacheVersion = version;
    knownFormats.clear();
  }
  return knownFormats;
}

export function getCachedHistory(): HistoryResponse | null {
  return cachedHistory && hasMemberSession() && cachedHistory.version === getAuthVersion() &&
    Date.now() - cachedHistory.receivedAt < 60_000 ? cachedHistory.data : null;
}

export const getHistoryList = async (signal?: AbortSignal): Promise<HistoryResponse> => {
  const version = getAuthVersion();
  const response = await api.get<ApiResponse<HistoryResponse>>(
    '/api/v1/users/me/sessions', { signal }
  );

  const raw = response.data.data;
  if (!raw || !Array.isArray(raw.sessions)) throw new Error('면접 기록 응답을 확인하지 못했습니다. 다시 시도해 주세요.');
  const formats = currentFormats();
  const data: HistoryResponse = { ...raw, sessions: raw.sessions.map((session) => {
    const format = normalizeHistoryFormat(session.format);
    if (format && version === getAuthVersion() && hasMemberSession()) formats.set(session.sessionId, format);
    return { ...session, format: format ?? formats.get(session.sessionId) ?? null };
  }) };
  if (version === getAuthVersion() && hasMemberSession()) cachedHistory = { version, receivedAt: Date.now(), data };
  return data;
};

export async function getHistorySessionFormat(sessionId: number, signal?: AbortSignal): Promise<InterviewFormat | null> {
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || !hasMemberSession()) return null;
  const version = getAuthVersion();
  const cached = currentFormats().get(sessionId);
  if (cached) return cached;
  const report = await reportApi.getFinalReport(sessionId, signal);
  if (signal?.aborted || version !== getAuthVersion() || !hasMemberSession()) return null;
  if (report.sessionId !== sessionId) return null;
  const format = normalizeHistoryFormat(report.meta?.format);
  if (format) {
    currentFormats().set(sessionId, format);
    if (cachedHistory?.version === version) {
      cachedHistory = { ...cachedHistory, data: { ...cachedHistory.data,
        sessions: cachedHistory.data.sessions.map((session) => session.sessionId === sessionId && !session.format ? { ...session, format } : session),
      } };
    }
  }
  return format;
}
