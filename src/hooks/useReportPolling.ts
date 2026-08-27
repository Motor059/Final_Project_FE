import { useState, useEffect, useRef } from 'react';
import { reportApi } from '@/api/reportApi';
import type { ReportResponseData } from '@/types/report';

export const useReportPolling = (sessionId: number | undefined | null) => {
  const [data, setData] = useState<ReportResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    if (!sessionId) {
      setError("유효하지 않은 세션입니다.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const stopPolling = () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };

    // 최종 리포트 조회
    const fetchFinalReport = async (sid: number) => {
      try {
        const reportData = await reportApi.getFinalReport(sid);
        if (isMounted) {
          setData(reportData);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("결과 리포트를 불러오는데 실패했습니다.");
          setIsLoading(false);
        }
      }
    };

    // 상태 체크 로직 (폴링)
    const checkStatus = async (sid: number) => {
      try {
        const statusData = await reportApi.getFeedbackStatus(sid);
        
        if (statusData.status === 'COMPLETED') {
          stopPolling();
          if (isMounted) fetchFinalReport(sid);
        } else if (statusData.status === 'FAILED') {
          stopPolling();
          if (isMounted) {
            setError("채점 과정에서 문제가 발생했습니다. (FAILED)");
            setIsLoading(false);
          }
        }
      } catch (err) {
        stopPolling();
        if (isMounted) {
          setError("상태 조회 중 오류가 발생했습니다.");
          setIsLoading(false);
        }
      }
    };

    const startPolling = (sid: number) => {
      checkStatus(sid);
      pollingTimerRef.current = setInterval(() => checkStatus(sid), 3000); // 3초 간격 폴링
    };

    // 최초 채점 시작 요청
    const startProcess = async () => {
      try {
        setIsLoading(true);
        await reportApi.requestFeedback(sessionId);
        startPolling(sessionId);
      } catch (err: any) {
        if (err?.response?.status === 409) {
          startPolling(sessionId);
        } else {
          setError("채점 요청 중 오류가 발생했습니다.");
          setIsLoading(false);
        }
      }
    };

    startProcess();

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [sessionId]);

  return { data, isLoading, error };
};