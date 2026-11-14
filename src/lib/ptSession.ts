import { isAxiosError } from "axios";
import { getAuthSessionIdentity } from "@/lib/authStorage";
import type { PTCreateSessionInput, PTCreateSessionRequest, PTPhase, PTTrack } from "@/types/pt";

const CREATE_REQUEST_KEY = "ptCreateRequest";

interface PendingPTCreation {
  owner: string;
  request: PTCreateSessionRequest;
  sessionId?: number;
}

export function readPendingPTCreation(): PendingPTCreation | null {
  try {
    const raw = sessionStorage.getItem(CREATE_REQUEST_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as PendingPTCreation;
    const request = stored?.request;
    if (
      !stored || !stored.owner || stored.owner !== getAuthSessionIdentity() ||
      !request || typeof request.requestId !== "string" ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(request.requestId) ||
      !Number.isSafeInteger(request.companyId) || request.companyId <= 0 ||
      !Number.isSafeInteger(request.preparationMinutes) || request.preparationMinutes <= 0 ||
      (request.jobRole !== undefined && typeof request.jobRole !== "string")
    ) return null;
    return stored;
  } catch {
    return null;
  }
}

export function getPTCreateRequest(input: PTCreateSessionInput): PTCreateSessionRequest {
  const owner = getAuthSessionIdentity();
  if (!owner) throw new Error("면접 인증을 확인하지 못했습니다. 다시 시작해 주세요.");
  const pending = readPendingPTCreation();
  if (
    pending?.request.companyId === input.companyId &&
    pending.request.preparationMinutes === input.preparationMinutes &&
    (pending.request.jobRole ?? "") === (input.jobRole ?? "")
  ) return pending.request;

  const request = { ...input, requestId: crypto.randomUUID() };
  try {
    sessionStorage.setItem(CREATE_REQUEST_KEY, JSON.stringify({ owner, request }));
  } catch {
    throw new Error("요청 정보를 보관하지 못했습니다. 브라우저 저장소를 허용한 뒤 다시 시작해 주세요.");
  }
  return request;
}

export function rememberCreatedPTSession(requestId: string, sessionId: number) {
  const pending = readPendingPTCreation();
  if (pending?.request.requestId !== requestId) return;
  try {
    sessionStorage.setItem(CREATE_REQUEST_KEY, JSON.stringify({ ...pending, sessionId }));
  } catch (error) {
    console.warn("PT 세션 요청 보관 실패:", error);
  }
}

export function completePTCreation(sessionId: number) {
  try {
    if (readPendingPTCreation()?.sessionId === sessionId) sessionStorage.removeItem(CREATE_REQUEST_KEY);
  } catch (error) {
    console.warn("PT 생성 요청 정리 실패:", error);
  }
}

export function resetPTCreation() {
  try {
    sessionStorage.removeItem(CREATE_REQUEST_KEY);
  } catch (error) {
    console.warn("PT 생성 요청 초기화 실패:", error);
  }
}

export function ptPreparationPath(sessionId: number) {
  return `/pt/preparation?sessionId=${sessionId}`;
}

export function ptPresentationPath(sessionId: number) {
  return `/pt/presentation?sessionId=${sessionId}`;
}

export function ptInterviewPath(sessionId: number) {
  return `/pt/interview?sessionId=${sessionId}`;
}

export function clearPTSessionReference(sessionId: number) {
  try {
    if (sessionStorage.getItem("ptPreparationSessionId") === String(sessionId)) {
      sessionStorage.removeItem("ptPreparationSessionId");
    }
  } catch {
    console.warn("PT 세션 참조 정리 실패:", sessionId);
  }
}

export function resolvePTSessionId(search: string, stateId: unknown): number | undefined {
  const query = new URLSearchParams(search);
  let storedId: string | null = null;
  try {
    storedId = sessionStorage.getItem("ptPreparationSessionId");
  } catch {
    console.warn("PT 세션 참조 조회 실패");
  }
  const raw = String(query.has("sessionId") ? query.get("sessionId") : stateId ?? storedId ?? "");
  return /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw)) ? Number(raw) : undefined;
}

export const ptTrackLabels: Record<PTTrack, string> = {
  SECURITY: "보안", UI_UX: "UI/UX", AI: "AI", DATA: "데이터",
};

export const ptPhaseLabels: Record<PTPhase, string> = {
  PREPARING: "발표 준비 중", PRESENTING: "발표 중", GENERATING: "질문 준비 중",
  QUESTIONING: "질의응답 중", COMPLETED: "면접 완료", CANCELLED: "취소된 면접",
};

export function formatPTTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ptErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 410) return "체험 PT 면접의 접근 기한이 지났습니다. 새 면접을 시작해 주세요.";
    if (error.response?.status === 404) return error.response.data?.message || "PT 면접을 찾을 수 없습니다. 계정과 주소를 확인해 주세요.";
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
