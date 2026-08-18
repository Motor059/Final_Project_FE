// src/api/userApi.ts
import { axiosInstance } from './axiosInstance';
import type { UserResponse } from '@/types/user';

export const getMyInfo = async (): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>('/api/v1/users/me');
  return response.data;
};