import type { ReportResponseData } from '@/types/report';
import { isReportSnapshot, validSessionId } from '@/lib/reportNavigation';

const RETURN_KEY = 'reportLoginReturn';
const RETURN_LIFETIME = 30 * 60 * 1000;
export interface ReportLoginReturn {
  sessionId: number;
  report?: ReportResponseData;
}

export function clearReportLoginReturn() {
  sessionStorage.removeItem(RETURN_KEY);
}

export function consumeReportLoginReturn(): ReportLoginReturn | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    clearReportLoginReturn();
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const item = value as { sessionId?: unknown; createdAt?: unknown; report?: unknown };
    if (!validSessionId(item.sessionId) || typeof item.createdAt !== 'number' ||
        !Number.isFinite(item.createdAt) || item.createdAt > Date.now() ||
        Date.now() - item.createdAt > RETURN_LIFETIME) return null;
    return {
      sessionId: item.sessionId,
      report: isReportSnapshot(item.report, item.sessionId) ? item.report : undefined,
    };
  } catch {
    return null;
  }
}

export function startKakaoLogin(target: ReportLoginReturn | null = null, preserveReturn = false) {
  if (!preserveReturn) {
    clearReportLoginReturn();
    if (target && validSessionId(target.sessionId)) {
      const item = { ...target, createdAt: Date.now() };
      try {
        sessionStorage.setItem(RETURN_KEY, JSON.stringify(item));
      } catch {
        sessionStorage.setItem(RETURN_KEY, JSON.stringify({ sessionId: target.sessionId, createdAt: item.createdAt }));
      }
    }
  }
  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.searchParams.set('client_id', import.meta.env.VITE_KAKAO_CLIENT_ID);
  url.searchParams.set('redirect_uri', import.meta.env.VITE_KAKAO_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  window.location.assign(url.toString());
}
