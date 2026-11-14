import { api } from '@/api/axios';

import type {
  CreateSessionData,
  CreateSessionRequest,
  GenerationStatusData,
  InterviewOptionsData,
} from "@/types/setup";

export const getInterviewOptions =
  async (signal?: AbortSignal): Promise<InterviewOptionsData> => {
    const response =
      await api.get(
        "/api/v1/interview-options",
        { signal },
      );

    return response.data.data;
  };

export const createSession = async (
  request: CreateSessionRequest,
): Promise<CreateSessionData> => {
  const response =
    await api.post(
      "/api/v1/sessions",
      request,
    );

  return response.data.data;
};

export const getGenerationStatus = async (
  sessionId: number,
  signal?: AbortSignal,
): Promise<GenerationStatusData> => {
  const response =
    await api.get(
      `/api/v1/sessions/${sessionId}/generation-status`,
      { signal },
    );

  return response.data.data;
};
