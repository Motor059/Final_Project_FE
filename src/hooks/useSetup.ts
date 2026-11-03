import { isAxiosError, isCancel } from 'axios';
import { getAuthVersion } from '@/lib/authStorage';
import { ensureInterviewAuthentication } from '@/lib/guestAuth';
import { useEffect, useRef, useState } from 'react';
import { createSession, getGenerationStatus, getInterviewOptions } from '@/api/setupApi';
import { uploadDocument } from '@/api/documentApi';
import { interviewApi } from '@/api/interviewApi';
import type { CreateSessionRequest, InterviewOptionsData, PreparedInterview } from '@/types/setup';

const POLLING_INTERVAL = 1500;
const GENERATION_TIMEOUT = 5 * 60 * 1000;
interface Preparation {
  controller: AbortController;
  sessionId: number | null;
  handedOff: boolean;
  cancelled: boolean;
}

function aborted() {
  return new DOMException('면접 준비가 취소되었습니다.', 'AbortError');
}

function waitForPoll(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(aborted()); return; }
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(aborted());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, POLLING_INTERVAL);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function cancelCreatedSession(operation: Preparation) {
  if (!operation.sessionId || operation.handedOff || operation.cancelled) return;
  operation.cancelled = true;
  try {
    await interviewApi.cancelSession(operation.sessionId);
  } catch (error) {
    console.warn('준비 중 세션 취소 요청 실패:', error);
  }
}

export default function useSetup() {
  const [options, setOptions] = useState<InterviewOptionsData | null>(null);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const preparationRef = useRef<Preparation | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    const fetchOptions = async () => {
      try {
        const data = await getInterviewOptions(controller.signal);
        if (!controller.signal.aborted) setOptions(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('면접 설정 선택지 조회 실패:', error);
          setIsError(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsOptionsLoading(false);
      }
    };
    void fetchOptions();
    return () => {
      mountedRef.current = false;
      controller.abort();
      const preparation = preparationRef.current;
      preparationRef.current = null;
      if (preparation && !preparation.handedOff) {
        preparation.controller.abort();
        void cancelCreatedSession(preparation);
      }
    };
  }, []);

  const completePreparation = (sessionId: number) => {
    const operation = preparationRef.current;
    if (operation?.sessionId === sessionId) {
      operation.handedOff = true;
      preparationRef.current = null;
    }
  };

  const startInterview = async (
    request: CreateSessionRequest,
    documentFile?: File | null,
    selectedDocId?: number | null,
  ): Promise<PreparedInterview> => {
    if (preparationRef.current) throw new Error('면접을 이미 준비하고 있습니다.');
    const operation: Preparation = { controller: new AbortController(), sessionId: null, handedOff: false, cancelled: false };
    preparationRef.current = operation;
    const { signal } = operation.controller;
    let timedOut = false;
    let authVersion: number | null = null;
    let deadline: ReturnType<typeof setTimeout> | null = null;
    const ensureActive = () => {
      if (signal.aborted || !mountedRef.current || preparationRef.current !== operation || (authVersion !== null && authVersion !== getAuthVersion())) throw aborted();
    };
    setIsStarting(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      ensureActive();
      const sessionType = await ensureInterviewAuthentication();
      authVersion = getAuthVersion();
      ensureActive();
      const isGuest = sessionType === 'GUEST';
      if (isGuest && documentFile) throw new Error('지원 서류를 사용하려면 먼저 로그인해 주세요.');
      let finalDocId = isGuest ? undefined : selectedDocId ?? request.docId;
      if (documentFile) {
        const document = await uploadDocument(documentFile, signal);
        finalDocId = document.docId;
      }
      ensureActive();
      const sessionRequest: CreateSessionRequest = { ...request };
      delete sessionRequest.docId;
      if (!isGuest && finalDocId !== undefined) sessionRequest.docId = finalDocId;
      const session = await createSession(sessionRequest);
      operation.sessionId = session.sessionId;
      ensureActive();
      deadline = setTimeout(() => {
        timedOut = true;
        operation.controller.abort();
      }, GENERATION_TIMEOUT);
      while (true) {
        const status = await getGenerationStatus(session.sessionId, signal);
        ensureActive();
        if (status.status === 'READY') return { sessionId: session.sessionId, docId: finalDocId ?? null };
        if (status.status === 'FAILED') throw new Error('질문 생성에 실패했습니다.');
        await waitForPoll(signal);
        ensureActive();
      }
    } catch (error) {
      void cancelCreatedSession(operation);
      if ((signal.aborted && !timedOut) || !mountedRef.current || isCancel(error)) {
        if (preparationRef.current === operation) preparationRef.current = null;
        throw aborted();
      }
      const serverMessage = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      const message = timedOut ? '질문 생성이 지연되고 있습니다. 잠시 후 면접 준비를 다시 시도해 주세요.'
        : typeof serverMessage === 'string' && serverMessage.trim() ? serverMessage
        : error instanceof Error && !isAxiosError(error) ? error.message
        : '면접 준비 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      if (preparationRef.current === operation) {
        preparationRef.current = null;
        setIsError(true);
        setErrorMessage(message);
      }
      throw new Error(message);
    } finally {
      if (deadline !== null) clearTimeout(deadline);
      if (mountedRef.current && preparationRef.current === operation) setIsStarting(false);
      if (mountedRef.current && preparationRef.current === null) setIsStarting(false);
    }
  };

  return { options, isOptionsLoading, isStarting, isError, errorMessage, startInterview, completePreparation };
}
