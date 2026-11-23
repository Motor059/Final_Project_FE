import { useEffect, useState } from "react";
import { deleteDocument, getCachedDocuments, getDocuments, renameDocument, uploadDocument } from "@/api/documentApi";
import { getAuthVersion } from "@/lib/authStorage";
import type { DocumentItem } from "@/types/document";

interface DocumentQuery { version: number; data: DocumentItem[] | null; error: boolean; }

export default function useDocuments(enabled: boolean) {
  const version = getAuthVersion();
  const [query, setQuery] = useState<DocumentQuery>(() => ({ version, data: enabled ? getCachedDocuments() : null, error: false }));
  const [retryCount, setRetryCount] = useState(0);
  const current = query.version === version ? query : null;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const load = async () => {
      try {
        const data = await getDocuments();
        if (active && version === getAuthVersion()) setQuery({ version, data, error: false });
      } catch (error) {
        if (active && version === getAuthVersion()) {
          console.error("서류 목록 조회 실패:", error);
          setQuery((previous) => previous.version === version && previous.data !== null
            ? previous : { version, data: null, error: true });
        }
      }
    };
    void load();
    return () => { active = false; };
  }, [enabled, version, retryCount]);

  const addDocument = async (file: File) => {
    const document = await uploadDocument(file);
    if (version !== getAuthVersion()) return;
    setQuery((previous) => ({ version, data: [...(previous.version === version ? previous.data ?? [] : []).filter((item) => item.docId !== document.docId), document], error: false }));
  };
  const changeDocumentName = async (docId: number, fileName: string) => {
    const updated = await renameDocument(docId, fileName);
    if (version !== getAuthVersion()) return;
    setQuery((previous) => previous.version === version && previous.data !== null
      ? { ...previous, data: previous.data.map((item) => item.docId === docId ? { ...item, fileName: updated.fileName } : item) } : previous);
  };
  const removeDocument = async (docId: number) => {
    await deleteDocument(docId);
    if (version !== getAuthVersion()) return;
    setQuery((previous) => previous.version === version && previous.data !== null
      ? { ...previous, data: previous.data.filter((item) => item.docId !== docId) } : previous);
  };
  const retry = () => {
    setQuery((previous) => previous.version === version ? { ...previous, error: false } : { version, data: null, error: false });
    setRetryCount((count) => count + 1);
  };

  return {
    documents: enabled ? current?.data ?? [] : [],
    isLoading: enabled && current?.data == null && !current?.error,
    isError: enabled && !!current?.error,
    addDocument, changeDocumentName, removeDocument, retry,
  };
}
