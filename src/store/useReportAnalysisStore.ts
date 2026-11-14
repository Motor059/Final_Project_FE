import { create } from 'zustand';
import { getAuthSessionIdentity } from '@/lib/authStorage';
import type { ReportResponseData } from '@/types/report';

export type AnalysisState = 'CHECKING' | 'SCORING' | 'COMPLETED' | 'FAILED' | 'ERROR';
export interface ReportAnalysisJob {
  sessionId: number;
  format?: 'QA' | 'PT';
  state: AnalysisState;
  report: ReportResponseData | null;
  completedCards: number;
  totalCards: number;
  createIfMissing: boolean;
  startedAt: number;
  notified: boolean;
  error: string | null;
}
interface AnalysisStore {
  owner: string | null;
  jobs: Record<number, ReportAnalysisJob>;
  notifications: number[];
  syncOwner: () => void;
  register: (sessionId: number, format?: 'QA' | 'PT', createIfMissing?: boolean) => void;
  update: (sessionId: number, patch: Partial<ReportAnalysisJob>) => void;
  complete: (sessionId: number, report: ReportResponseData, notify: boolean) => void;
  dismiss: (sessionId: number) => void;
}

const STORAGE_KEY = 'devoirReportAnalysis';
const MAX_AGE = 24 * 60 * 60 * 1000;

function persist(owner: string | null, jobs: AnalysisStore['jobs']) {
  try {
    if (!owner) { sessionStorage.removeItem(STORAGE_KEY); return; }
    const entries = Object.values(jobs).map(({ report: _report, error: _error, ...job }) => job);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ owner, jobs: entries }));
  } catch { /* 저장이 제한된 브라우저에서도 현재 탭의 분석은 계속한다. */ }
}

function restore(owner: string): AnalysisStore['jobs'] {
  try {
    const raw: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object' || !('owner' in raw) || raw.owner !== owner ||
      !('jobs' in raw) || !Array.isArray(raw.jobs)) return {};
    const jobs: AnalysisStore['jobs'] = {};
    for (const entry of raw.jobs) {
      if (!entry || typeof entry !== 'object' || !Number.isSafeInteger(entry.sessionId) || entry.sessionId <= 0 ||
        typeof entry.startedAt !== 'number' || Date.now() - entry.startedAt > MAX_AGE ||
        !['CHECKING', 'SCORING', 'COMPLETED', 'FAILED', 'ERROR'].includes(entry.state)) continue;
      jobs[entry.sessionId] = {
        sessionId: entry.sessionId, format: entry.format === 'PT' ? 'PT' : entry.format === 'QA' ? 'QA' : undefined,
        state: entry.state, startedAt: entry.startedAt, report: null,
        completedCards: 0, totalCards: entry.format === 'PT' ? 3 : 5,
        createIfMissing: entry.createIfMissing === true, notified: entry.notified === true, error: null,
      };
    }
    return jobs;
  } catch { return {}; }
}

export const useReportAnalysisStore = create<AnalysisStore>((set, get) => ({
  owner: null, jobs: {}, notifications: [],
  syncOwner: () => {
    const owner = getAuthSessionIdentity();
    if (owner === get().owner) return;
    const jobs = owner ? restore(owner) : {};
    set({ owner, jobs, notifications: [] });
    persist(owner, jobs);
  },
  register: (sessionId, format, createIfMissing = false) => {
    get().syncOwner();
    if (!get().owner) return;
    const existing = get().jobs[sessionId];
    if (existing) {
      if ((format && format !== existing.format) || (createIfMissing && !existing.createIfMissing)) {
        get().update(sessionId, { format: format ?? existing.format, createIfMissing: existing.createIfMissing || createIfMissing });
      }
      return;
    }
    const jobs = { ...get().jobs, [sessionId]: {
      sessionId, format, state: 'CHECKING' as const, report: null, completedCards: 0,
      totalCards: format === 'PT' ? 3 : 5, createIfMissing, startedAt: Date.now(), notified: false, error: null,
    } };
    set({ jobs });
    persist(get().owner, jobs);
  },
  update: (sessionId, patch) => {
    const job = get().jobs[sessionId];
    if (!job) return;
    const jobs = { ...get().jobs, [sessionId]: { ...job, ...patch } };
    set({ jobs });
    persist(get().owner, jobs);
  },
  complete: (sessionId, report, notify) => {
    const job = get().jobs[sessionId];
    if (!job) return;
    const shouldNotify = notify && !job.notified;
    const jobs = { ...get().jobs, [sessionId]: {
      ...job, report, format: report.meta.format ?? job.format, state: 'COMPLETED' as const,
      completedCards: report.cards.length, totalCards: report.cards.length,
      error: null, notified: true,
    } };
    set({ jobs, notifications: shouldNotify ? [...get().notifications, sessionId] : get().notifications });
    persist(get().owner, jobs);
  },
  dismiss: (sessionId) => set({ notifications: get().notifications.filter((id) => id !== sessionId) }),
}));
