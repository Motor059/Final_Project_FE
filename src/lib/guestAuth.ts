import { isAxiosError, CanceledError } from 'axios';
import { authApi } from '@/api/authApi';
import { clearGuestSession, getAuthVersion, hasMemberSession, hasUsableGuestToken, saveGuestSession } from '@/lib/authStorage';

let guestOperation: { version: number; promise: Promise<void> } | null = null;
let retryAfter = 0;

function issuanceDelay() {
  return new Error(`체험 인증 요청이 잠시 제한됐어요. 약 ${Math.max(1, Math.ceil((retryAfter - Date.now()) / 1000))}초 후 다시 시작해 주세요.`);
}

export async function ensureInterviewAuthentication(): Promise<'GUEST' | 'MEMBER'> {
  if (hasMemberSession()) return 'MEMBER';
  if (hasUsableGuestToken()) return 'GUEST';
  if (guestOperation?.version === getAuthVersion()) {
    await guestOperation.promise;
    return hasMemberSession() ? 'MEMBER' : 'GUEST';
  }
  if (retryAfter > Date.now()) throw issuanceDelay();
  clearGuestSession();
  const version = getAuthVersion();
  const promise = authApi.startGuest().then((data) => {
    if (version !== getAuthVersion()) throw new CanceledError('인증 상태가 변경되어 이전 체험 인증을 취소했습니다.');
    saveGuestSession(data.accessToken);
  }).catch((error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 429) {
      const seconds = Number(error.response.headers['retry-after']);
      retryAfter = Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 60_000);
      throw issuanceDelay();
    }
    throw error;
  }).finally(() => {
    if (guestOperation?.promise === promise) guestOperation = null;
  });
  guestOperation = { version, promise };
  await promise;
  return hasMemberSession() ? 'MEMBER' : 'GUEST';
}
