import type { UserResponse } from "@/types/user";

let authVersion = 0;

export function getAuthVersion() {
  return authVersion;
}

export function saveAuthSession(tokens: { accessToken: string; refreshToken: string }, user: UserResponse) {
  authVersion++;
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("userInfo", JSON.stringify(user));
  localStorage.removeItem("pendingTerms");
}

export function clearAuthStorage() {
  authVersion++;
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
  if (!localStorage.getItem("accessToken")) {
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
