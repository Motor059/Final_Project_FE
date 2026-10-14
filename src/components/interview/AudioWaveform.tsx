import { useEffect, useRef } from 'react';
import { useInterviewStore, type AudioRecordingResult } from '@/store/useInterviewStore';

function microphoneMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return '마이크 권한을 사용할 수 없습니다. 텍스트로 답변해 주세요.';
  if (name === 'NotFoundError') return '마이크를 찾지 못했습니다. 텍스트로 답변해 주세요.';
  if (name === 'NotReadableError') return '마이크에 접근하지 못했습니다. 다른 앱의 마이크 사용을 확인하거나 텍스트로 답변해 주세요.';
  return '음성 녹음을 준비하지 못했습니다. 텍스트로 답변해 주세요.';
}

export default function AudioWaveform({ isRecording }: { isRecording: boolean }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const syncPauseRef = useRef<(() => void) | null>(null);
  const { sessionId, currentQuestion, recordingAttempt, isSkipping, isPaused } = useInterviewStore();
  const questionId = currentQuestion?.questionId;

  useEffect(() => {
    if (!isRecording || !sessionId || !questionId) return;
    let active = true;
    let failed = false;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let recorder: MediaRecorder | null = null;
    let animationFrame = 0;
    let startedAt = 0;
    let stoppedAt = 0;
    let pausedAt: number | null = null;
    let pausedMilliseconds = 0;
    let permissionTimer: ReturnType<typeof setTimeout> | null = null;
    let stopTimer: ReturnType<typeof setTimeout> | null = null;
    let stopPromise: Promise<AudioRecordingResult> | null = null;
    let resolveStop: ((result: AudioRecordingResult) => void) | null = null;
    let rejectStop: ((reason: unknown) => void) | null = null;
    const chunks: BlobPart[] = [];
    const currentState = () => {
      const state = useInterviewStore.getState();
      return active && state.sessionId === sessionId && state.currentQuestion?.questionId === questionId && state.recordingAttempt === recordingAttempt ? state : null;
    };
    const clearTimers = () => {
      if (permissionTimer !== null) clearTimeout(permissionTimer);
      if (stopTimer !== null) clearTimeout(stopTimer);
    };
    const fail = (message: string) => {
      if (!active || failed) return;
      failed = true;
      clearTimers();
      rejectStop?.(new Error(message));
      currentState()?.failAudio(message);
      stream?.getTracks().forEach((track) => track.stop());
    };
    const syncPause = () => {
      const state = currentState();
      if (!state || !recorder || failed) return;
      try {
        if ((state.isSkipping || state.isPaused) && recorder.state === 'recording') {
          recorder.pause();
          pausedAt = performance.now();
        } else if (!state.isSkipping && !state.isPaused && recorder.state === 'paused') {
          recorder.resume();
          if (pausedAt !== null) pausedMilliseconds += performance.now() - pausedAt;
          pausedAt = null;
        }
      } catch {
        fail('녹음을 일시정지하거나 재개하지 못했습니다. 텍스트로 답변해 주세요.');
      }
    };
    syncPauseRef.current = syncPause;
    const stopRecording = (): Promise<AudioRecordingResult> => {
      if (stopPromise) return stopPromise;
      if (!currentState() || failed || !recorder || recorder.state === 'inactive') {
        return Promise.reject(new Error('마이크가 준비되지 않았습니다. 텍스트로 입력하거나 다시 시도해 주세요.'));
      }
      stopPromise = new Promise((resolve, reject) => { resolveStop = resolve; rejectStop = reject; });
      stoppedAt = performance.now();
      if (pausedAt !== null) pausedMilliseconds += stoppedAt - pausedAt;
      pausedAt = null;
      stopTimer = setTimeout(() => fail('녹음을 마무리하지 못했습니다. 텍스트로 답변해 주세요.'), 5000);
      try { recorder.stop(); } catch { fail('녹음을 마무리하지 못했습니다. 텍스트로 답변해 주세요.'); }
      return stopPromise;
    };
    const initAudio = async () => {
      try {
        currentState()?.setAudioStatus('REQUESTING');
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
          throw new Error('Recording unavailable');
        }
        permissionTimer = setTimeout(() => fail('마이크 권한 확인이 지연되고 있습니다. 텍스트로 답변해 주세요.'), 20000);
        const acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!currentState() || failed) {
          acquired.getTracks().forEach((track) => track.stop());
          return;
        }
        if (permissionTimer !== null) clearTimeout(permissionTimer);
        stream = acquired;
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
          .find((mime) => MediaRecorder.isTypeSupported(mime));
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorder.ondataavailable = (event) => {
          if (active && event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
          if (!active || failed || !resolveStop) return;
          if (stopTimer !== null) clearTimeout(stopTimer);
          const firstChunk = chunks[0];
          const blob = new Blob(chunks, { type: recorder?.mimeType || (firstChunk instanceof Blob ? firstChunk.type : '') });
          resolveStop({ blob, durationSeconds: Math.min(180, Math.max(0, (stoppedAt - startedAt - pausedMilliseconds) / 1000)) });
          resolveStop = null;
          rejectStop = null;
        };
        recorder.onerror = () => fail('녹음 중 오류가 발생했습니다. 텍스트로 답변해 주세요.');
        stream.getAudioTracks().forEach((track) => { track.onended = () => fail('마이크 연결이 끊겼습니다. 텍스트로 답변해 주세요.'); });
        recorder.start(250);
        startedAt = performance.now();
        currentState()?.setStopAudioRecording(stopRecording);
        currentState()?.setAudioStatus('READY');
        syncPause();

        try {
          audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          audioContext.createMediaStreamSource(stream).connect(analyser);
          void audioContext.resume().catch(() => undefined);
          const data = new Uint8Array(analyser.fftSize);
          const draw = () => {
            if (!active || failed) return;
            analyser.getByteTimeDomainData(data);
            const state = currentState();
            let sum = 0;
            for (const value of data) sum += ((value - 128) / 128) ** 2;
            const level = state?.isPaused || state?.isSkipping ? 0 : Math.min(1, Math.sqrt(sum / data.length) * 4);
            barsRef.current.forEach((bar, index) => {
              if (bar) bar.style.height = `${6 + level * 30 * (1 - Math.abs(index - 4) / 6)}px`;
            });
            animationFrame = requestAnimationFrame(draw);
          };
          draw();
        } catch (error) { console.warn('음성 파형 표시 실패:', error); }
      } catch (error) {
        if (active && !failed) fail(microphoneMessage(error));
      }
    };
    void initAudio();
    return () => {
      active = false;
      clearTimers();
      cancelAnimationFrame(animationFrame);
      if (syncPauseRef.current === syncPause) syncPauseRef.current = null;
      const state = useInterviewStore.getState();
      if (state.stopAudioRecording === stopRecording) {
        state.setStopAudioRecording(null);
        state.setAudioStatus('IDLE');
      }
      rejectStop?.(new DOMException('녹음이 중단되었습니다.', 'AbortError'));
      if (recorder) {
        recorder.onstop = null;
        recorder.ondataavailable = null;
        recorder.onerror = null;
        if (recorder.state !== 'inactive') {
          try { recorder.stop(); } catch (error) { console.warn('녹음 정리 실패:', error); }
        }
      }
      stream?.getTracks().forEach((track) => { track.onended = null; track.stop(); });
      if (audioContext && audioContext.state !== 'closed') void audioContext.close().catch(() => undefined);
    };
  }, [isRecording, sessionId, questionId, recordingAttempt]);

  useEffect(() => { syncPauseRef.current?.(); }, [isSkipping, isPaused]);
  return (
    <div className="flex gap-[6px] items-center justify-center h-[40px]" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} ref={(element) => { barsRef.current[index] = element; }} className="w-[6px] h-[6px] bg-[#333333] rounded-full transition-all duration-75 ease-out" />
      ))}
    </div>
  );
}
