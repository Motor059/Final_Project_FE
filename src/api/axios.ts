import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearAuthStorage, clearGuestSession, getAuthVersion, isGuestSession } from '@/lib/authStorage';
import type { TokenRefreshResponse } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const REQUEST_TIMEOUT = 180000;

interface ApiErrorData {
  code?: number | string;
  message?: string;
  data?: { nextAction?: { type?: string } };
}
type RetryRequest = InternalAxiosRequestConfig & { _retry?: boolean; _authVersion?: number };
let refreshOperation: { version: number; promise: Promise<TokenRefreshResponse> } | null = null;

function isAuthRequest(url?: string) {
  return url?.includes('/auth/kakao/login') || url?.includes('/auth/token/refresh') || url?.includes('/auth/guest');
}

function isPublicRequest(url?: string) {
  return isAuthRequest(url) || url?.split('?')[0].endsWith('/interview-options');
}

function changedSession() {
  return new axios.CanceledError('로그인 상태가 변경되어 이전 요청을 취소했습니다.');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

function expireSession() {
  clearAuthStorage();
  window.location.href = '/';
}

function refreshTokens(version: number): Promise<TokenRefreshResponse> {
  if (version !== getAuthVersion()) return Promise.reject(changedSession());
  if (refreshOperation?.version === version) return refreshOperation.promise;
  const refreshToken = localStorage.getItem('refreshToken');
  const promise: Promise<TokenRefreshResponse> = axios.post(
    `${API_BASE_URL}/api/v1/auth/token/refresh`,
    { refreshToken },
    { timeout: REQUEST_TIMEOUT, headers: { 'Content-Type': 'application/json' } },
  ).then((response) => {
    const tokens: TokenRefreshResponse | undefined = response.data?.data;
    if (!tokens?.accessToken || !tokens.refreshToken) {
      throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
    }
    if (version !== getAuthVersion() || localStorage.getItem('refreshToken') !== refreshToken) {
      throw changedSession();
    }
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    return tokens;
  }).catch((error: unknown) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (
      (status === 400 || status === 401 || status === 403) &&
      version === getAuthVersion() &&
      localStorage.getItem('refreshToken') === refreshToken
    ) expireSession();
    throw error;
  }).finally(() => {
    if (refreshOperation?.promise === promise) refreshOperation = null;
  });
  refreshOperation = { version, promise };
  return promise;
}

api.interceptors.request.use((config) => {
  const request = config as RetryRequest;
  if (request._authVersion !== undefined && request._authVersion !== getAuthVersion()) throw changedSession();
  request._authVersion = getAuthVersion();
  const token = localStorage.getItem('accessToken');
  if (isPublicRequest(config.url)) config.headers.delete('Authorization');
  else if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const version = (response.config as RetryRequest)._authVersion;
    if (version !== undefined && version !== getAuthVersion()) return Promise.reject(changedSession());
    return response;
  },
  async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config as RetryRequest | undefined;
    if (originalRequest?._authVersion !== undefined && originalRequest._authVersion !== getAuthVersion()) {
      return Promise.reject(changedSession());
    }
    if (!error.response) return Promise.reject(error);
    const status = error.response.status;
    const errorData = error.response.data;
    const isUnauthorized = status === 401 || Number(errorData?.code) === 401;
    if (isUnauthorized && originalRequest && !isPublicRequest(originalRequest.url)) {
      const version = originalRequest._authVersion ?? getAuthVersion();
      const authorization = originalRequest.headers.Authorization;
      const accessToken = localStorage.getItem('accessToken');
      if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') || !accessToken) {
        return Promise.reject(error);
      }
      if (authorization === `Bearer ${accessToken}` && isGuestSession()) {
        clearGuestSession();
        return Promise.reject(new Error('체험 인증을 확인하지 못했습니다. 새 면접을 시작하거나 로그인 후 다시 시도해 주세요.'));
      }
      if (originalRequest._retry) {
        if (authorization === `Bearer ${accessToken}`) expireSession();
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      if (authorization !== `Bearer ${accessToken}`) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      }
      if (!localStorage.getItem('refreshToken')) {
        expireSession();
        return Promise.reject(error);
      }
      let tokens: TokenRefreshResponse;
      try {
        tokens = await refreshTokens(version);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
      if (version !== getAuthVersion()) return Promise.reject(changedSession());
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(originalRequest);
    }
    if ((status === 400 || status === 502) && errorData?.data?.nextAction?.type === 'RETRY_INPUT') {
      return Promise.reject({ type: 'RETRY_INPUT', message: errorData.message });
    }
    if (status === 422) return Promise.reject({ type: 'TOO_SHORT', message: errorData?.message });
    return Promise.reject(error);
  },
);
