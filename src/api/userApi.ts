// src/api/userApi.ts
import { axiosInstance } from './axiosInstance';
import type { UserResponse } from '@/types/user';

export const getMyInfo = async (): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>('/api/v1/users/me');
  return response.data;
};

export const updateNickname = async (
  nickname: string,
): Promise<UserResponse> => {
  const response = await axiosInstance.patch<UserResponse>(
    "/api/v1/users/me",
    {
      nickname,
    },
  );

  return response.data;
};

export const deleteMyAccount = async (): Promise<void> => {
  await axiosInstance.delete("/api/v1/users/me");
};