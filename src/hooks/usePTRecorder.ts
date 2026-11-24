import { useCallback, useEffect, useRef, useState } from "react";
import { PT_AUDIO_MAX_BYTES, ptAudioFileName } from "@/lib/ptPresentation";

export interface PTPresentationRecording { audio: Blob; durationSec: number }
type Status = "IDLE" | "REQUESTING" | "RECORDING" | "STOPPED" | "ERROR";

function microphoneMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (["NotAllowedError", "SecurityError"].includes(error.name)) return "마이크 권한을 사용할 수 없어요. 텍스트로 발표해 주세요.";
    if (error.name === "NotFoundError") return "마이크를 찾지 못했어요. 텍스트로 발표해 주세요.";
    if (error.name === "NotReadableError") return "마이크를 사용 중인 다른 앱을 확인하거나 텍스트로 발표해 주세요.";
  }
  return error instanceof Error ? error.message : "녹음을 준비하지 못했어요. 텍스트로 발표해 주세요.";
}

export default function usePTRecorder(enabled: boolean, localDeadline: number, maxSeconds = 300) {
  const [status, setStatus] = useState<Status>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const deadline = useRef(localDeadline);
  const controls = useRef<{ stop: () => Promise<PTPresentationRecording>; discard: () => void } | null>(null);
  const levelRef = useRef(0);

  useEffect(() => {
    deadline.current = localDeadline;
  }, [localDeadline]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let failed = false;
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let context: AudioContext | null = null;
    let frame = 0;
    let startedAt = 0;
    let stopAt = 0;
    let bytes = 0;
    let displayedSeconds = -1;
    const chunks: Blob[] = [];
    let permissionTimer: ReturnType<typeof setTimeout> | undefined;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    let deadlineTimer: ReturnType<typeof setInterval> | undefined;
    let stopped: Promise<PTPresentationRecording> | null = null;
    let resolveStop: ((value: PTPresentationRecording) => void) | null = null;
    let rejectStop: ((reason: Error) => void) | null = null;

    const releaseMicrophone = () => {
      clearTimeout(permissionTimer);
      clearTimeout(stopTimer);
      clearInterval(deadlineTimer);
      cancelAnimationFrame(frame);
      levelRef.current = 0;
      stream?.getTracks().forEach((track) => { track.onended = null; track.stop(); });
      if (context && context.state !== "closed") void context.close().catch(() => undefined);
    };
    const fail = (message: string) => {
      if (!active || failed) return;
      failed = true;
      if (recorder) {
        recorder.onstop = null;
        recorder.ondataavailable = null;
        recorder.onerror = null;
        if (recorder.state !== "inactive") { try { recorder.stop(); } catch { /* 트랙 종료로 정리한다. */ } }
      }
      releaseMicrophone();
      rejectStop?.(new Error(message));
      rejectStop = null;
      setError(message);
      setStatus("ERROR");
    };
    const stop = (): Promise<PTPresentationRecording> => {
      if (stopped) return stopped;
      if (!active || failed || !recorder || recorder.state !== "recording") {
        return Promise.reject(new Error("녹음된 발표가 없어요. 마이크를 확인하거나 텍스트로 발표해 주세요."));
      }
      stopAt = performance.now();
      stopped = new Promise((resolve, reject) => { resolveStop = resolve; rejectStop = reject; });
      stopTimer = setTimeout(() => fail("녹음을 마무리하지 못했어요. 텍스트로 발표해 주세요."), 5000);
      try { recorder.stop(); } catch { fail("녹음을 마무리하지 못했어요. 텍스트로 발표해 주세요."); }
      return stopped;
    };
    const discard = () => {
      fail("녹음이 중단됐어요. 남은 시간 안에 다시 녹음하거나 텍스트로 발표해 주세요.");
    };
    const currentControls = { stop, discard };
    controls.current = currentControls;

    const start = async () => {
      // Let an effect cleanup cancel initialization before requesting hardware.
      await Promise.resolve();
      if (!active) return;
      setStatus("REQUESTING");
      setError(null);
      setElapsedSeconds(0);
      try {
        if (deadline.current <= performance.now()) throw new Error("발표 시간이 끝났어요. 남은 제출 시간 안에 텍스트로 입력해 주세요.");
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
          throw new Error("이 브라우저에서는 마이크 녹음을 사용할 수 없어요. 텍스트로 발표해 주세요.");
        }
        permissionTimer = setTimeout(() => fail("마이크 권한 확인이 지연되고 있어요. 텍스트로 발표해 주세요."), 20_000);
        const acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active || failed || deadline.current <= performance.now()) {
          acquired.getTracks().forEach((track) => track.stop());
          if (active && !failed) fail("발표 시간이 끝났어요. 남은 제출 시간 안에 텍스트로 입력해 주세요.");
          return;
        }
        clearTimeout(permissionTimer);
        stream = acquired;
        const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]
          .find((mime) => MediaRecorder.isTypeSupported(mime));
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorder.ondataavailable = (event) => {
          if (!active || failed || !event.data.size) return;
          bytes += event.data.size;
          if (bytes > PT_AUDIO_MAX_BYTES) { fail("녹음 파일이 25MB를 넘었어요. 텍스트로 발표해 주세요."); return; }
          chunks.push(event.data);
        };
        recorder.onstop = () => {
          if (!active || failed || !resolveStop) return;
          releaseMicrophone();
          const audio = new Blob(chunks, { type: recorder?.mimeType || chunks[0]?.type || "" });
          if (!audio.size) { fail("녹음 파일이 비어 있어요. 텍스트로 발표해 주세요."); return; }
          if (Number.isFinite(maxSeconds) && stopAt - startedAt > (maxSeconds + 1) * 1000) { fail("녹음 제한 시간을 넘었어요. 텍스트로 입력해 주세요."); return; }
          try { ptAudioFileName(1, audio.type); } catch (failure) { fail(microphoneMessage(failure)); return; }
          const durationSec = Math.min(maxSeconds, Math.max(1, Math.ceil((stopAt - startedAt) / 1000)));
          setElapsedSeconds(durationSec);
          resolveStop({ audio, durationSec });
          resolveStop = null;
          rejectStop = null;
          setStatus("STOPPED");
        };
        recorder.onerror = () => fail("녹음 중 오류가 발생했어요. 텍스트로 발표해 주세요.");
        stream.getAudioTracks().forEach((track) => { track.onended = () => fail("마이크 연결이 끊겼어요. 텍스트로 발표해 주세요."); });
        recorder.start(250);
        startedAt = performance.now();
        setStatus("RECORDING");
        deadlineTimer = setInterval(() => {
          const seconds = Math.floor((performance.now() - startedAt) / 1000);
          if (seconds !== displayedSeconds) { displayedSeconds = seconds; setElapsedSeconds(seconds); }
          if (performance.now() >= Math.min(deadline.current, startedAt + maxSeconds * 1000)) void stop().catch(() => undefined);
        }, 100);
        try {
          const Context = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Context) return;
          context = new Context();
          const analyser = context.createAnalyser();
          analyser.fftSize = 256;
          context.createMediaStreamSource(stream).connect(analyser);
          void context.resume().catch(() => undefined);
          const data = new Uint8Array(analyser.fftSize);
          const draw = () => {
            if (!active || failed || recorder?.state !== "recording") return;
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (const value of data) sum += ((value - 128) / 128) ** 2;
            levelRef.current = Math.min(1, Math.sqrt(sum / data.length) * 4);
            frame = requestAnimationFrame(draw);
          };
          draw();
        } catch {
          // Audio visualization is optional; keep the recording running.
        }
      } catch (failure) {
        fail(microphoneMessage(failure));
      }
    };
    void start();
    return () => {
      active = false;
      if (controls.current === currentControls) controls.current = null;
      if (recorder) {
        recorder.onstop = null;
        recorder.ondataavailable = null;
        recorder.onerror = null;
        if (recorder.state !== "inactive") { try { recorder.stop(); } catch { /* 트랙 종료로 정리한다. */ } }
      }
      releaseMicrophone();
      rejectStop?.(new DOMException("녹음이 중단되었습니다.", "AbortError"));
    };
  }, [enabled, attempt, maxSeconds]);

  const stop = useCallback(() => controls.current?.stop() ?? Promise.reject(new Error("녹음된 발표가 없어요. 텍스트로 발표해 주세요.")), []);
  const discard = useCallback(() => controls.current?.discard(), []);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { status, error, levelRef, stop, discard, retry, elapsedSeconds };
}
