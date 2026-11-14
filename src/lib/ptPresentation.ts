import { getAuthSessionIdentity, getAuthVersion } from "@/lib/authStorage";
import type { PTPresentationRequest } from "@/types/pt";

export const PT_AUDIO_MAX_BYTES = 25 * 1024 * 1024;
export const PT_TEXT_MAX_LENGTH = 30_000;

export function ptAudioFileName(sessionId: number, mimeType: string, prefix: "presentation" | "answer" = "presentation") {
  const extensions: Record<string, string> = {
    "audio/webm": "webm", "audio/mp4": "m4a", "video/mp4": "mp4",
    "audio/ogg": "ogg", "application/ogg": "ogg", "audio/wav": "wav",
    "audio/x-wav": "wav", "audio/mpeg": "mp3", "audio/mp3": "mp3",
  };
  const extension = extensions[mimeType.split(";")[0].trim().toLowerCase()];
  if (!extension) throw new Error("이 브라우저의 녹음 형식을 지원하지 않아요. 텍스트로 발표해 주세요.");
  return `${prefix}_${sessionId}.${extension}`;
}

interface Draft {
  owner: string | null;
  version: number;
  sessionId: number;
  mode: "AUDIO" | "TEXT";
  text: string;
  pending: PTPresentationRequest | null;
}

let draft: Draft | null = null;
const INPUT_MODE_KEY = "ptInputPreference";

export function getPTInputMode(sessionId: number): "AUDIO" | "TEXT" {
  if (draft?.sessionId === sessionId && draft.owner === getAuthSessionIdentity() && draft.version === getAuthVersion()) return draft.mode;
  try {
    const saved = JSON.parse(sessionStorage.getItem(INPUT_MODE_KEY) ?? "null");
    if (saved?.owner === getAuthSessionIdentity() && saved?.sessionId === sessionId && saved?.mode === "TEXT") return "TEXT";
  } catch {
  }
  return "AUDIO";
}

export function getPTPresentationDraft(sessionId: number): Draft {
  const owner = getAuthSessionIdentity();
  const version = getAuthVersion();
  if (!draft || draft.owner !== owner || draft.version !== version || draft.sessionId !== sessionId) {
    draft = { owner, version, sessionId, mode: getPTInputMode(sessionId), text: "", pending: null };
  }
  return draft;
}

export function setPTTextMode(sessionId: number) {
  const current = getPTPresentationDraft(sessionId);
  current.mode = "TEXT";
  try {
    sessionStorage.setItem(INPUT_MODE_KEY, JSON.stringify({ owner: current.owner, sessionId, mode: "TEXT" }));
  } catch {
  }
}

export function releasePTPresentationDraft(sessionId: number) {
  if (draft?.sessionId === sessionId) {
    draft.pending = null;
    draft.text = "";
  }
}
