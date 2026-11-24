import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ptPresentationDuration } from "@/lib/ptTaskSettings";
import "./pt-reference.css";

interface PTStartDialogProps {
  open: boolean; trackLabel: string; trackSelectionRequired: boolean; presentationSeconds: number; busy: boolean; error: string | null; onClose: () => void; onStart: (mode: "AUDIO" | "TEXT") => void;
}

export default function PTStartDialog({ open, ...props }: PTStartDialogProps) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next && !props.busy) props.onClose(); }}>
    <DialogContent className="pt-ref pt-modal-host" overlayClassName="pt-reference-overlay" showCloseButton={false}>
      {open && <PTStartDialogBody {...props} />}
    </DialogContent>
  </Dialog>;
}

function PTStartDialogBody({ trackLabel, trackSelectionRequired, presentationSeconds, busy, error, onClose, onStart }: Omit<PTStartDialogProps, "open">) {
  const [mic, setMic] = useState<"checking" | "ok" | "denied">("checking");
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    const check = async () => {
      await Promise.resolve();
      if (!active) return;
      try {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Microphone unavailable");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        if (active) setMic("ok");
      } catch {
        if (active) setMic("denied");
      }
    };
    void check();
    return () => { active = false; mounted.current = false; };
  }, [attempt]);

  return <div className="sheet">
        <DialogTitle render={<h3 />}>발표를 시작할까요?</DialogTitle>
        <DialogDescription>{trackSelectionRequired ? "시작하면 발표 분야가 확정돼요. " : ""}준비 단계로 돌아가 시간을 다시 받을 수 없어요. 발표 시간은 최대 {ptPresentationDuration(presentationSeconds)}입니다.</DialogDescription>
        {trackSelectionRequired && trackLabel && <div className="quote">선택 분야 · <b>{trackLabel}</b></div>}
        <div className={`pt-mic ${mic}`} role="status">
          {mic === "checking" ? <span className="sp dk" aria-hidden="true" /> : mic === "ok" ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          <span><b>{mic === "checking" ? "마이크를 확인하고 있어요" : mic === "ok" ? "마이크가 연결되어 있어요" : "마이크를 사용할 수 없어요"}</b>{mic === "checking" ? "브라우저에서 권한을 물으면 허용해 주세요." : mic === "ok" ? "발표를 시작하면 바로 녹음돼요." : "브라우저 주소창의 사이트 설정에서 마이크를 허용한 뒤 다시 확인해 주세요. 텍스트로도 발표할 수 있어요."}</span>
        </div>
        {error && <p className="pt-danger" role="alert">{error}</p>}
        <div className="acts">
          <button type="button" className="btn ink" disabled={busy || mic === "checking"} onClick={() => onStart(mic === "ok" ? "AUDIO" : "TEXT")}>{busy ? <><span className="sp" aria-hidden="true" />발표 시작 중</> : mic === "denied" ? "텍스트로 발표 시작" : "발표 시작"}</button>
          {mic === "denied" && <button type="button" className="btn ghost" disabled={busy} onClick={() => { if (mounted.current) { setMic("checking"); setAttempt((value) => value + 1); } }}>마이크 다시 확인</button>}
          <button type="button" className="btn ghost" disabled={busy} onClick={onClose}>취소</button>
        </div>
      </div>;
}
