import { api } from "@/api/axios";
import type { ApiResponse } from "@/api/api";
import type { PTAnswerResult, PTAudioAnswerRequest, PTAudioPresentationRequest, PTCreateSessionRequest, PTOptions, PTProgress, PTQuestionProgress, PTSession, PTTextAnswerRequest, PTTextPresentationRequest, PTTrack } from "@/types/pt";
import { ptAudioFileName, PT_AUDIO_MAX_BYTES, PT_TEXT_MAX_LENGTH } from "@/lib/ptPresentation";

function normalizeCancellation<T extends { status: string; phase: string }>(data: T): T {
  if (!data) return data;
  return {
    ...data,
    status: data.status === "CANCELED" ? "CANCELLED" : data.status,
    phase: data.phase === "CANCELED" ? "CANCELLED" : data.phase,
  };
}

function progressData<T extends PTProgress>(data: T, sessionId?: number): T {
  data = normalizeCancellation(data);
  if (
    !data || !Number.isSafeInteger(data.sessionId) || data.sessionId <= 0 ||
    (sessionId !== undefined && data.sessionId !== sessionId) ||
    typeof data.status !== "string" ||
    !["PREPARING", "PRESENTING", "GENERATING", "QUESTIONING", "COMPLETED", "CANCELLED"].includes(data.phase) ||
    !["SELECT_TRACK", "START_PRESENTATION", "SUBMIT_PRESENTATION", "GENERATE_QUESTION", "ANSWER", "FINISH", "NONE"].includes(data.nextAction) ||
    (data.track != null && !["SECURITY", "UI_UX", "AI", "DATA"].includes(data.track)) ||
    !Number.isFinite(Date.parse(data.serverTime)) ||
    !Number.isFinite(Date.parse(data.preparationDeadline)) ||
    (data.phase === "PRESENTING" && (
      !data.track || !Number.isFinite(Date.parse(data.presentationStartedAt ?? "")) ||
      !Number.isFinite(Date.parse(data.presentationDeadline ?? ""))
    ))
  ) throw new Error("PT 진행 상태를 확인하지 못했습니다. 다시 불러와 주세요.");
  return data;
}

function sessionData(data: PTSession): PTSession {
  data = progressData(data);
  if (
    !data || data.format !== "PT" ||
    !Number.isSafeInteger(data.sessionId) || data.sessionId <= 0 ||
    typeof data.task?.content?.title !== "string" ||
    !Number.isFinite(Date.parse(data.serverTime)) ||
    !Number.isFinite(Date.parse(data.preparationDeadline))
  ) {
    throw new Error("PT 세션 응답을 확인하지 못했습니다. 다시 불러와 주세요.");
  }
  return data;
}

function questionData(data: PTQuestionProgress, sessionId: number): PTQuestionProgress {
  data = normalizeCancellation(data);
  const question = data?.question;
  if (!data || data.sessionId !== sessionId || typeof data.status !== "string" ||
    !["PREPARING", "PRESENTING", "GENERATING", "QUESTIONING", "COMPLETED", "CANCELLED"].includes(data.phase) ||
    !["SELECT_TRACK", "START_PRESENTATION", "SUBMIT_PRESENTATION", "GENERATE_QUESTION", "ANSWER", "FINISH", "NONE"].includes(data.nextAction) ||
    data.totalQuestionCount !== 6 || !Number.isInteger(data.answeredCount) || data.answeredCount < 0 || data.answeredCount > 6 ||
    typeof data.processing !== "boolean" ||
    (data.phase === "COMPLETED" && (data.answeredCount !== 6 || data.nextAction !== "FINISH")) ||
    (question != null && (!Number.isSafeInteger(question.questionId) || question.questionId <= 0 ||
      !Number.isInteger(question.ordinal) || question.ordinal < 1 || question.ordinal > 6 ||
      ![1, 2].includes(question.mainNumber) || ![0, 1, 2].includes(question.followUpNumber) ||
      !["MAIN", "FOLLOW_UP"].includes(question.type) || typeof question.content !== "string" || !question.content.trim())) ||
    (!data.processing && data.nextAction === "ANSWER" && (!question || question.ordinal !== data.answeredCount + 1))
  ) throw new Error("PT 질문 응답을 확인하지 못했어요. 상태를 다시 확인해 주세요.");
  return data;
}

function answerData(data: PTAnswerResult, sessionId: number, questionId: number, inputType: "TEXT" | "AUDIO") {
  if (!data || data.questionId !== questionId || data.inputType !== inputType ||
    !Number.isSafeInteger(data.answerId) || data.answerId <= 0 || typeof data.transcript !== "string" ||
    (inputType === "AUDIO" && (!Number.isSafeInteger(data.durationSec) || (data.durationSec ?? 0) < 1))) {
    throw new Error("저장된 PT 답변을 확인하지 못했어요. 같은 요청으로 다시 시도해 주세요.");
  }
  return { ...data, progress: questionData(data.progress, sessionId) };
}

export const ptApi = {
  getOptions: async (signal?: AbortSignal): Promise<PTOptions> => {
    const response = await api.get<ApiResponse<PTOptions>>("/api/v1/pt/options", { signal });
    const data = response.data.data;
    if (!data || !Array.isArray(data.companies) || !Array.isArray(data.tracks) || !Array.isArray(data.preparationMinutes)) {
      throw new Error("PT 설정 응답을 확인하지 못했습니다. 다시 불러와 주세요.");
    }
    return data;
  },

  createSession: async (request: PTCreateSessionRequest, signal?: AbortSignal): Promise<PTSession> => {
    const response = await api.post<ApiResponse<PTSession>>("/api/v1/pt/sessions", request, { signal });
    return sessionData(response.data.data);
  },

  getSession: async (sessionId: number, signal?: AbortSignal): Promise<PTSession> => {
    const response = await api.get<ApiResponse<PTSession>>(`/api/v1/pt/sessions/${sessionId}`, { signal });
    return sessionData(response.data.data);
  },

  selectTrack: async (sessionId: number, track: PTTrack, signal?: AbortSignal): Promise<PTProgress> => {
    const response = await api.put<ApiResponse<PTProgress>>(
      `/api/v1/pt/sessions/${sessionId}/track`, { track }, { signal },
    );
    return progressData(response.data.data, sessionId);
  },

  startPresentation: async (sessionId: number, signal?: AbortSignal): Promise<PTProgress> => {
    const response = await api.post<ApiResponse<PTProgress>>(
      `/api/v1/pt/sessions/${sessionId}/presentation/start`, undefined, { signal },
    );
    return progressData(response.data.data, sessionId);
  },

  cancelSession: async (sessionId: number, signal?: AbortSignal): Promise<PTProgress> => {
    const response = await api.post<ApiResponse<PTProgress>>(
      `/api/v1/pt/sessions/${sessionId}/cancel`, undefined, { signal },
    );
    return progressData(response.data.data, sessionId);
  },

  submitTextPresentation: async (sessionId: number, request: PTTextPresentationRequest, signal?: AbortSignal): Promise<PTProgress> => {
    if (!request.transcript.trim() || request.transcript.length > PT_TEXT_MAX_LENGTH) {
      throw new Error("발표 내용을 1자 이상, 30,000자 이하로 입력해 주세요.");
    }
    const response = await api.post<ApiResponse<PTProgress>>(
      `/api/v1/pt/sessions/${sessionId}/presentation/text`, request, { signal },
    );
    return progressData(response.data.data, sessionId);
  },

  submitAudioPresentation: async (sessionId: number, request: PTAudioPresentationRequest, signal?: AbortSignal): Promise<PTProgress> => {
    if (!request.audio.size || request.audio.size > PT_AUDIO_MAX_BYTES ||
      !Number.isInteger(request.durationSec) || request.durationSec < 1 || request.durationSec > 300) {
      throw new Error("녹음 파일은 25MB 이하, 발표 길이는 1~300초여야 해요.");
    }
    const form = new FormData();
    form.append("requestId", request.requestId);
    form.append("audio", request.audio, ptAudioFileName(sessionId, request.audio.type));
    form.append("durationSec", String(request.durationSec));
    const response = await api.post<ApiResponse<PTProgress>>(
      `/api/v1/pt/sessions/${sessionId}/presentation/audio`, form,
      { signal, timeout: 210_000, headers: { "Content-Type": undefined } },
    );
    return progressData(response.data.data, sessionId);
  },

  getCurrentQuestion: async (sessionId: number, signal?: AbortSignal): Promise<PTQuestionProgress> => {
    const response = await api.get<ApiResponse<PTQuestionProgress>>(`/api/v1/pt/sessions/${sessionId}/questions/current`, { signal, timeout: 15_000 });
    return questionData(response.data.data, sessionId);
  },

  generateNextQuestion: async (sessionId: number, signal?: AbortSignal): Promise<PTQuestionProgress> => {
    const response = await api.post<ApiResponse<PTQuestionProgress>>(`/api/v1/pt/sessions/${sessionId}/questions/next`, undefined, { signal, timeout: 100_000 });
    return questionData(response.data.data, sessionId);
  },

  submitTextAnswer: async (sessionId: number, questionId: number, request: PTTextAnswerRequest, signal?: AbortSignal): Promise<PTAnswerResult> => {
    if (!request.transcript.trim() || request.transcript.length > PT_TEXT_MAX_LENGTH) throw new Error("답변을 1자 이상, 30,000자 이하로 입력해 주세요.");
    const response = await api.post<ApiResponse<PTAnswerResult>>(`/api/v1/pt/sessions/${sessionId}/questions/${questionId}/answers`, request, { signal });
    return answerData(response.data.data, sessionId, questionId, "TEXT");
  },

  submitAudioAnswer: async (sessionId: number, questionId: number, request: PTAudioAnswerRequest, signal?: AbortSignal): Promise<PTAnswerResult> => {
    if (!request.audio.size || request.audio.size > PT_AUDIO_MAX_BYTES || !Number.isSafeInteger(request.durationSec) || request.durationSec < 1) {
      throw new Error("음성 파일은 비어 있지 않은 25MB 이하 파일이어야 하고, 길이는 1초 이상이어야 해요.");
    }
    const form = new FormData();
    form.append("requestId", request.requestId);
    form.append("audio", request.audio, ptAudioFileName(questionId, request.audio.type, "answer"));
    form.append("durationSec", String(request.durationSec));
    const response = await api.post<ApiResponse<PTAnswerResult>>(`/api/v1/pt/sessions/${sessionId}/questions/${questionId}/answers/audio`, form, {
      signal, timeout: 210_000, headers: { "Content-Type": undefined },
    });
    return answerData(response.data.data, sessionId, questionId, "AUDIO");
  },
};
