import { useEffect, useState } from "react";
import { deleteDocument, getDocuments, renameDocument, uploadDocument } from "@/api/documentApi";
import type { DocumentItem } from "@/types/document";

export default function useDocuments(enabled: boolean) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const fetchDocuments = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getDocuments();
        if (active) setDocuments(data);
      } catch (error) {
        if (active) {
          console.error("서류 목록 조회 실패:", error);
          setIsError(true);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void fetchDocuments();
    return () => { active = false; };
  }, [enabled]);

  const addDocument = async (file: File) => {
    const document = await uploadDocument(file);
    setDocuments((current) => [...current, document]);
  };
  const changeDocumentName = async (docId: number, fileName: string) => {
    const updated = await renameDocument(docId, fileName);
    setDocuments((current) => current.map((document) =>
      document.docId === docId ? { ...document, fileName: updated.fileName } : document,
    ));
  };
  const removeDocument = async (docId: number) => {
    await deleteDocument(docId);
    setDocuments((current) => current.filter((document) => document.docId !== docId));
  };

  return {
    documents: enabled ? documents : [],
    isLoading: enabled && isLoading,
    isError: enabled && isError,
    addDocument, changeDocumentName, removeDocument,
  };
}
