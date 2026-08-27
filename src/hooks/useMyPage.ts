import { useEffect, useState } from "react";

import {
  deleteMyAccount,
  getMyInfo,
  updateNickname,
} from "@/api/userApi";
import {
  deleteDocument,
  getDocuments,
  renameDocument,
  uploadDocument,
} from "@/api/documentApi";

import type { UserResponse } from "@/types/user";
import type { DocumentItem } from "@/types/document";

export default function useMyPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const [userData, documentData] = await Promise.all([
          getMyInfo(),
          getDocuments(),
        ]);

        setUser(userData);
        setDocuments(documentData.documents);
      } catch (error) {
        console.error("마이페이지 조회 실패:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  const changeNickname = async (nickname: string) => {
    const updatedUser = await updateNickname(nickname);
    setUser(updatedUser);
  };

  const addDocument = async (file: File) => {
    const newDocument = await uploadDocument(file);

    setDocuments((currentDocuments) => [
      ...currentDocuments,
      newDocument,
    ]);
  };

  const changeDocumentName = async (
    docId: number,
    fileName: string,
  ) => {
    const updatedDocument = await renameDocument(docId, fileName);

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.docId === docId
          ? {
              ...document,
              fileName: updatedDocument.fileName,
            }
          : document,
      ),
    );
  };

  const removeDocument = async (docId: number) => {
    await deleteDocument(docId);

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) => document.docId !== docId,
      ),
    );
  };

  const removeAccount = async () => {
    await deleteMyAccount();
  };

  return {
    user,
    documents,
    isLoading,
    isError,
    changeNickname,
    addDocument,
    changeDocumentName,
    removeDocument,
    removeAccount,
  };
}