import { useState } from "react";

const memoKey = (sessionId: number) => `devoir:pt:memo:${sessionId}`;

function readMemo(sessionId: number | null) {
  if (!sessionId) return "";
  try { return sessionStorage.getItem(memoKey(sessionId)) ?? ""; }
  catch { return ""; }
}

export default function usePTMemo(sessionId: number | null) {
  const [draft, setDraft] = useState(() => ({ sessionId, text: readMemo(sessionId), stored: true }));
  const current = draft.sessionId === sessionId ? draft : { sessionId, text: readMemo(sessionId), stored: true };
  const changeMemo = (text: string) => {
    let stored = true;
    try { if (sessionId) sessionStorage.setItem(memoKey(sessionId), text); }
    catch { stored = false; }
    setDraft({ sessionId, text, stored });
  };
  return { memo: current.text, stored: current.stored, changeMemo };
}
