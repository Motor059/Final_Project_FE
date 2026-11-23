import { useEffect, useState } from "react";

import { getCachedHistory, getHistoryList } from "@/api/historyApi";
import { getAuthSessionIdentity, getAuthVersion, hasMemberSession } from "@/lib/authStorage";
import { ensureReportAnalysis } from "@/lib/reportAnalysis";
import { scoreValue } from "@/lib/reportDisplay";
import { useReportAnalysisStore } from "@/store/useReportAnalysisStore";
import type { HistoryResponse } from "@/types/history";

export default function useHistory() {
  const [history, setHistory] = useState<HistoryResponse | null>(getCachedHistory);
  const [isLoading, setIsLoading] = useState(history === null);
  const [isError, setIsError] = useState(false);
  const analysisOwner = useReportAnalysisStore((state) => state.owner);
  const analysisJobs = useReportAnalysisStore((state) => state.jobs);

  useEffect(() => {
    let active = true;
    const version = getAuthVersion();
    const isCurrent = () => active && version === getAuthVersion();
    const fetchHistory = async () => {
      try {
        const data = await getHistoryList();
        if (isCurrent()) setHistory(data);
      } catch (error) {
        console.error("히스토리 조회 실패:", error);
        if (isCurrent()) setIsError(getCachedHistory() === null);
      } finally {
        if (isCurrent()) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!history || !hasMemberSession()) return;
    for (const session of history.sessions) {
      const interviewEnded = session.status === "ANALYZING" || session.status === "COMPLETED";
      // A zero may be either a pending placeholder or a final score; confirm it with the scoring API.
      if (interviewEnded && (scoreValue(session.totalScore) ?? 0) === 0) {
        ensureReportAnalysis(session.sessionId, { format: session.format ?? session.interviewType });
      }
    }
  }, [history]);

  return {
    history,
    isLoading,
    isError,
    analysisJobs: analysisOwner === getAuthSessionIdentity() ? analysisJobs : undefined,
  };
}
