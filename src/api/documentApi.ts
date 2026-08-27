import { axiosInstance } from "./axiosInstance";

import type {
  DocumentItem,
  DocumentListResponse,
  DocumentRenameResponse,
} from "@/types/document";

export const getDocuments = async (): Promise<DocumentListResponse> => {
  const response =
    await axiosInstance.get<DocumentListResponse>("/api/v1/documents");

  return response.data;
};

export const uploadDocument = async (
  file: File,
): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<DocumentItem>(
    "/api/v1/documents",
    formData,
  );

  return response.data;
};

export const renameDocument = async (
  docId: number,
  fileName: string,
): Promise<DocumentRenameResponse> => {
  const response = await axiosInstance.patch<DocumentRenameResponse>(
    `/api/v1/documents/${docId}`,
    {
      fileName,
    },
  );

  return response.data;
};

export const deleteDocument = async (
  docId: number,
): Promise<void> => {
  await axiosInstance.delete(`/api/v1/documents/${docId}`);
};