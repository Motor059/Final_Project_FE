import { useCallback, useEffect } from 'react';
import { ensureReportAnalysis } from '@/lib/reportAnalysis';
import { getAuthSessionIdentity } from '@/lib/authStorage';
import { validSessionId } from '@/lib/reportNavigation';
import { useReportAnalysisStore } from '@/store/useReportAnalysisStore';
import type { ReportResponseData } from '@/types/report';

export const useReportPolling = (sessionId: number | undefined | null, isFromHistory: boolean | undefined,
  guestPreview?: ReportResponseData, format?: 'QA' | 'PT') => {
  const job = useReportAnalysisStore((state) => validSessionId(sessionId) ? state.jobs[sessionId] : undefined);
  const owner = useReportAnalysisStore((state) => state.owner);
  useEffect(() => {
    if (!validSessionId(sessionId) || guestPreview?.sessionId === sessionId) return;
    ensureReportAnalysis(sessionId, { format, createIfMissing: !isFromHistory });
  }, [sessionId, isFromHistory, guestPreview, format]);
  const retry = useCallback(() => {
    if (validSessionId(sessionId)) ensureReportAnalysis(sessionId, { format, retry: true });
  }, [sessionId, format]);

  const preview = guestPreview?.sessionId === sessionId ? guestPreview : undefined;
  const currentJob = owner && owner === getAuthSessionIdentity() ? job : undefined;
  const error = !validSessionId(sessionId) ? '유효하지 않은 세션입니다.'
    : !preview && !getAuthSessionIdentity() ? '면접을 진행한 계정의 인증이 필요해요. 로그인 상태를 확인해 주세요.'
      : currentJob?.error ?? null;
  return {
    data: preview ?? currentJob?.report ?? null,
    isLoading: !preview && !error && currentJob?.state !== 'COMPLETED' && currentJob?.state !== 'FAILED' && currentJob?.state !== 'ERROR',
    error, retry, job: currentJob,
  };
};
