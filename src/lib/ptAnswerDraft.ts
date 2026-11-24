import { getAuthSessionIdentity, getAuthVersion } from "@/lib/authStorage";
import type { PTAnswerRequest, PTQuestion } from "@/types/pt";

interface PTAnswerDraft {
  owner: string | null;
  version: number;
  sessionId: number;
  question: PTQuestion;
  text: string;
  textModeLocked: boolean;
  pending: PTAnswerRequest | null;
}
let draft: PTAnswerDraft | null = null;

export function getPTAnswerDraft(sessionId: number, question: PTQuestion) {
  const owner = getAuthSessionIdentity();
  const version = getAuthVersion();
  if (!draft || draft.owner !== owner || draft.version !== version || draft.sessionId !== sessionId || draft.question.questionId !== question.questionId) {
    draft = { owner, version, sessionId, question, text: "", textModeLocked: false, pending: null };
  }
  return draft;
}

export function releasePTAnswerDraft(sessionId: number, answeredCount?: number) {
  if (draft?.sessionId === sessionId && (answeredCount === undefined || answeredCount >= draft.question.ordinal)) draft = null;
}
