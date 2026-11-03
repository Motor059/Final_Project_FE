import type { UserResponse } from "@/types/user";

let authVersion = 0;

export function getAuthVersion() {
  return authVersion;
}

function accessTokenClaims(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const payload: unknown = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    return typeof payload === 'object' && payload !== null ? payload as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function isGuestSession() {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  const claims = accessTokenClaims(token);
  if (claims?.type === 'GUEST' || claims?.userType === 'GUEST') return true;
  return localStorage.getItem('authSessionType') === 'GUEST' && !localStorage.getItem('refreshToken');
}

export function hasMemberSession() {
  return !!localStorage.getItem('accessToken') && !isGuestSession();
}

export function hasUsableGuestToken() {
  const token = localStorage.getItem('accessToken');
  if (!token || !isGuestSession()) return false;
  const exp = accessTokenClaims(token)?.exp;
  const expiresAt = typeof exp === 'number' && Number.isFinite(exp)
    ? exp * 1000 : Number(localStorage.getItem('guestTokenExpiresAt'));
  return Number.isFinite(expiresAt) && expiresAt > Date.now() + 30_000;
}

export function clearGuestSession() {
  if (!isGuestSession()) return;
  authVersion++;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('authSessionType');
  localStorage.removeItem('guestTokenExpiresAt');
}

export function saveGuestSession(accessToken: string) {
  const exp = accessTokenClaims(accessToken)?.exp;
  const expiresAt = typeof exp === 'number' && Number.isFinite(exp)
    ? exp * 1000 : Date.now() + 6 * 60 * 60 * 1000;
  if (expiresAt <= Date.now()) throw new Error('만료된 체험 인증을 받았습니다. 잠시 후 다시 시도해 주세요.');
  authVersion++;
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  localStorage.setItem('authSessionType', 'GUEST');
  localStorage.setItem('guestTokenExpiresAt', String(expiresAt));
  localStorage.setItem('accessToken', accessToken);
}

export function saveAuthSession(tokens: { accessToken: string; refreshToken: string }, user: UserResponse) {
  authVersion++;
  localStorage.removeItem('authSessionType');
  localStorage.removeItem('guestTokenExpiresAt');
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("userInfo", JSON.stringify(user));
  localStorage.removeItem("pendingTerms");
}

export function clearAuthStorage() {
  authVersion++;
  localStorage.removeItem('authSessionType');
  localStorage.removeItem('guestTokenExpiresAt');
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("pendingTerms");
  sessionStorage.removeItem("interviewSetup");
  sessionStorage.removeItem("interviewSessionId");
  sessionStorage.removeItem("reportLoginReturn");
}

export function readCachedUser(): UserResponse | null {
  const cached = localStorage.getItem("userInfo");
  if (!cached) return null;
  if (!hasMemberSession()) {
    localStorage.removeItem("userInfo");
    return null;
  }
  try {
    const user: unknown = JSON.parse(cached);
    if (
      typeof user === "object" && user !== null &&
      "id" in user && typeof user.id === "number" &&
      "nickname" in user && typeof user.nickname === "string" &&
      "createdAt" in user && typeof user.createdAt === "string"
    ) return user as UserResponse;
  } catch {
    localStorage.removeItem("userInfo");
    return null;
  }
  localStorage.removeItem("userInfo");
  return null;
}
