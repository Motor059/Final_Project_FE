import { getQuestionAudio, QUESTION_AUDIO_FALLBACK } from '@/api/questionAudioApi';
import { getAuthVersion } from '@/lib/authStorage';

export interface QuestionAudioPlayback {
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

interface QuestionAudioOptions {
  questionId: number;
  content: string;
  paused: boolean;
  onComplete: (error?: string) => void;
}

const AUDIO_DELAY_MESSAGE = '질문 음성 재생이 지연되어 종료했어요. 화면의 질문을 보고 답변해 주세요.';
const AUTOPLAY_MESSAGE = '브라우저에서 질문 음성의 자동 재생을 허용하지 않았어요. 화면의 질문을 보고 답변해 주세요.';

// Each presentation owns its request, media element and object URL. Neither
// changing questions nor leaving the page can leave an old question playing.
export function createQuestionAudioPlayback(options: QuestionAudioOptions): QuestionAudioPlayback {
  const controller = new AbortController();
  const authVersion = getAuthVersion();
  let active = true;
  let completed = false;
  let paused = options.paused;
  let audio: HTMLAudioElement | null = null;
  let objectUrl: string | null = null;
  let requestTimer: ReturnType<typeof setTimeout> | undefined;
  let playbackTimer: ReturnType<typeof setInterval> | undefined;
  let remaining = Math.min(180_000, Math.max(45_000, options.content.length * 400));
  let previousTick = performance.now();
  let playAttempt = 0;

  function release() {
    clearTimeout(requestTimer);
    clearInterval(playbackTimer);
    controller.abort();
    window.removeEventListener('devoir:auth-session-change', onAuthChange);
    window.removeEventListener('storage', onAuthChange);
    playAttempt++;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.onloadedmetadata = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio = null;
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function dispose() {
    active = false;
    release();
  }

  function isCurrent() {
    if (!active || completed) return false;
    if (authVersion !== getAuthVersion()) {
      dispose();
      return false;
    }
    return true;
  }

  function onAuthChange() {
    if (authVersion !== getAuthVersion()) dispose();
  }

  function finish(error?: string) {
    if (!isCurrent()) return;
    completed = true;
    release();
    options.onComplete(error);
  }

  function handlePlayError(error: unknown, attempt: number) {
    // Pausing while play() is pending can reject that play with AbortError.
    if (attempt !== playAttempt || paused || !isCurrent()) return;
    const blocked = error instanceof DOMException && error.name === 'NotAllowedError';
    finish(blocked ? AUTOPLAY_MESSAGE : QUESTION_AUDIO_FALLBACK);
  }

  function play() {
    if (!isCurrent() || paused || !audio) return;
    const element = audio;
    const attempt = ++playAttempt;
    try {
      void element.play().then(() => {
        if (!isCurrent() || paused) element.pause();
      }).catch((error: unknown) => handlePlayError(error, attempt));
    } catch (error) {
      handlePlayError(error, attempt);
    }
  }

  window.addEventListener('devoir:auth-session-change', onAuthChange);
  window.addEventListener('storage', onAuthChange);

  // Defer until after commit; StrictMode cleanup can cancel before any request.
  void Promise.resolve().then(async () => {
    if (!isCurrent()) return;
    // Bound the whole wait, including an authentication refresh or stalled load.
    requestTimer = setTimeout(() => finish(AUDIO_DELAY_MESSAGE), 30_000);
    try {
      const blob = await getQuestionAudio(options.questionId, controller.signal);
      if (!isCurrent()) return;
      clearTimeout(requestTimer);
      audio = new Audio();
      audio.preload = 'auto';
      audio.onended = () => finish();
      audio.onerror = () => finish(QUESTION_AUDIO_FALLBACK);
      audio.onloadedmetadata = () => {
        if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
          remaining = Math.max(45_000, audio.duration * 1000 + 15_000);
        }
      };
      objectUrl = URL.createObjectURL(blob);
      audio.src = objectUrl;
      previousTick = performance.now();
      playbackTimer = setInterval(() => {
        if (!isCurrent()) return;
        const now = performance.now();
        if (!paused) remaining -= now - previousTick;
        previousTick = now;
        if (remaining <= 0) finish(AUDIO_DELAY_MESSAGE);
      }, 250);
      if (!paused) play();
    } catch (error) {
      if (!isCurrent()) return;
      finish(error instanceof Error ? error.message : QUESTION_AUDIO_FALLBACK);
    }
  });

  return {
    setPaused(nextPaused) {
      if (!isCurrent() || paused === nextPaused) return;
      paused = nextPaused;
      previousTick = performance.now();
      if (paused) {
        playAttempt++;
        audio?.pause();
      } else {
        play();
      }
    },
    dispose,
  };
}
