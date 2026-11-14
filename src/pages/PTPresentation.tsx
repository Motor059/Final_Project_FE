import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check, LockKeyhole, Type } from "lucide-react";
import Header from "@/components/common/Header";
import PageLoading from "@/components/common/PageLoading";
import { PTProgressHeader, PTReferenceButtons, PTReferencePanel, type PTReferenceTab } from "@/components/presentation/PTWorkspace";
import PTQuestionOrb from "@/components/presentation/PTQuestionOrb";
import PTAudioWaveform from "@/components/presentation/PTAudioWaveform";
import PTExitDialog from "@/components/presentation/PTExitDialog";
import PTSessionUnavailable from "@/components/presentation/PTSessionUnavailable";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import usePTPage from "@/hooks/usePTPage";
import usePTPresentation from "@/hooks/usePTPresentation";
import { PT_TEXT_MAX_LENGTH, releasePTPresentationDraft } from "@/lib/ptPresentation";
import { ptPhaseLabels, ptTrackLabels } from "@/lib/ptSession";
import type { PTSession } from "@/types/pt";

export default function PTPresentation() {
  const flow = usePTPage("PRESENTATION");
  if (flow.isLoading) return <PageLoading layout="setup" title="발표 과제와 남은 시간을 확인하고 있어요" />;
  if (!flow.session || flow.isExpired) return <PTSessionUnavailable expired={flow.isExpired} error={flow.error} onRetry={flow.sessionId ? () => { void flow.retry(); } : undefined} />;
  return <PresentationScreen key={flow.session.sessionId} session={flow.session} flow={flow} />;
}

function PresentationScreen({ session, flow }: { session: PTSession; flow: ReturnType<typeof usePTPage> }) {
  const navigate = useNavigate();
  const [referenceTab, setReferenceTab] = useState<PTReferenceTab | null>(null);
  const [confirmingText, setConfirmingText] = useState(false);
  const input = usePTPresentation(session, flow, confirmingText);
  const { error, actionError, failedAction, busy, remainingSeconds, active, exitOpen } = flow;
  const presenting = session.phase === "PRESENTING";
  const submitting = input.preparing || busy === "SUBMIT_TEXT" || busy === "SUBMIT_AUDIO";
  const remaining = presenting ? remainingSeconds ?? 0 : 0;
  const content = session.task.content;
  const trackLabel = session.track ? ptTrackLabels[session.track] : "";
  const saved = !!session.presentation;
  const displayError = input.localError || error || ((!saved || failedAction?.type === "CANCEL") ? actionError : null);
  const controlsLocked = submitting || !!busy || !!input.pending;
  const graceSeconds = Math.max(0, Math.ceil((Date.parse(session.presentationDeadline ?? "") + 60_000 - flow.serverNow) / 1000));

  const confirmExit = async () => {
    input.abortForCancel();
    if (await flow.confirmExit()) releasePTPresentationDraft(session.sessionId);
  };

  return <>
    <Header hideBackButton focusLabel={active ? "PT 면접 진행 중" : undefined} onExit={flow.requestExit} exitDisabled={flow.cancelBlocked} />
    <main className={`pt-ref pt-ref-page pt-view${input.mode === "TEXT" ? " typing" : ""}`}>
      <PTProgressHeader company={session.task.companyName} step={1} remaining={presenting ? remaining : undefined} recording={input.mode === "AUDIO" && input.recorder.status === "RECORDING" && !submitting} />
      <section className="wrap pt-stage">
        <div className="pt-ctx">{content.title}</div>
        {trackLabel && <span className="pt-fchip"><LockKeyhole size={14} aria-hidden="true" />선택 분야 · {trackLabel}</span>}
        <div className="pt-orb"><PTQuestionOrb orbOnly text="" state={submitting ? "thinking" : input.mode === "AUDIO" && input.recorder.status === "RECORDING" ? "recording" : "idle"} /></div>
        {submitting ? <div className="pt-saving" role="status">
          <h1 className="cs-title">{remaining === 0 ? "발표 시간이 종료되었습니다." : "발표를 마쳤어요."}</h1>
          <p className="pv-sub">발표 내용을 저장하고 있어요.</p>
          <ul className="steps">{input.mode === "AUDIO" && <li className="done">녹음 저장</li>}<li className="on"><span className="sp dk" aria-hidden="true" /> {input.mode === "AUDIO" ? "발표 받아쓰기" : "발표 내용 저장"}</li><li>첫 질문 준비</li></ul>
        </div> : presenting ? <>
          <div className={`pt-state${input.recorder.status === "ERROR" ? " muted" : ""}`} role="status">
            {input.pending ? <><span className="sp dk" aria-hidden="true" />제출한 발표를 보관하고 있어요</> : input.mode === "TEXT" ? <><Type size={16} aria-hidden="true" />텍스트로 발표 중</> : input.recorder.status === "RECORDING" ? <><span className="dot" aria-hidden="true" />녹음 중</> : input.recorder.status === "REQUESTING" ? <><span className="sp dk" aria-hidden="true" />마이크를 확인하고 있어요</> : "마이크를 확인해 주세요"}
          </div>
          <h1 className="pt-prompt">선택한 개선안을 설명해주세요.</h1>
          {input.mode === "TEXT" ? <textarea id="pt-presentation-text" className="inp pt-text" rows={7} aria-label="발표 내용" value={input.text} maxLength={PT_TEXT_MAX_LENGTH} onChange={(event) => input.changeText(event.target.value)} disabled={controlsLocked || input.submissionClosed} placeholder="발표 내용을 입력하세요. 남은 시간 안에 제출해 주세요." />
            : <PTAudioWaveform active={input.recorder.status === "RECORDING"} levelRef={input.recorder.levelRef} />}
          {input.recorder.error && input.mode === "AUDIO" && !input.pending && <div className="pt-note"><AlertCircle size={18} aria-hidden="true" /><div><b>마이크를 사용할 수 없어요</b>{input.recorder.error}<div className="acts"><button type="button" className="btn ghost sm" disabled={controlsLocked || remaining <= 0} onClick={input.recorder.retry}>마이크 다시 확인</button><button type="button" className="btn ink sm" disabled={controlsLocked || input.submissionClosed || exitOpen} onClick={() => setConfirmingText(true)}>텍스트로 발표하기</button></div></div></div>}
          {displayError && <div className="pt-note" role="alert"><AlertCircle size={18} aria-hidden="true" /><div><b>{input.pending ? "녹음은 그대로 남아 있어요" : "발표를 저장하지 못했어요"}</b>{displayError}<div className="acts"><button type="button" className="btn ink sm" disabled={!!busy} onClick={() => { if (failedAction?.type === "CANCEL") void confirmExit(); else if (input.pending) void input.submit(); else void flow.retry(); }}>다시 시도</button></div></div></div>}
          <PTReferenceButtons onOpen={setReferenceTab} />
          <div className="pt-act">
            <button type="button" className="btn ink pt-main" disabled={!!busy || exitOpen || (!input.pending && input.submissionClosed) || (input.mode === "AUDIO" && !input.pending && !["RECORDING", "STOPPED"].includes(input.recorder.status))} onClick={() => { void input.submit(); }}>{input.pending ? "같은 발표 다시 제출" : input.mode === "TEXT" ? "발표 제출" : "발표 완료"}</button>
            {input.pending ? <span className="hint">다시 발표하지 않아도 돼요. 같은 내용으로 다시 제출할 수 있어요.</span> : input.mode === "TEXT" && !input.text.trim() ? <span className="hint">내용을 입력하면 제출할 수 있어요</span> : remaining === 0 && <span className="hint">{input.submissionClosed ? "발표 제출 시간이 지났어요. 면접을 취소하고 다시 시작해 주세요." : `발표 시간이 끝났어요. 첫 제출까지 ${graceSeconds}초 남았어요.`}</span>}
            {input.mode === "AUDIO" && <button type="button" className="txtbtn" disabled={controlsLocked || input.submissionClosed || exitOpen} onClick={() => setConfirmingText(true)}>텍스트로 입력하기</button>}
          </div>
        </> : <div className="pt-saving"><span className="pt-done-mark"><Check size={30} aria-hidden="true" /></span><h1 className="cs-title">{saved ? "발표를 마쳤어요." : ptPhaseLabels[session.phase]}</h1><p className="pv-sub">{session.phase === "CANCELLED" ? "이번 면접은 취소됐어요." : "발표 내용을 바탕으로 질의응답을 준비하고 있어요."}</p><PTReferenceButtons onOpen={setReferenceTab} includeTalk={saved} />{!active && <button type="button" className="btn ghost" onClick={() => navigate("/setup")}>면접 설정으로 이동</button>}</div>}
      </section>
    </main>
    <PTReferencePanel session={session} tab={referenceTab} onChange={setReferenceTab} />
    <PTExitDialog open={exitOpen} busy={flow.cancelBlocked} error={failedAction?.type === "CANCEL" ? actionError : null} onContinue={flow.closeExit} onCancel={() => { void confirmExit(); }} />
    <Dialog open={(confirmingText || input.emptyWarning) && !exitOpen} onOpenChange={(open) => { if (!open) { setConfirmingText(false); input.closeEmptyWarning(); } }}>
      <DialogContent className="pt-ref pt-modal-host" overlayClassName="pt-reference-overlay" showCloseButton={false}><div className="sheet">
        <DialogTitle render={<h3 />}>{input.emptyWarning ? "발표 내용을 입력해 주세요" : "텍스트로 바꿀까요?"}</DialogTitle>
        <DialogDescription>{input.emptyWarning ? "공백만 있는 발표는 제출할 수 없어요. 남은 제출 시간 안에 내용을 입력해 주세요." : "녹음을 멈추고 텍스트로 전환해요. 지금까지 녹음한 음성은 제출되지 않으며, 남은 PT 면접은 텍스트로 진행해요. 남은 발표 시간은 그대로 흘러가요."}</DialogDescription>
        <div className="acts"><button type="button" className="btn ink" onClick={() => { if (input.emptyWarning) input.closeEmptyWarning(); else input.switchToText(); setConfirmingText(false); }}>{input.emptyWarning ? "확인" : "텍스트로 바꾸기"}</button>{!input.emptyWarning && <button type="button" className="btn ghost" onClick={() => setConfirmingText(false)}>계속 녹음하기</button>}</div>
      </div></DialogContent>
    </Dialog>
  </>;
}
