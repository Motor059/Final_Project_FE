import { useCallback, useEffect, useRef, useState } from "react";

export const PRESENTATION_LIMIT_SECONDS = 8 * 60;
const SHORT_PRESENTATION_SECONDS = 2 * 60;

type PresentationPhase = "PRESENTING" | "SHORT" | "COMPLETE";
type PresentationInput = "AUDIO" | "TEXT";
type CompletionSource = PresentationInput | "NOTE";

export function formatPresentationTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function usePresentationPreview(paused: boolean) {
  const [phase, setPhase] = useState<PresentationPhase>("PRESENTING");
  const [inputMode, setInputMode] = useState<PresentationInput>("AUDIO");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasContinued, setHasContinued] = useState(false);
  const [completionSource, setCompletionSource] = useState<CompletionSource | null>(null);
  const [endedByTimeout, setEndedByTimeout] = useState(false);
  const clock = useRef({ elapsedMs: 0, startedAt: null as number | null });

  const readElapsed = useCallback(() => {
    const { elapsedMs, startedAt } = clock.current;
    return Math.min(
      PRESENTATION_LIMIT_SECONDS * 1000,
      elapsedMs + (startedAt === null ? 0 : performance.now() - startedAt),
    );
  }, []);

  const freezeClock = useCallback(() => {
    const elapsedMs = readElapsed();
    clock.current = { elapsedMs, startedAt: null };
    setElapsedSeconds(Math.floor(elapsedMs / 1000));
    return elapsedMs / 1000;
  }, [readElapsed]);

  useEffect(() => {
    if (phase !== "PRESENTING" || paused) return;
    clock.current.startedAt = performance.now();

    const tick = () => {
      const elapsedMs = readElapsed();
      setElapsedSeconds(Math.floor(elapsedMs / 1000));
      if (elapsedMs >= PRESENTATION_LIMIT_SECONDS * 1000) {
        clock.current = { elapsedMs, startedAt: null };
        setCompletionSource(inputMode);
        setEndedByTimeout(true);
        setPhase("COMPLETE");
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => {
      window.clearInterval(interval);
      clock.current = { elapsedMs: readElapsed(), startedAt: null };
    };
  }, [phase, paused, inputMode, readElapsed]);

  const finish = () => {
    if (phase !== "PRESENTING") return;
    const elapsed = freezeClock();
    if (inputMode === "AUDIO" && elapsed < SHORT_PRESENTATION_SECONDS && !hasContinued) {
      setPhase("SHORT");
      return;
    }
    setCompletionSource(inputMode);
    setPhase("COMPLETE");
  };

  const continuePresentation = () => {
    if (phase !== "SHORT") return;
    setHasContinued(true);
    setPhase("PRESENTING");
  };

  const finishShortPresentation = () => {
    if (phase !== "SHORT") return;
    setCompletionSource("AUDIO");
    setPhase("COMPLETE");
  };

  const finishWithNote = () => {
    freezeClock();
    setCompletionSource("NOTE");
    setPhase("COMPLETE");
  };

  const switchToText = () => {
    if (phase === "PRESENTING") setInputMode("TEXT");
  };

  const restart = () => {
    clock.current = { elapsedMs: 0, startedAt: paused ? null : performance.now() };
    setElapsedSeconds(0);
    setInputMode("AUDIO");
    setHasContinued(false);
    setCompletionSource(null);
    setEndedByTimeout(false);
    setPhase("PRESENTING");
  };

  const seek = (seconds: number) => {
    if (phase !== "PRESENTING") return;
    const elapsed = Math.min(PRESENTATION_LIMIT_SECONDS - 1, Math.max(0, seconds));
    clock.current = {
      elapsedMs: elapsed * 1000,
      startedAt: paused ? null : performance.now(),
    };
    setElapsedSeconds(elapsed);
  };

  return {
    phase, inputMode, elapsedSeconds, hasContinued, completionSource, endedByTimeout,
    finish, continuePresentation, finishShortPresentation, finishWithNote,
    switchToText, restart, seek,
  };
}
