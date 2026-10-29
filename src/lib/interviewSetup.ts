import type { InterviewSetup, LastInterviewSetting, SavedInterviewSetup } from '@/types/setup';

const SETUP_KEY = 'interviewSetup';
const positiveId = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const optionalText = (value: unknown) => typeof value === 'string' ? value : '';

export function parseInterviewSetup(value: unknown): InterviewSetup | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;
  const companyType = item.companyType;
  const interviewStage = item.interviewStage;
  if (companyType !== 'BIG_TECH_SW' && companyType !== 'SERVICE' && companyType !== 'FINANCE_IT') return null;
  if (interviewStage !== 'TECHNICAL' && interviewStage !== 'PERSONALITY') return null;
  return {
    companyType,
    interviewStage,
    interviewType: item.interviewType === 'PT' ? 'PT' : 'QA',
    prepMinutes:
      item.prepMinutes === 10 ||
        item.prepMinutes === 20 ||
        item.prepMinutes === 30
        ? item.prepMinutes
        : 20,
    companyName: optionalText(item.companyName),
    jobRole: optionalText(item.jobRole),
    jobDescription: optionalText(item.jobDescription),
    docId: positiveId(item.docId) ? item.docId : null,
  };
}

export function readSavedInterviewSetup(userId: number): SavedInterviewSetup | null {
  try {
    const raw = sessionStorage.getItem(SETUP_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    const setup = parseInterviewSetup(value);
    if (!setup || typeof value !== 'object' || value === null) return null;
    const item = value as Record<string, unknown>;
    if (item.userId !== userId || !positiveId(item.sessionId) ||
      typeof item.savedAt !== 'number' || !Number.isFinite(item.savedAt) || item.savedAt <= 0) return null;
    return { ...setup, userId, sessionId: item.sessionId, savedAt: item.savedAt };
  } catch {
    return null;
  }
}

export function saveInterviewSetup(setup: InterviewSetup, sessionId: number, userId: number | null) {
  try {
    const saved: SavedInterviewSetup = { ...setup, sessionId, userId, savedAt: Date.now() };
    sessionStorage.setItem(SETUP_KEY, JSON.stringify(saved));
    sessionStorage.setItem('interviewSessionId', String(sessionId));
  } catch (error) {
    console.warn('최근 면접 설정을 보관하지 못했습니다:', error);
  }
}

export function latestInterviewSetting(sessions: unknown[]): LastInterviewSetting | null {
  const candidates: LastInterviewSetting[] = [];
  for (const value of sessions) {
    const setup = parseInterviewSetup(value);
    if (!setup || typeof value !== 'object' || value === null) continue;
    const item = value as Record<string, unknown>;
    if (!positiveId(item.sessionId) || typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt))) continue;
    candidates.push({ setup, sessionId: item.sessionId, createdAt: item.createdAt });
  }
  candidates.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return candidates[0] || null;
}

export function chooseLastInterviewSetup(saved: SavedInterviewSetup | null, latest: LastInterviewSetting | null): InterviewSetup | null {
  if (!saved) return latest?.setup || null;
  if (!latest || saved.sessionId === latest.sessionId || saved.savedAt >= Date.parse(latest.createdAt)) return saved;
  return latest.setup;
}
