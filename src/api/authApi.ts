import { api } from '@/api/axios';
import type { ApiResponse } from './api';

export interface GuestLoginResponse {
  userId: number;
  accessToken: string;
  nickname: string;
}

export interface KakaoLoginRequest {
  authorizationCode: string;
  termsAgreed: boolean;
}

export interface KakaoLoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: number;
    nickname: string;
    createdAt: string;
  };
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  startGuest: async (): Promise<GuestLoginResponse> => {
    const response = await api.post<ApiResponse<GuestLoginResponse>>('/api/v1/auth/guest');
    const data = response.data.data;
    if (!data || !Number.isSafeInteger(data.userId) || data.userId <= 0 || typeof data.accessToken !== 'string' || !data.accessToken.trim()) {
      throw new Error('체험 인증 응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
    return data;
  },
  kakaoLogin: async (data: KakaoLoginRequest): Promise<KakaoLoginResponse> => {
    const response = await api.post<ApiResponse<KakaoLoginResponse>>('/api/v1/auth/kakao/login', data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout');
  },
};