import { api } from '@/api/axios';

import type {
  DocumentItem,
  DocumentRenameResponse,
} from "@/types/document";

export const getDocuments = async (): Promise<DocumentItem[]> => {
  const response =
    await api.get("/api/v1/documents");

  return response.data.data;
};

export const uploadDocument = async (
  file: File,
): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/v1/documents",
    formData,
  );

  return response.data.data;
};

export const renameDocument = async (
  docId: number,
  fileName: string,
): Promise<DocumentRenameResponse> => {
  const response = await api.patch(
    `/api/v1/documents/${docId}`,
    {
      fileName,
    },
  );

  return response.data.data;
};

export const deleteDocument = async (
  docId: number,
): Promise<void> => {
  await api.delete(`/api/v1/documents/${docId}`);
};