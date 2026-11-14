import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check, Mic, Type } from "lucide-react";
import { PTProgressHeader, PTReferencePanel, type PTReferenceTab } from "@/components/presentation/PTWorkspace";
import Header from "@/components/common/Header";
import PageLoading from "@/components/common/PageLoading";
import PTAudioWaveform from "@/components/presentation/PTAudioWaveform";
import PTExitDialog from "@/components/presentation/PTExitDialog";
import PTQuestionOrb from "@/components/presentation/PTQuestionOrb";
import PTSessionUnavailable from "@/components/presentation/PTSessionUnavailable";
import { ensureReportAnalysis } from "@/lib/reportAnalysis";
import { reportPath } from "@/lib/reportNavigation";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import usePTPage from "@/hooks/usePTPage";
import usePTQuestions from "@/hooks/usePTQuestions";
import usePTAnswer from "@/hooks/usePTAnswer";
import usePTQuestionPresentation from "@/hooks/usePTQuestionPresentation";
import { releasePTAnswerDraft } from "@/lib/ptAnswerDraft";
import { formatPTTime, ptTrackLabels } from "@/lib/ptSession";
import { PT_TEXT_MAX_LENGTH } from "@/lib/ptPresentation";
import type { PTQuestion } from "@/types/pt";

export default function PTInterview() {
  const flow = usePTPage("QUESTIONS");
  const questions = usePTQuestions(flow);
  const navigate = useNavigate();
  const [referenceTab, setReferenceTab] = useState<PTReferenceTab | null>(null);
  const stopAnswer = useRef<(() => void) | null>(null);
  const { session, sessionId, isLoading, isExpired, error, busy, actionError, questionError, exitOpen } = flow;
  const progress = flow.questions;
  const question = progress?.question;
  const completed = session?.phase === "COMPLETED";
  const cancelled = session?.phase === "CANCELLED";
  const confirmedCount = progress?.answeredCount;
  useEffect(() => {
    if (!completed || !sessionId || exitOpen) return;
    ensureReportAnalysis(sessionId, { format: 'PT', createIfMissing: true });
    navigate(reportPath(sessionId), { replace: true, state: { sessionId, interviewType: 'PT', startAnalysis: true } });
  }, [completed, sessionId, exitOpen, navigate]);
  useEffect(() => {
    if (sessionId && confirmedCount !== undefined) releasePTAnswerDraft(sessionId, confirmedCount);
  }, [sessionId, confirmedCount]);
  const confirmExit = useCallback(async () => {
    stopAnswer.current?.();
    if (await flow.confirmExit() && sessionId) releasePTAnswerDraft(sessionId);
  }, [flow, sessionId]);

  if (isLoading) return <PageLoading layout="setup" title="PT 질의응답 상태를 확인하고 있어요" />;
  if (!session || isExpired) return <PTSessionUnavailable expired={isExpired} error={error} onRetry={sessionId ? () => { void flow.retry(); } : undefined} />;
  const count = confirmedCount ?? 0;
  const displayedOrdinal = question?.ordinal ?? Math.max(1, count);
  const mainNumber = question?.mainNumber ?? Math.min(2, Math.ceil(displayedOrdinal / 3));
  const followUpNumber = question?.followUpNumber ?? (displayedOrdinal - 1) % 3;
  const displayError = questions.waitError || questionError || actionError || error;
  const waiting = progress?.processing || busy === "NEXT";

  return <>
    <Header hideBackButton focusLabel={flow.active ? "PT 면접 진행 중" : undefined} onExit={flow.requestExit} exitDisabled={flow.cancelBlocked} />
    <main className="pt-ref pt-ref-page pt-view">
      {!completed && !cancelled && <PTProgressHeader company={session.task.companyName} step={2}>
        <span className="pt-qprog"><b>질의응답 {mainNumber}/2</b></span>
      </PTProgressHeader>}
      <section className={`wrap pt-stage${completed || cancelled ? " pt-done" : ""}`}>
        {!completed && !cancelled && <header className="pt-qhead">
          <div className="pt-segs" role="img" aria-label={`메인 질문 ${mainNumber}/2, 저장된 답변 ${count}/${progress?.totalQuestionCount ?? 6}`}>
            {[1, 2].map((number) => <span key={number}><i style={{ width: `${number < mainNumber ? 100 : number === mainNumber ? (followUpNumber + 1) / 3 * 100 : 0}%` }} /></span>)}
          </div>
          <span className={`iv-chip${followUpNumber > 0 ? " follow" : ""}`}>{followUpNumber > 0 ? `꼬리 질문 ${followUpNumber}/2` : "메인 질문"}</span>
        </header>}
        {displayError && <div role="alert" className="pt-note info"><AlertCircle size={20} aria-hidden="true" /><div>
          <b>진행 상태를 확인해 주세요</b>{displayError}
          <div className="acts"><button type="button" className="btn ghost sm" disabled={!!busy} onClick={questions.retry}>상태 다시 확인</button></div>
        </div></div>}
        {completed || cancelled ? <>
          <span className={`pt-done-mark${cancelled ? " soft" : ""}`}><Check size={30} aria-hidden="true" /></span>
          <h1 className="cs-title">{completed ? "PT 면접을 완료했어요." : "PT 면접이 취소됐어요"}</h1>
          <p className="pv-sub">{completed ? "발표와 질의응답 6개가 저장되었습니다." : "면접 설정에서 새 연습을 시작할 수 있어요."}</p>
          <div className="pt-completion-meta"><span>{session.task.companyName}</span>{session.track && <span>{ptTrackLabels[session.track]}</span>}</div>
          <div className="pt-completion-actions">
            {completed && <button type="button" className="btn ink" onClick={() => navigate("/report", { state: { sessionId: session.sessionId, interviewType: "PT" } })}>결과 리포트 보기</button>}
            <button type="button" className="btn ghost" onClick={() => navigate("/")}>홈으로</button>
          </div>
        </> : question && progress?.phase === "QUESTIONING" ? <AnswerArea key={`${session.sessionId}:${question.questionId}`} question={question} sessionId={session.sessionId} flow={flow} stopAnswer={stopAnswer} onOpenReference={setReferenceTab} />
          : !displayError && <>
            <div className="pt-orb"><PTQuestionOrb orbOnly text="" state="thinking" /></div>
            <div className="pt-state muted" role="status"><span className="sp dk" aria-hidden="true" />{waiting ? "질문과 답변을 처리하고 있어요" : "면접관이 다음 질문을 준비하고 있어요"}</div>
          </>}
      </section>
    </main>
    <PTReferencePanel session={session} tab={referenceTab} onChange={setReferenceTab} />
    <PTExitDialog open={exitOpen} busy={flow.cancelBlocked} error={flow.failedAction?.type === "CANCEL" ? actionError : null} onContinue={flow.closeExit} onCancel={() => { void confirmExit(); }} />
  </>;
}

function AnswerArea({ question, sessionId, flow, stopAnswer, onOpenReference }: {
  question: PTQuestion; sessionId: number; flow: ReturnType<typeof usePTPage>; stopAnswer: RefObject<(() => void) | null>; onOpenReference: (tab: PTReferenceTab) => void;
}) {
  const [confirmingText, setConfirmingText] = useState(false);
  const presentation = usePTQuestionPresentation(question, flow.exitOpen || !!flow.questions?.processing);
  const answer = usePTAnswer(sessionId, question, flow, presentation.ready);
  const submitting = answer.preparing || flow.busy === "ANSWER_TEXT" || flow.busy === "ANSWER_AUDIO";
  const processing = !!flow.questions?.processing;
  const locked = submitting || !!flow.busy || !!answer.pending || processing;
  const recording = presentation.ready && answer.mode === "AUDIO" && answer.recorder.status === "RECORDING" && !submitting && !processing;
  const micFailed = answer.mode === "AUDIO" && answer.recorder.status === "ERROR" && !answer.pending;
  useEffect(() => {
    const stop = answer.abortForCancel;
    stopAnswer.current = stop;
    return () => { if (stopAnswer.current === stop) stopAnswer.current = null; };
  }, [answer.abortForCancel, stopAnswer]);

  return <div className={`pt-answer-area${presentation.ready && answer.mode === "TEXT" ? " typing" : ""}`}>
    <div className="pt-orb"><PTQuestionOrb orbOnly text="" state={submitting || processing ? "thinking" : !presentation.ready ? "asking" : recording ? "recording" : "idle"} /></div>
    <div className={`pt-state${recording ? "" : " muted"}`} role="status">
      {submitting || processing ? <><span className="sp dk" aria-hidden="true" />{flow.busy === "ANSWER_AUDIO" ? "음성을 변환하고 있어요" : "답변을 저장하고 있어요"}</>
        : !presentation.ready ? "면접관이 질문하고 있어요"
          : answer.mode === "TEXT" ? <><Type size={17} aria-hidden="true" />텍스트로 답변 중</>
            : recording ? <><span className="dot" aria-hidden="true" />녹음 중 <b>{formatPTTime(answer.recorder.elapsedSeconds)}</b></>
              : answer.pending ? "제출할 답변을 보관하고 있어요"
                : answer.recorder.status === "REQUESTING" ? <><span className="sp dk" aria-hidden="true" />마이크를 준비하고 있어요</> : "마이크를 확인해 주세요"}
    </div>
    <h1 className={`pt-prompt pt-q${processing ? " dim" : ""}`} aria-busy={!presentation.ready}>{presentation.text}</h1>
    {presentation.speechError && <p role="status" className="hint">{presentation.speechError}</p>}
    {answer.error && <div role="alert" className="pt-note"><AlertCircle size={20} aria-hidden="true" /><div>{answer.error}</div></div>}
    {presentation.ready && micFailed && <div className="pt-note info" role="alert"><Mic size={20} aria-hidden="true" /><div>
      <b>마이크를 사용할 수 없어요</b>{answer.recorder.error || "마이크 권한과 연결 상태를 확인해 주세요. 텍스트로도 답변할 수 있어요."}
      <div className="acts"><button type="button" className="btn ghost sm" disabled={locked || flow.exitOpen} onClick={answer.recorder.retry}>마이크 다시 확인</button></div>
    </div></div>}
    {presentation.ready && <>
      {answer.mode === "AUDIO" ? <PTAudioWaveform active={recording} levelRef={answer.recorder.levelRef} />
        : <textarea id="pt-answer" className="inp pt-text" rows={5} aria-label="답변 입력" value={answer.text} maxLength={PT_TEXT_MAX_LENGTH} disabled={locked || flow.exitOpen} onChange={(event) => answer.changeText(event.target.value)} placeholder="답변을 입력하세요" />}
      <div className="pt-act">
        <button type="button" className="btn ink pt-main" disabled={submitting || !!flow.busy || processing || flow.exitOpen || (answer.mode === "AUDIO" && !answer.pending && !["RECORDING", "STOPPED"].includes(answer.recorder.status))} onClick={() => { void answer.submit(); }}>
          {submitting ? <><span className="sp" aria-hidden="true" />저장하고 있어요</> : answer.pending ? "같은 답변 다시 제출" : answer.mode === "TEXT" ? "답변 제출" : "답변 완료"}
        </button>
        <span className="hint">{answer.pending ? "같은 내용으로 다시 제출할 수 있어요. 새로고침하면 보관 중인 녹음은 사라져요." : answer.mode === "TEXT" && !answer.text.trim() ? "내용을 입력하면 제출할 수 있어요" : ""}</span>
        {answer.mode === "AUDIO" && <button type="button" className="txtbtn" disabled={locked || flow.exitOpen} onClick={() => setConfirmingText(true)}>텍스트로 답변하기</button>}
        <button type="button" className="txtbtn" onClick={() => onOpenReference("task")}>과제·내 발표 다시 보기</button>
      </div>
    </>}
    <Dialog open={(confirmingText || answer.emptyWarning) && !flow.exitOpen} onOpenChange={(open) => { if (!open) { setConfirmingText(false); answer.closeEmptyWarning(); } }}>
      <DialogContent className="pt-ref pt-modal-host" overlayClassName="pt-reference-overlay" showCloseButton={false}><div className="sheet">
        <DialogTitle render={<h3 />}>{answer.emptyWarning ? "답변 내용을 입력해 주세요" : "텍스트로 답변할까요?"}</DialogTitle>
        <DialogDescription>{answer.emptyWarning ? "공백만 있는 답변은 제출할 수 없어요." : "녹음 중인 음성은 제출되지 않아요. 전환 후에는 남은 PT 면접을 텍스트로 진행하며 음성으로 돌아갈 수 없어요."}</DialogDescription>
        <div className="acts">
          <button type="button" className="btn ink" onClick={() => { if (answer.emptyWarning) answer.closeEmptyWarning(); else answer.switchToText(); setConfirmingText(false); }}>{answer.emptyWarning ? "확인" : "텍스트로 전환"}</button>
          {!answer.emptyWarning && <button type="button" className="btn ghost" onClick={() => setConfirmingText(false)}>계속 녹음하기</button>}
        </div>
      </div></DialogContent>
    </Dialog>
  </div>;
}
