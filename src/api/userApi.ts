import { api } from '@/api/axios';
import type { UserResponse } from '@/types/user';

export const getMyInfo = async (): Promise<UserResponse> => {
  const response = await api.get('/api/v1/users/me');
  return response.data.data;
};

export const updateNickname = async (
  nickname: string,
): Promise<UserResponse> => {
  const response = await api.patch(
    "/api/v1/users/me",
    {
      nickname,
    },
  );

  return response.data.data;
};

export const deleteMyAccount = async (): Promise<void> => {
  await api.delete("/api/v1/users/me");
};