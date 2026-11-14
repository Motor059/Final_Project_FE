import { useEffect, useRef, useState } from "react";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import usePTSession from "@/hooks/usePTSession";
import { clearPTSessionReference, ptInterviewPath, ptPreparationPath, ptPresentationPath, resolvePTSessionId } from "@/lib/ptSession";

export default function usePTPage(page: "PREPARATION" | "PRESENTATION" | "QUESTIONS") {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = resolvePTSessionId(location.search, location.state?.sessionId);
  const flow = usePTSession(sessionId);
  const { session, receivedAt, busy, cancelSession } = flow;
  const [now, setNow] = useState(() => performance.now());
  const [explicitExit, setExplicitExit] = useState(false);
  const allowExit = useRef(false);
  const cancelling = useRef(false);
  const active = !!session && session.status === "IN_PROGRESS" && !["COMPLETED", "CANCELLED"].includes(session.phase);
  const elapsed = Math.max(0, now - receivedAt);
  const serverNow = session ? Date.parse(session.serverTime) + elapsed : 0;
  const cancelBlocked = busy === "TRACK" || busy === "START" || busy === "CANCEL";
  const secondsUntil = (deadline?: string | null) => session && deadline
    ? Math.max(0, Math.ceil((Date.parse(deadline) - Date.parse(session.serverTime) - elapsed) / 1000)) : null;
  const isExpired = !!session?.expiresAt && secondsUntil(session.expiresAt) === 0;
  const remainingSeconds = secondsUntil(session?.phase === "PRESENTING" ? session.presentationDeadline : session?.preparationDeadline);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (allowExit.current || !active || isExpired) return false;
    if (currentLocation.pathname === nextLocation.pathname && currentLocation.search === nextLocation.search) return false;
    const nextId = resolvePTSessionId(nextLocation.search, undefined);
    const internal = nextId === sessionId && (
      (nextLocation.pathname === "/pt/presentation" && session?.phase === "PRESENTING") ||
      (nextLocation.pathname === "/pt/preparation" && session?.phase === "PREPARING") ||
      (nextLocation.pathname === "/pt/interview" && !!session && ["GENERATING", "QUESTIONING", "COMPLETED"].includes(session.phase))
    );
    return !internal;
  });
  const exitOpen = explicitExit || blocker.state === "blocked";

  useEffect(() => {
    if ((!session || isExpired) && blocker.state === "blocked" && !cancelling.current) blocker.reset();
  }, [session, isExpired, blocker]);

  useEffect(() => {
    allowExit.current = false;
    cancelling.current = false;
    setExplicitExit(false);
  }, [sessionId]);

  useEffect(() => {
    setNow(performance.now());
    const timer = window.setInterval(() => setNow(performance.now()), 1000);
    return () => window.clearInterval(timer);
  }, [receivedAt]);

  useEffect(() => {
    if (!session || isExpired || exitOpen || busy) return;
    if (page !== "PRESENTATION" && session.phase === "PRESENTING") {
      navigate(ptPresentationPath(session.sessionId), { replace: true });
    } else if (page !== "PREPARATION" && session.phase === "PREPARING") {
      navigate(ptPreparationPath(session.sessionId), { replace: true });
    } else if (page !== "QUESTIONS" && ["GENERATING", "QUESTIONING", "COMPLETED"].includes(session.phase)) {
      navigate(ptInterviewPath(session.sessionId), { replace: true });
    }
  }, [session, page, isExpired, exitOpen, busy, navigate]);

  useEffect(() => {
    if (!active || isExpired) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active, isExpired]);

  const closeExit = () => {
    if (cancelBlocked || cancelling.current) return;
    setExplicitExit(false);
    if (blocker.state === "blocked") blocker.reset();
  };
  const confirmExit = async () => {
    if (cancelBlocked || cancelling.current) return false;
    cancelling.current = true;
    try {
      if (!await cancelSession()) return false;
      if (sessionId) clearPTSessionReference(sessionId);
      allowExit.current = true;
      setExplicitExit(false);
      if (blocker.state === "blocked") blocker.proceed();
      else navigate("/setup", { replace: true });
      return true;
    } finally {
      cancelling.current = false;
    }
  };

  return {
    ...flow, sessionId, active, isExpired, remainingSeconds, serverNow, cancelBlocked, exitOpen,
    requestExit: () => setExplicitExit(true), closeExit, confirmExit,
  };
}
