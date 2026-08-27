import { useEffect, useState } from "react";

import {
  createSession,
  getGenerationStatus,
  getInterviewOptions,
} from "@/api/setupApi";

import type {
  CreateSessionRequest,
  InterviewOptionsData,
} from "@/types/setup";

const POLLING_INTERVAL = 1500;

export default function useSetup() {
  const [options, setOptions] =
    useState<InterviewOptionsData | null>(null);

  const [isOptionsLoading, setIsOptionsLoading] =
    useState(true);

  const [isStarting, setIsStarting] =
    useState(false);

  const [isError, setIsError] =
    useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsOptionsLoading(true);
        setIsError(false);

        const data = await getInterviewOptions();
        setOptions(data);
      } catch (error) {
        console.error("면접 설정 선택지 조회 실패:", error);
        setIsError(true);
      } finally {
        setIsOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const waitUntilReady = async (
    sessionId: number,
  ): Promise<void> => {
    while (true) {
      const data = await getGenerationStatus(sessionId);

      if (data.status === "READY") {
        return;
      }

      if (data.status === "FAILED") {
        throw new Error("질문 생성에 실패했습니다.");
      }

      await new Promise((resolve) =>
        setTimeout(resolve, POLLING_INTERVAL),
      );
    }
  };

  const startInterview = async (
    request: CreateSessionRequest,
  ): Promise<number> => {
    try {
      setIsStarting(true);
      setIsError(false);

      const session = await createSession(request);

      await waitUntilReady(session.sessionId);

      return session.sessionId;
    } catch (error) {
      console.error("면접 생성 실패:", error);
      setIsError(true);
      throw error;
    } finally {
      setIsStarting(false);
    }
  };

  return {
    options,
    isOptionsLoading,
    isStarting,
    isError,
    startInterview,
  };
}