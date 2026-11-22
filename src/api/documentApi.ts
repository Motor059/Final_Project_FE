import { api } from '@/api/axios';
import { getAuthVersion } from '@/lib/authStorage';
import { createSessionSnapshot } from '@/lib/sessionSnapshot';

import type {
  DocumentItem,
  DocumentRenameResponse,
} from "@/types/document";

const documentsSnapshot = createSessionSnapshot<DocumentItem[]>();
let documentsRevision = 0;
export const getCachedDocuments = () => documentsSnapshot.read();

export const getDocuments = async (): Promise<DocumentItem[]> => {
  const version = getAuthVersion();
  const revision = documentsRevision;
  const response =
    await api.get("/api/v1/documents");

  const data: DocumentItem[] = revision === documentsRevision ? response.data.data : documentsSnapshot.read() ?? response.data.data;
  documentsSnapshot.write(data, version);
  return data;
};

export const uploadDocument = async (
  file: File,
  signal?: AbortSignal,
): Promise<DocumentItem> => {
  const version = getAuthVersion();
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/v1/documents",
    formData,
    {
      signal,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const document: DocumentItem = response.data.data;
  if (version === getAuthVersion()) documentsRevision++;
  const previous = documentsSnapshot.read();
  if (previous) documentsSnapshot.write([...previous.filter((item) => item.docId !== document.docId), document], version);
  return document;
};

export const renameDocument = async (
  docId: number,
  fileName: string,
): Promise<DocumentRenameResponse> => {
  const version = getAuthVersion();
  const response = await api.patch(
    `/api/v1/documents/${docId}`,
    {
      fileName,
    },
  );

  const updated: DocumentRenameResponse = response.data.data;
  if (version === getAuthVersion()) documentsRevision++;
  const previous = documentsSnapshot.read();
  if (previous) documentsSnapshot.write(previous.map((item) => item.docId === docId ? { ...item, fileName: updated.fileName } : item), version);
  return updated;
};

export const deleteDocument = async (
  docId: number,
): Promise<void> => {
  const version = getAuthVersion();
  await api.delete(`/api/v1/documents/${docId}`);
  if (version === getAuthVersion()) documentsRevision++;
  const previous = documentsSnapshot.read();
  if (previous) documentsSnapshot.write(previous.filter((item) => item.docId !== docId), version);
};
