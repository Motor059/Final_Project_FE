import { getAuthSessionIdentity } from '@/lib/authStorage';

export const ANSWER_SECONDS = 180;
const STORAGE_KEY = 'devoirInterviewTimer';
const ANSWER_MS = ANSWER_SECONDS * 1000;

export interface InterviewTimerCheckpoint {
  owner: string;
  sessionId: number;
  questionId: number;
  remainingMs: number;
  deadline: number | null;
}

function timerOwner() {
  const identity = getAuthSessionIdentity();
  return identity ? `${identity}|${localStorage.getItem('authSessionId') ?? ''}` : '';
}

export function newInterviewTimer(sessionId: number, questionId: number, seconds = ANSWER_SECONDS): InterviewTimerCheckpoint {
  return { owner: timerOwner(), sessionId, questionId, remainingMs: Math.max(0, Math.min(ANSWER_MS, seconds * 1000)), deadline: null };
}

export function remainingInterviewMs(timer: InterviewTimerCheckpoint) {
  return Math.max(0, Math.min(ANSWER_MS, timer.deadline === null ? timer.remainingMs : timer.deadline - Date.now()));
}

export function saveInterviewTimer(timer: InterviewTimerCheckpoint) {
  if (!timer.owner || timer.owner !== timerOwner()) return;
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(timer)); }
  catch { /* Storage restrictions must not stop the current answer timer. */ }
}

export function loadInterviewTimer(sessionId: number, questionId: number): InterviewTimerCheckpoint | null {
  try {
    const timer: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (!timer || typeof timer !== 'object' || !('owner' in timer) || !timer.owner || timer.owner !== timerOwner() ||
      !('sessionId' in timer) || timer.sessionId !== sessionId || !('questionId' in timer) || timer.questionId !== questionId ||
      !('remainingMs' in timer) || typeof timer.remainingMs !== 'number' || !Number.isFinite(timer.remainingMs) || timer.remainingMs < 0 || timer.remainingMs > ANSWER_MS ||
      !('deadline' in timer) || (timer.deadline !== null && (typeof timer.deadline !== 'number' || !Number.isFinite(timer.deadline)))) return null;
    return timer as InterviewTimerCheckpoint;
  } catch { return null; }
}

export function restoredInterviewSeconds(sessionId: number, questionId: number) {
  const timer = loadInterviewTimer(sessionId, questionId);
  return timer ? Math.ceil(remainingInterviewMs(timer) / 1000) : null;
}

export function resetInterviewTimer(sessionId: number, questionId: number) {
  saveInterviewTimer(newInterviewTimer(sessionId, questionId));
}

export function clearInterviewTimer(sessionId: number, questionId: number) {
  if (!loadInterviewTimer(sessionId, questionId)) return;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Best-effort cleanup. */ }
}
