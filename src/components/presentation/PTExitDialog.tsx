import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import "./pt-reference.css";

interface Props {
  open: boolean;
  busy: boolean;
  error: string | null;
  onContinue: () => void;
  onCancel: () => void;
}

export default function PTExitDialog({ open, busy, error, onContinue, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onContinue(); }}>
      <DialogContent className="pt-ref pt-modal-host" overlayClassName="pt-reference-overlay" showCloseButton={false}><div className="sheet">
        <DialogTitle render={<h3 />}>PT 면접을 종료할까요?</DialogTitle>
        <DialogDescription>
          나가면 이번 PT 면접이 취소돼요. 계속 진행하면 준비·발표 시간은 이어서 흘러요.
        </DialogDescription>
        {error && <p role="alert" className="text-[13px] leading-6 text-red-600">{error}</p>}
        <div className="acts">
          <button type="button" className="btn ink" disabled={busy} onClick={onContinue}>계속 진행하기</button>
          <button type="button" className="btn ghost" disabled={busy} onClick={onCancel}>{busy ? "요청 처리 중…" : "면접 취소하고 나가기"}</button>
        </div>
      </div></DialogContent>
    </Dialog>
  );
}
