import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingState';
import { ensureReportAnalysis, resumeReportAnalyses, stopReportAnalysis } from '@/lib/reportAnalysis';
import { reportPath, reportSessionId } from '@/lib/reportNavigation';
import { useReportAnalysisStore } from '@/store/useReportAnalysisStore';

export default function ReportAnalysisManager() {
  const location = useLocation();
  const jobs = useReportAnalysisStore((state) => state.jobs);
  const notifications = useReportAnalysisStore((state) => state.notifications);
  const dismiss = useReportAnalysisStore((state) => state.dismiss);
  const currentId = location.pathname === '/report' ? reportSessionId(location.search, location.state?.sessionId) : undefined;

  useEffect(() => {
    const sync = () => {
      const previousOwner = useReportAnalysisStore.getState().owner;
      useReportAnalysisStore.getState().syncOwner();
      if (previousOwner !== useReportAnalysisStore.getState().owner) stopReportAnalysis();
      resumeReportAnalyses();
    };
    const online = () => {
      sync();
      for (const job of Object.values(useReportAnalysisStore.getState().jobs)) {
        if (job.state === 'ERROR') ensureReportAnalysis(job.sessionId, { retry: true });
      }
    };
    const storage = (event: StorageEvent) => {
      if (!event.key || ['accessToken', 'authSessionType', 'refreshToken'].includes(event.key)) sync();
    };
    sync();
    window.addEventListener('devoir:auth-session-change', sync);
    window.addEventListener('storage', storage);
    window.addEventListener('online', online);
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('devoir:auth-session-change', sync);
      window.removeEventListener('storage', storage);
      window.removeEventListener('online', online);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('focus', sync);
      stopReportAnalysis();
    };
  }, []);

  useEffect(() => { if (currentId && notifications.includes(currentId)) dismiss(currentId); }, [currentId, notifications, dismiss]);

  const ready = notifications.map((id) => jobs[id]).filter((job) => job && job.sessionId !== currentId).slice(0, 3);
  const pending = Object.values(jobs).filter((job) => job.sessionId !== currentId && job.state !== 'COMPLETED')
    .sort((a, b) => b.startedAt - a.startedAt);
  if (!ready.length && !pending.length) return null;

  return <aside className="fixed bottom-5 right-4 z-[120] flex w-[calc(100%-32px)] max-w-[330px] flex-col gap-3 sm:right-6" aria-label="면접 분석 알림">
    {ready.map((job) => <div key={job.sessionId} className="relative rounded-2xl border border-[#E7E5E4] bg-white p-5 pr-10 shadow-[0_8px_35px_rgba(0,0,0,0.12)]">
      <p role="status" className="flex items-center gap-2 text-[14px] font-semibold text-[#1C1917]"><Check size={17} aria-hidden="true" />{job.format === 'PT' ? 'PT 면접' : '면접'} 분석이 완료됐어요</p>
      <Link to={reportPath(job.sessionId)} state={{ isFromHistory: true, interviewType: job.format }} className="mt-2 inline-block text-[13px] font-medium text-[#57534E] underline underline-offset-4">리포트 보기 →</Link>
      <button type="button" onClick={() => dismiss(job.sessionId)} aria-label="완료 알림 닫기" className="absolute right-3 top-3 rounded-full p-1.5 text-[#A8A29E] hover:bg-[#F5F5F4]"><X size={16} /></button>
    </div>)}
    {!!pending.length && <Link to={reportPath(pending[0].sessionId)} state={{ isFromHistory: true, interviewType: pending[0].format }}
      className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7E5E4] bg-white px-5 py-4 text-[13px] text-[#57534E] shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
      <span className="flex items-center gap-2.5">{pending[0].state === 'FAILED' || pending[0].state === 'ERROR' ? <span aria-hidden="true">!</span> : <LoadingIndicator size="sm" />}
        {pending[0].state === 'FAILED' || pending[0].state === 'ERROR' ? '면접 분석 상태를 확인해 주세요' : `면접 분석 중${pending.length > 1 ? ` · ${pending.length}건` : ''}`}</span><span aria-hidden="true">→</span>
    </Link>}
  </aside>;
}
