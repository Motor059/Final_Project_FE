import { useEffect, useState } from "react";
import { isCancel } from "axios";

import { getCachedHistory, getHistoryList, getHistorySessionFormat, normalizeHistoryFormat } from "@/api/historyApi";
import { getAuthSessionIdentity, getAuthVersion, hasMemberSession } from "@/lib/authStorage";
import { ensureReportAnalysis } from "@/lib/reportAnalysis";
import { scoreValue } from "@/lib/reportDisplay";
import { useReportAnalysisStore } from "@/store/useReportAnalysisStore";
import type { HistoryResponse } from "@/types/history";

export default function useHistory() {
  const [history, setHistory] = useState<HistoryResponse | null>(getCachedHistory);
  const [isLoading, setIsLoading] = useState(history === null);
  const [isError, setIsError] = useState(false);
  const [isResolvingFormats, setIsResolvingFormats] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const analysisOwner = useReportAnalysisStore((state) => state.owner);
  const analysisJobs = useReportAnalysisStore((state) => state.jobs);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const version = getAuthVersion();
    const isCurrent = () => active && version === getAuthVersion();
    const fetchHistory = async () => {
      try {
        const data = await getHistoryList(controller.signal);
        if (!isCurrent()) return;
        setHistory(data);
        setIsError(false);
        setIsLoading(false);
        const missing = data.sessions.filter((session) => !session.format);
        if (!missing.length) return;
        setIsResolvingFormats(true);
        const resolveNext = async () => {
          while (isCurrent() && !controller.signal.aborted) {
            const session = missing.shift();
            if (!session) return;
            const analyses = useReportAnalysisStore.getState();
            const known = analyses.owner === getAuthSessionIdentity()
              ? normalizeHistoryFormat(analyses.jobs[session.sessionId]?.report?.meta?.format) : null;
            let format = known;
            try { format ??= await getHistorySessionFormat(session.sessionId, controller.signal); }
            catch { /* Keep the record visible if its report is unavailable. */ }
            if (format && isCurrent()) {
              const resolvedFormat = format;
              setHistory((current) => current ? { ...current, sessions: current.sessions.map((item) =>
                item.sessionId === session.sessionId && !item.format ? { ...item, format: resolvedFormat } : item) } : current);
            }
          }
        };
        await Promise.all(Array.from({ length: Math.min(3, missing.length) }, () => resolveNext()));
      } catch (error) {
        if (!isCurrent() || isCancel(error)) return;
        console.error("히스토리 조회 실패:", error);
        if (isCurrent()) setIsError(getCachedHistory() === null);
      } finally {
        if (isCurrent()) { setIsLoading(false); setIsResolvingFormats(false); }
      }
    };

    fetchHistory();
    return () => { active = false; controller.abort(); };
  }, [refreshVersion]);

  useEffect(() => {
    if (!history || !hasMemberSession()) return;
    for (const session of history.sessions) {
      const interviewEnded = session.status === "ANALYZING" || session.status === "COMPLETED";
      // A zero may be either a pending placeholder or a final score; confirm it with the scoring API.
      if (interviewEnded && (scoreValue(session.totalScore) ?? 0) === 0) {
        ensureReportAnalysis(session.sessionId, { format: session.format ?? undefined });
      }
    }
  }, [history]);

  return {
    history,
    isLoading,
    isError,
    isResolvingFormats,
    retry: () => setRefreshVersion((current) => current + 1),
    analysisJobs: analysisOwner === getAuthSessionIdentity() ? analysisJobs : undefined,
  };
}
