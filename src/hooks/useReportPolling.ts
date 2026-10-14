import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { reportApi } from '@/api/reportApi';
import type { ReportResponseData } from '@/types/report';

export const useReportPolling = (sessionId: number | undefined | null, isFromHistory: boolean | undefined, guestPreview?: ReportResponseData) => {
  const [data, setData] = useState<ReportResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  useEffect(() => {
    setData(null);
    setError(null);
    setIsLoading(true);
    if (!Number.isSafeInteger(sessionId) || !sessionId || sessionId <= 0) {
      setError('유효하지 않은 세션입니다.');
      setIsLoading(false);
      return;
    }
    if (guestPreview?.sessionId === sessionId) {
      setData(guestPreview);
      setIsLoading(false);
      return;
    }
    const sid = sessionId;
    const controller = new AbortController();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let deadline: ReturnType<typeof setTimeout> | null = null;
    const isActive = () => !stopped && !controller.signal.aborted;
    const stop = () => {
      stopped = true;
      if (timer !== null) clearTimeout(timer);
      if (deadline !== null) clearTimeout(deadline);
      controller.abort();
    };
    const fail = (message: string) => {
      if (!isActive()) return;
      setError(message);
      setIsLoading(false);
      stop();
    };
    const fetchFinalReport = async () => {
      try {
        const result = await reportApi.getFinalReport(sid, controller.signal);
        if (!isActive()) return;
        setData(result);
        setIsLoading(false);
        stop();
      } catch {
        fail('결과 리포트를 불러오지 못했습니다. 다시 불러오기를 눌러 주세요.');
      }
    };
    const checkStatus = async () => {
      if (!isActive()) return;
      try {
        const status = await reportApi.getFeedbackStatus(sid, controller.signal);
        if (!isActive()) return;
        if (status.status === 'COMPLETED') {
          await fetchFinalReport();
        } else if (status.status === 'FAILED') {
          fail('채점에 실패했습니다. 다시 불러와 상태를 확인하거나 새 면접을 시작해 주세요.');
        } else {
          timer = setTimeout(() => { void checkStatus(); }, 3000);
        }
      } catch {
        fail('채점 상태를 확인하지 못했습니다. 다시 불러오기를 눌러 주세요.');
      }
    };
    const start = async () => {
      if (isFromHistory) {
        await fetchFinalReport();
        return;
      }
      try {
        await reportApi.requestFeedback(sid);
      } catch (failure) {
        if (!isActive()) return;
        if (!isAxiosError(failure) || failure.response?.status !== 409) {
          fail('채점 요청을 완료하지 못했습니다. 다시 불러오기를 눌러 주세요.');
          return;
        }
      }
      if (isActive()) await checkStatus();
    };
    deadline = setTimeout(() => fail('결과 분석이 지연되고 있습니다. 다시 불러오기로 상태를 확인해 주세요.'), 5 * 60 * 1000);
    void start();
    return stop;
  }, [sessionId, isFromHistory, retryCount, guestPreview]);

  return { data, isLoading, error, retry };
};
