import { isAxiosError } from 'axios';
import { reportApi } from '@/api/reportApi';
import { getAuthSessionIdentity, getAuthVersion } from '@/lib/authStorage';
import { useReportAnalysisStore } from '@/store/useReportAnalysisStore';
import type { PollingStatusData } from '@/api/api';

interface RunningAnalysis {
  controller: AbortController;
  timer: ReturnType<typeof setTimeout> | null;
  owner: string;
  version: number;
}
const running = new Map<number, RunningAnalysis>();
const POLL_INTERVAL = 3000;
const MAX_WAIT = 11 * 60 * 1000;
const store = () => useReportAnalysisStore.getState();

export function stopReportAnalysis() {
  for (const operation of running.values()) {
    if (operation.timer) clearTimeout(operation.timer);
    operation.controller.abort();
  }
  running.clear();
}

function httpStatus(error: unknown) { return isAxiosError(error) ? error.response?.status : undefined; }
function failureMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && !isAxiosError(error)) return error.message;
  const status = httpStatus(error);
  if (status === 401) return '인증을 확인하지 못했어요. 로그인 상태를 확인해 주세요.';
  if (status === 403) return '이 면접 결과에 접근할 수 없어요. 면접을 진행한 계정을 확인해 주세요.';
  if (status === 404) return '분석 결과를 찾지 못했어요. 다시 확인하거나 분석을 요청해 주세요.';
  if (status === 410) return '체험 면접의 접근 기한이 지났어요.';
  if (status === 422) return '면접이 아직 끝나지 않아 분석을 시작할 수 없어요.';
  return '분석 상태를 확인하지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.';
}

export function ensureReportAnalysis(sessionId: number, options: {
  format?: 'QA' | 'PT'; createIfMissing?: boolean; retry?: boolean;
} = {}) {
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) return;
  store().register(sessionId, options.format, options.createIfMissing || options.retry);
  const job = store().jobs[sessionId];
  const owner = getAuthSessionIdentity();
  if (!job || !owner) return;
  const existing = running.get(sessionId);
  if (existing && existing.owner === owner && existing.version === getAuthVersion()) return;
  if (existing) {
    existing.controller.abort();
    if (existing.timer) clearTimeout(existing.timer);
  }
  if (job.state === 'COMPLETED' && job.report) return;
  if ((job.state === 'FAILED' || job.state === 'ERROR') && !options.retry) return;

  const operation: RunningAnalysis = { owner, version: getAuthVersion(), controller: new AbortController(), timer: null };
  running.set(sessionId, operation);
  const signal = operation.controller.signal;
  const startedAt = Date.now();
  let failures = 0;
  let fetchedCards = -1;
  let observedScoring = job.state === 'SCORING' || job.createIfMissing;
  const active = () => !signal.aborted && running.get(sessionId) === operation &&
    owner === getAuthSessionIdentity() && operation.version === getAuthVersion() && store().owner === owner;
  const stop = () => {
    if (operation.timer) clearTimeout(operation.timer);
    operation.controller.abort();
    if (running.get(sessionId) === operation) running.delete(sessionId);
  };
  const fail = (message: string, failed = false) => {
    if (active()) store().update(sessionId, { state: failed ? 'FAILED' : 'ERROR', error: message });
    stop();
  };
  const schedule = (delay = POLL_INTERVAL) => {
    if (active()) operation.timer = setTimeout(() => { void poll(); }, delay);
    else stop();
  };
  const applyStatus = async (status: PollingStatusData) => {
    if (!active()) return;
    if (status.status === 'FAILED') {
      fail('분석을 완료하지 못했어요. 다시 분석하면 이미 완료된 항목은 유지하고 이어서 처리해요.', true);
      return;
    }
    if (status.status !== 'SCORING' && status.status !== 'COMPLETED') throw new Error('분석 상태 응답을 확인하지 못했어요. 다시 확인해 주세요.');
    const totalCards = Number.isSafeInteger(status.totalCards) && status.totalCards > 0 ? status.totalCards : job.totalCards;
    const completedCards = Number.isSafeInteger(status.completedCards) ? Math.max(0, Math.min(status.completedCards, totalCards)) : 0;
    store().update(sessionId, { state: 'SCORING', completedCards, totalCards, error: null });
    observedScoring ||= status.status === 'SCORING';
    if (fetchedCards < 0 || fetchedCards !== completedCards || status.status === 'COMPLETED') {
      let report;
      try {
        report = await reportApi.getFinalReport(sessionId, signal);
      } catch (error) {
        if (httpStatus(error) === 404 && status.status === 'SCORING') return;
        throw error;
      }
      if (!active()) return;
      if (report.sessionId !== sessionId) throw new Error('요청한 면접의 결과를 확인하지 못했어요. 다시 확인해 주세요.');
      fetchedCards = completedCards;
      const completed = report.status === 'COMPLETED' || (status.status === 'COMPLETED' && report.status !== 'SCORING');
      const normalized = { ...report, status: completed ? 'COMPLETED' as const : 'SCORING' as const,
        cards: report.cards.map((card) => completed && !card.status ? { ...card, status: 'COMPLETED' as const } : card),
      };
      store().update(sessionId, { report: normalized, format: report.meta.format ?? job.format });
      if (completed) {
        store().complete(sessionId, normalized, observedScoring);
        stop();
      }
    }
  };
  const poll = async () => {
    if (!active()) { stop(); return; }
    if (Date.now() - startedAt > MAX_WAIT) {
      fail('분석 상태 확인이 오래 걸리고 있어요. 잠시 후 다시 확인해 주세요. 서버의 분석을 취소한 것은 아니에요.');
      return;
    }
    try {
      await applyStatus(await reportApi.getFeedbackStatus(sessionId, signal));
      failures = 0;
      schedule();
    } catch (error) {
      if (!active()) { stop(); return; }
      const status = httpStatus(error);
      if ((!status || status >= 500 || status === 429) && ++failures <= 3) {
        schedule(POLL_INTERVAL * 2 ** (failures - 1));
      } else fail(failureMessage(error));
    }
  };
  const start = async () => {
    store().update(sessionId, { state: 'CHECKING', error: null });
    try {
      let status: PollingStatusData | null = null;
      try { status = await reportApi.getFeedbackStatus(sessionId, signal); }
      catch (error) { if (httpStatus(error) !== 404) throw error; }
      if (!active()) { stop(); return; }
      const shouldStart = (!status && (job.createIfMissing || options.retry)) || (status?.status === 'FAILED' && options.retry);
      if (shouldStart) {
        try { await reportApi.requestFeedback(sessionId, signal); }
        catch (error) { if (httpStatus(error) !== 409) throw error; }
        if (!active()) { stop(); return; }
        observedScoring = true;
        await poll();
      } else if (status) {
        await applyStatus(status);
        schedule();
      } else fail('아직 분석 결과가 없어요. 다시 시도하면 분석을 요청할 수 있어요.');
    } catch (error) {
      if (!active()) { stop(); return; }
      const status = httpStatus(error);
      if (!status || status >= 500 || status === 429) schedule();
      else fail(failureMessage(error));
    }
  };
  void start();
}

export function resumeReportAnalyses() {
  store().syncOwner();
  for (const job of Object.values(store().jobs)) {
    if (job.state === 'CHECKING' || job.state === 'SCORING') ensureReportAnalysis(job.sessionId);
  }
}
