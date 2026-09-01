import { api } from '@/api/axios';
import type { ApiResponse } from './api';

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
  kakaoLogin: async (data: KakaoLoginRequest): Promise<KakaoLoginResponse> => {
    const response = await api.post<ApiResponse<KakaoLoginResponse>>('/api/v1/auth/kakao/login', data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout');
  },
};