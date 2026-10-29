import { api } from "@/api/axios";
import type { ApiResponse } from "@/api/api";

export const presentationApi = {
  getPresentation: async (sessionId: number): Promise<unknown> => {
    const response = await api.get<ApiResponse<unknown>>(
      `/api/v1/sessions/${sessionId}/presentation`,
    );

    return response.data.data;
  },
};