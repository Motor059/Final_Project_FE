import { isAxiosError } from 'axios';
import { api } from '@/api/axios';

export const QUESTION_AUDIO_FALLBACK = '질문 음성을 재생하지 못했어요. 화면의 질문을 보고 답변해 주세요.';

async function audioErrorMessage(data: unknown): Promise<string> {
  try {
    const body: unknown = data instanceof Blob ? JSON.parse(await data.text()) : data;
    if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
  } catch {
    // A proxy may return an empty or non-JSON error body.
  }
  return QUESTION_AUDIO_FALLBACK;
}

export async function getQuestionAudio(questionId: number, signal: AbortSignal): Promise<Blob> {
  if (!Number.isSafeInteger(questionId) || questionId <= 0) throw new Error(QUESTION_AUDIO_FALLBACK);

  let data: Blob;
  try {
    const response = await api.get<Blob>(`/api/v1/questions/${questionId}/audio`, {
      responseType: 'blob',
      signal,
      timeout: 25_000,
      headers: { Accept: 'audio/mpeg, application/json' },
    });
    data = response.data;
  } catch (error) {
    // Blob requests also receive JSON error responses as blobs.
    const message = await audioErrorMessage(isAxiosError(error) ? error.response?.data : undefined);
    throw new Error(message, { cause: error });
  }

  if (!(data instanceof Blob) || data.size === 0) throw new Error(QUESTION_AUDIO_FALLBACK);
  const contentType = data.type.split(';')[0].trim().toLowerCase();
  if (contentType === 'application/json' || contentType.endsWith('+json')) {
    throw new Error(await audioErrorMessage(data));
  }
  if (contentType && !contentType.startsWith('audio/') && contentType !== 'application/octet-stream') {
    throw new Error(QUESTION_AUDIO_FALLBACK);
  }
  // The endpoint returns raw MP3 bytes, not an ApiResponse envelope.
  return contentType.startsWith('audio/') ? data : new Blob([data], { type: 'audio/mpeg' });
}
