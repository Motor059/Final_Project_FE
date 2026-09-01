import { api } from '@/api/axios';

import type {
  CreateSessionData,
  CreateSessionRequest,
  GenerationStatusData,
  InterviewOptionsData,
} from "@/types/setup";

export const getInterviewOptions =
  async (): Promise<InterviewOptionsData> => {
    const response =
      await api.get(
        "/api/v1/interview-options",
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
): Promise<GenerationStatusData> => {
  const response =
    await api.get(
      `/api/v1/sessions/${sessionId}/generation-status`,
    );

  return response.data.data;
};