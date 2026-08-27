import { axiosInstance } from "./axiosInstance";

import type {
  CreateSessionData,
  CreateSessionRequest,
  GenerationStatusData,
  InterviewOptionsData,
} from "@/types/setup";

export const getInterviewOptions =
  async (): Promise<InterviewOptionsData> => {
    const response =
      await axiosInstance.get<InterviewOptionsData>(
        "/api/v1/interview-options",
      );

    return response.data;
  };

export const createSession = async (
  request: CreateSessionRequest,
): Promise<CreateSessionData> => {
  const response =
    await axiosInstance.post<CreateSessionData>(
      "/api/v1/sessions",
      request,
    );

  return response.data;
};

export const getGenerationStatus = async (
  sessionId: number,
): Promise<GenerationStatusData> => {
  const response =
    await axiosInstance.get<GenerationStatusData>(
      `/api/v1/sessions/${sessionId}/generation-status`,
    );

  return response.data;
};