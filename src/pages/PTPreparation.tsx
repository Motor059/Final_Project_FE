import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import PageLoading from "@/components/common/PageLoading";
import PTExitDialog from "@/components/presentation/PTExitDialog";
import PTSessionUnavailable from "@/components/presentation/PTSessionUnavailable";
import usePTPage from "@/hooks/usePTPage";
import { ptTrackLabels } from "@/lib/ptSession";
import { Check, LockKeyhole, Timer } from "lucide-react";
import usePTMemo from "@/hooks/usePTMemo";
import { PTProgressHeader, PTTaskContent, PTTrackGuide } from "@/components/presentation/PTWorkspace";
import { ptTrackDescriptions } from "@/lib/ptTaskView";
import { ptSessionTrackState } from "@/lib/ptTaskSettings";
import PTStartDialog from "@/components/presentation/PTStartDialog";
import { setPTTextMode } from "@/lib/ptPresentation";

const memoTemplateHeadings = [
  "어떤 문제를 해결할 것인가?",
  "왜 이 문제를 우선하는가?",
  "어떤 대안을 선택했는가?",
  "어떻게 실행할 것인가?",
  "효과를 어떻게 검증할 것인가?",
];
const legacyMemoTemplateHeadings = [
  "1. 선택 분야와 결론",
  "2. 핵심 문제와 선택 근거",
  "3. 개선 방안과 대안 비교",
  "4. 실행 계획과 위험 대응",
  "5. 기대 효과와 검증 방법",
];

export default function PTPreparation() {
  const navigate = useNavigate();
  const flow = usePTPage("PREPARATION");
  const { session, sessionId, isLoading, error, retry, busy, actionError, failedAction,
    selectTrack, startPresentation, retryAction, active, isExpired, remainingSeconds, exitOpen } = flow;
  const [confirmingStart, setConfirmingStart] = useState(false);
  const memoRef = useRef<HTMLTextAreaElement>(null);
  const [mobileTab, setMobileTab] = useState("task");
  const { memo, stored, changeMemo } = usePTMemo(sessionId ?? null);
  const autoDefaultTrackAttempt = useRef<string | null>(null);
  const autoStartAttempt = useRef<string | null>(null);
  const preparing = session?.phase === "PREPARING" && session.status === "IN_PROGRESS";
  const trackState = session ? ptSessionTrackState(session) : null;
  const trackRequired = trackState?.settings.trackSelectionRequired ?? true;
  const selectedTrack = trackState?.track ?? null;
  const firstAllowedTrack = trackState?.settings.allowedTracks[0];
  const trackError = trackState?.error;

  useEffect(() => {
    if (!session || !preparing || remainingSeconds !== 0 ||
      busy || error || actionError || isExpired || exitOpen || confirmingStart || trackError) return;
    const attemptKey = `${session.sessionId}:${session.preparationDeadline}`;
    if (trackRequired && !selectedTrack) {
      if (!firstAllowedTrack) return;
      if (autoDefaultTrackAttempt.current === attemptKey) return;
      autoDefaultTrackAttempt.current = attemptKey;
      void selectTrack(firstAllowedTrack);
      return;
    }
    if (autoStartAttempt.current === attemptKey) return;
    autoStartAttempt.current = attemptKey;
    void startPresentation();
  }, [session, preparing, remainingSeconds, busy, error, actionError, isExpired, exitOpen, confirmingStart, trackError, trackRequired, selectedTrack, firstAllowedTrack, selectTrack, startPresentation]);

  if (isLoading) return <PageLoading layout="setup" title="PT 과제와 남은 준비 시간을 확인하고 있어요" />;

  if (!session || !trackState || isExpired) {
    return <PTSessionUnavailable expired={isExpired} error={error} onRetry={sessionId ? () => { void retry(); } : undefined} />;
  }

  const content = session.task.content;
  const memoLocked = !preparing || remainingSeconds === 0 || busy === "START" || exitOpen;
  const hasMemoTemplate = memo.split("\n").some((line) => [...memoTemplateHeadings, ...legacyMemoTemplateHeadings].includes(line.trim()));
  const addTemplate = () => {
    if (memoLocked || hasMemoTemplate) return;
    const template = `${memoTemplateHeadings.join("\n\n\n")}\n`;
    changeMemo(`${memo.trimEnd()}${memo.trimEnd() ? "\n\n" : ""}${template}`.slice(0, 30000));
    memoRef.current?.focus();
  };
  const beginPresentation = async (mode: "AUDIO" | "TEXT") => {
    if (mode === "TEXT") setPTTextMode(session.sessionId);
    if (await startPresentation()) setConfirmingStart(false);
  };
  return <>
    <Header focusLabel={active ? "PT 면접 진행 중" : undefined} onExit={flow.requestExit} exitDisabled={flow.cancelBlocked} />
    <main className="pt-ref pt-ref-page pt-view">
      <PTProgressHeader company={session.task.companyName} step={0} remaining={remainingSeconds} tabs={<div className="seg pt-tabs" role="tablist" aria-label="준비 화면 전환">
        {[{ value: "task", label: "과제" }, { value: "side", label: trackRequired ? "분야·메모" : "메모" }].map(({ value, label }) => <button type="button" role="tab" key={value} className={mobileTab === value ? "on" : ""} aria-selected={mobileTab === value} aria-controls={`pt-preparation-${value}`} onClick={() => setMobileTab(value)}>{label}</button>)}
      </div>} />
      <div className="wrap">
        {(error || actionError) && <div role="alert" className="pt-err pt-page-error"><span>{actionError || error}<br /><button type="button" className="btn ghost sm" disabled={!!busy} onClick={() => { if (failedAction?.type === "CANCEL") void flow.confirmExit(); else void (failedAction ? retryAction() : retry()); }}>다시 시도</button></span></div>}
        {remainingSeconds === 0 && <div className="pt-ended" role="status"><Timer size={22} aria-hidden="true" /><span>준비 시간이 끝났어요. 발표를 시작해주세요.<small>시간은 더 늘어나지 않고, 메모도 더 고칠 수 없어요.</small></span></div>}
        <div className="pt-work" data-tab={mobileTab}>
          <div id="pt-preparation-task" className="pt-task-slot"><PTTaskContent content={content} track={selectedTrack} settings={session.task.settings} /></div>
          <div id="pt-preparation-side" className="pt-side">
            {trackRequired && <section className="pt-card pt-field" aria-labelledby="pt-track-title">
              <div className="pt-card-h"><h2 id="pt-track-title"><span className="req">필수</span>발표 분야 선택</h2><span className="hint">한 분야만 · 발표 시작 시 확정</span></div>
              {trackError ? <div className="pt-err" role="alert"><span>{trackError}<br /><button type="button" className="btn ghost sm" disabled={!!busy} onClick={() => { void retry(); }}>다시 불러오기</button></span></div> : <div className="pt-fields" data-count={trackState.settings.allowedTracks.length} role="radiogroup" aria-labelledby="pt-track-title" aria-busy={busy === "TRACK"}>{trackState.settings.allowedTracks.map((track) => <button type="button" key={track} role="radio" aria-checked={selectedTrack === track} className={`pt-fcard${selectedTrack === track ? " on" : ""}`} disabled={!preparing || !!busy || exitOpen || confirmingStart} onClick={() => { void selectTrack(track); }}><span className="t">{ptTrackLabels[track]}<Check className="ck" size={14} aria-hidden="true" /></span><span className="d">{ptTrackDescriptions[track]}</span></button>)}</div>}
              {selectedTrack && <PTTrackGuide key={selectedTrack} content={content} track={selectedTrack} />}
            </section>}
            <section className="pt-card pt-memo" aria-labelledby="pt-memo-title">
              <div className="pt-card-h"><h2 id="pt-memo-title">개인 메모</h2><button type="button" className="pt-tpl disabled:cursor-default disabled:opacity-50" disabled={memoLocked || hasMemoTemplate} onClick={addTemplate}>{hasMemoTemplate ? "메모 틀 추가됨" : "메모 틀 넣기"}</button></div>
              <textarea ref={memoRef} className="inp" aria-labelledby="pt-memo-title" value={memo} maxLength={30000} readOnly={memoLocked} onChange={(event) => changeMemo(event.target.value)} placeholder="자유롭게 정리하세요. 필요하면 메모 틀을 넣어 쓸 수 있어요." />
              <div className="pt-memo-foot"><span className="lock"><LockKeyhole size={14} aria-hidden="true" />개인 메모는 평가에 사용되지 않아요.</span><span>{!stored ? "화면 내 임시 보관" : memoLocked ? "읽기 전용" : "이 탭에만 임시 보관"} · {memo.length.toLocaleString()}자</span></div>
            </section>
          </div>
        </div>
      </div>
      <footer className="pt-foot"><div className="wrap pt-foot-in">
        <div className="pt-foot-r"><span className="pt-foot-msg" aria-live="polite">{trackError ? "과제 설정을 다시 불러와 주세요" : busy === "TRACK" ? "발표 분야를 저장하고 있어요" : !trackState.ready ? "발표 분야를 선택하면 시작할 수 있어요" : remainingSeconds === 0 ? "준비 시간이 끝났어요. 발표를 시작해주세요." : "준비를 일찍 마쳤다면 바로 발표할 수 있어요"}</span>
          {preparing ? <button type="button" className="btn ink" disabled={!trackState.ready || !!busy || exitOpen} onClick={() => setConfirmingStart(true)}>{busy === "START" ? "발표 시작 중…" : "발표 시작"}</button> : <button type="button" className="btn ghost" onClick={() => navigate("/setup")}>면접 설정으로 이동</button>}
        </div>
      </div></footer>
    </main>
    <PTStartDialog open={confirmingStart && preparing && !exitOpen} trackLabel={selectedTrack ? ptTrackLabels[selectedTrack] : ""} trackSelectionRequired={trackRequired} presentationSeconds={trackState.settings.presentationSeconds} busy={busy === "START"} error={failedAction?.type === "START" ? actionError : null} onClose={() => setConfirmingStart(false)} onStart={(mode) => { void beginPresentation(mode); }} />
    <PTExitDialog open={exitOpen} busy={!!busy} error={failedAction?.type === "CANCEL" ? actionError : null} onContinue={flow.closeExit} onCancel={() => { void flow.confirmExit(); }} />
  </>;
}
