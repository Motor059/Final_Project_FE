import { useEffect, useRef, useState } from "react";
import { CanceledError, isAxiosError, isCancel } from "axios";
import { getCachedPTOptions, ptApi } from "@/api/ptApi";
import { getAuthVersion } from "@/lib/authStorage";
import { ensureInterviewAuthentication } from "@/lib/guestAuth";
import { getPTCreateRequest, ptErrorMessage, rememberCreatedPTSession, resetPTCreation } from "@/lib/ptSession";
import type { PTCreateSessionInput, PTOptions } from "@/types/pt";

export default function usePTSetup() {
  const [options, setOptions] = useState<PTOptions | null>(getCachedPTOptions);
  const [isLoading, setIsLoading] = useState(options === null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(false);
  const creationRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      creationRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        await ensureInterviewAuthentication();
        if (controller.signal.aborted) return;
        const data = await ptApi.getOptions(controller.signal);
        if (!controller.signal.aborted) setOptions(data);
      } catch (failure) {
        if (!controller.signal.aborted && !isCancel(failure)) {
          if (isAxiosError(failure) && failure.response?.status === 404) {
            setError("현재 PT 면접을 이용할 수 없어요. 일반 면접을 이용하거나 잠시 후 다시 시도해 주세요.");
          } else {
            setError(ptErrorMessage(failure, "PT 설정을 불러오지 못했습니다."));
          }
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [retryCount]);

  const createSession = async (input: PTCreateSessionInput) => {
    if (creationRef.current) throw new Error("PT 면접을 준비하고 있습니다.");
    const controller = new AbortController();
    creationRef.current = controller;
    setIsCreating(true);
    try {
      await ensureInterviewAuthentication();
      if (controller.signal.aborted) throw new CanceledError();
      const version = getAuthVersion();
      const request = getPTCreateRequest(input);
      const session = await ptApi.createSession(request, controller.signal);
      if (controller.signal.aborted || !mountedRef.current || version !== getAuthVersion()) {
        throw new CanceledError();
      }
      rememberCreatedPTSession(request.requestId, session.sessionId);
      return session;
    } catch (failure) {
      if (isAxiosError<{ message?: string }>(failure) && (
        failure.response?.status === 410 ||
        (failure.response?.status === 409 && failure.response.data.message?.includes("다른 조건"))
      )) {
        resetPTCreation();
      }
      throw failure;
    } finally {
      if (creationRef.current === controller) creationRef.current = null;
      if (mountedRef.current) setIsCreating(false);
    }
  };

  return { options, isLoading, error, isCreating, createSession, retry: () => {
    setError(null);
    setIsLoading(options === null);
    setRetryCount((count) => count + 1);
  } };
}
