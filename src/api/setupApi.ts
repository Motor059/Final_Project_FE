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

export const startInterview = async (
  setupData: any,
  documentFile: File | null,
  selectedDocId: number | null
): Promise<number> => {
  const formData = new FormData();
  formData.append("setupData", new Blob([JSON.stringify(setupData)], { type: "application/json" }));

  if (documentFile) {
    formData.append("file", documentFile);
  }
  else if (selectedDocId) {
     formData.append("docId", String(selectedDocId));
  }

  const response = await api.post("/api/v1/sessions/start", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data.sessionId;
};