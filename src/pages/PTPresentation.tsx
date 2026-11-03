import { useCallback, useEffect, useRef, useState } from "react";
import { useBeforeUnload, useBlocker, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, Clock3, FileText, LockKeyhole, Mic, RotateCcw, Type } from "lucide-react";
import Header from "@/components/common/Header";
import PresentationVisualizer from "@/components/presentation/PresentationVisualizer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import usePresentationPreview, { formatPresentationTime, PRESENTATION_LIMIT_SECONDS } from "@/hooks/usePresentationPreview";
import { useAlertStore } from "@/store/useAlertStore";
import "@/components/presentation/presentation.css";

const sampleTopic = "생성형 AI를 은행 상담 업무에 도입하는 방안과 리스크를 발표하시오";
const sampleNote = [
  "결론 · 반복적인 상담부터 단계적으로 도입",
  "",
  "1. 도입 범위",
  "자주 묻는 질문과 상품 안내부터 시작하고, 중요한 판단은 상담원에게 연결한다.",
  "",
  "2. 기대 효과와 확인 지표",
  "상담 대기 시간, 답변 정확도, 상담원 전환율을 함께 확인한다.",
  "",
  "3. 리스크와 대응",
  "잘못된 답변과 개인정보 노출에 대비해 검증된 자료만 참조하고 접근 권한을 제한한다.",
  "",
  "정리 · 작은 범위에서 검증한 뒤 확대한다.",
].join("\n");

type PresentationNavigation = { presentationTopic?: string; presentationNote?: string };
type LocalDialog = "TEXT" | "NOTE" | "EMPTY" | null;

export default function PTPresentation() {
  const location = useLocation();
  const rawState: unknown = location.state;
  const state: PresentationNavigation = typeof rawState === "object" && rawState !== null
    ? rawState as PresentationNavigation : {};
  const topic = typeof state.presentationTopic === "string" && state.presentationTopic.trim()
    ? state.presentationTopic.trim() : sampleTopic;
  const note = typeof state.presentationNote === "string" ? state.presentationNote : sampleNote;

  return <PresentationScreen key={location.key} topic={topic} note={note} />;
}

function PresentationScreen({ topic, note }: { topic: string; note: string }) {
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<LocalDialog>(null);
  const [text, setText] = useState("");
  const completedRef = useRef(false);
  const globalDialogOpen = useAlertStore((state) => state.isOpen);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    !completedRef.current && currentLocation.pathname !== nextLocation.pathname,
  );
  const paused = blocker.state === "blocked" || dialog !== null || globalDialogOpen;
  const presentation = usePresentationPreview(paused);
  const complete = presentation.phase === "COMPLETE";
  const short = presentation.phase === "SHORT";
  const active = !paused && presentation.phase === "PRESENTING";
  const elapsed = formatPresentationTime(presentation.elapsedSeconds);
  const hasNote = note.trim().length > 0;
  const openDialog = blocker.state === "blocked" ? "EXIT" : dialog ?? (short ? "SHORT" : null);

  useEffect(() => { completedRef.current = complete; }, [complete]);

  const shouldWarnOnUnload = !complete;
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (shouldWarnOnUnload) {
      event.preventDefault();
      event.returnValue = "";
    }
  }, [shouldWarnOnUnload]));

  const finish = () => {
    if (presentation.inputMode === "TEXT" && !text.trim()) {
      setDialog("EMPTY");
      return;
    }
    presentation.finish();
  };

  const closeDialog = () => {
    if (blocker.state === "blocked") blocker.reset();
    else if (short) presentation.continuePresentation();
    else setDialog(null);
  };

  const restart = () => {
    setText("");
    setDialog(null);
    completedRef.current = false;
    presentation.restart();
  };

  const goToSetup = () => {
    completedRef.current = true;
    navigate("/setup");
  };

  return (
    <>
      <Header />
      <main className="ptp-page">
        <div className="ptp-wrap">
          <div className="ptp-preview-notice">
            <span>화면 미리보기</span>
            <p>예시 주제로 화면을 확인할 수 있어요. 실제 녹음과 제출은 진행되지 않아요.</p>
          </div>

          <header className="ptp-header">
            <div className="ptp-heading-line">
              <span className="ptp-chip">PT 발표</span>
              <span className="ptp-next">발표 후 질의응답 <span aria-hidden="true">·</span> 메인 질문 2개</span>
              <div className={`ptp-timer ${active ? "is-active" : ""}`} role="timer" aria-label={`발표 시간 ${elapsed}, 최대 8분`}>
                <span className="ptp-record-dot" aria-hidden="true" />
                <strong>{elapsed}</strong><span>/ 8:00</span>
              </div>
            </div>
            <p className="ptp-eyebrow">발표 주제</p>
            <h1>{topic}</h1>
            <div className="ptp-steps" aria-label="PT 면접 진행 단계">
              <span><Check size={13} aria-hidden="true" /> 준비 완료</span>
              <ChevronRight size={13} aria-hidden="true" />
              <span className={!complete ? "is-current" : ""} aria-current={!complete ? "step" : undefined}>발표 {!complete ? "중" : "완료"}</span>
              <ChevronRight size={13} aria-hidden="true" />
              <span>질의응답 2개</span>
            </div>
          </header>

          <div className="ptp-grid">
            <section className="ptp-memo" aria-labelledby="ptp-memo-title">
              <div className="ptp-memo-heading">
                <h2 id="ptp-memo-title"><FileText size={17} aria-hidden="true" /> 내 메모</h2>
                <span><LockKeyhole size={12} aria-hidden="true" /> 읽기 전용</span>
              </div>
              <div className={`ptp-memo-content ${!hasNote ? "is-empty" : ""}`} tabIndex={0} role="region" aria-label="준비한 발표 메모">
                {hasNote ? note : "작성한 메모가 없어요. 주제를 보며 바로 발표해 보세요."}
              </div>
              <p className="ptp-memo-hint">준비한 메모를 참고하며 내 말로 설명해 보세요.</p>
            </section>

            <section className={`ptp-stage ${complete ? "is-complete" : ""}`} aria-label="발표 진행">
              {complete ? (
                <div className="ptp-completion" role="status">
                  <span className="ptp-complete-icon"><Check size={27} aria-hidden="true" /></span>
                  <p className="ptp-eyebrow">{presentation.endedByTimeout ? "8분이 되어 발표를 마쳤어요" : "발표를 마쳤어요"}</p>
                  <h2>이제, 발표를 바탕으로<br />질문이 이어질 차례예요.</h2>
                  <p className="ptp-completion-description">실제 면접에서는 메인 질문 2개와<br />답변에 따른 꼬리 질문이 이어져요.</p>
                  <div className="ptp-summary">
                    <span><Clock3 size={15} aria-hidden="true" /> {elapsed}</span>
                    <span>{presentation.completionSource === "NOTE" ? "메모로 진행" : presentation.completionSource === "TEXT" ? "텍스트 발표" : "음성 발표"}</span>
                  </div>
                  <p className="ptp-preview-hint">미리보기에서는 질의응답으로 이동하지 않아요.</p>
                  <Button type="button" className="ptp-primary" onClick={restart}><RotateCcw size={16} aria-hidden="true" /> 다시 미리보기</Button>
                  <Button type="button" variant="ghost" onClick={goToSetup}>면접 설정으로 돌아가기</Button>
                </div>
              ) : (
                <>
                  <div className="ptp-stage-heading">
                    {presentation.inputMode === "AUDIO" ? <Mic size={15} aria-hidden="true" /> : <Type size={15} aria-hidden="true" />}
                    <span>{presentation.inputMode === "AUDIO" ? "음성으로 발표하기" : "텍스트로 발표하기"}</span>
                  </div>

                  {presentation.inputMode === "AUDIO" ? (
                    <>
                      <PresentationVisualizer active={active} />
                      <div className="ptp-caption" role="status">
                        <h2>{short ? "잠시 멈췄어요" : paused ? "발표를 잠시 멈췄어요" : "발표를 듣고 있어요"}</h2>
                        <p>{presentation.hasContinued ? "앞서 말한 내용에 이어서 설명해 주세요." : "결론부터, 근거와 함께 차분히 설명해 주세요."}</p>
                      </div>
                    </>
                  ) : (
                    <div className="ptp-text-answer">
                      <label htmlFor="ptp-answer">발표 내용</label>
                      <Textarea
                        id="ptp-answer" value={text} onChange={(event) => setText(event.target.value)}
                        placeholder="준비한 내용을 바탕으로 발표 내용을 입력해 주세요."
                        className="ptp-textarea" autoFocus
                      />
                      <p>{text.length.toLocaleString()}자 <span>이번 발표는 텍스트로 계속 진행해요.</span></p>
                    </div>
                  )}

                  <div className="ptp-progress-block">
                    <div className="ptp-progress-label"><span>발표 시간</span><span>최대 8분</span></div>
                    <div className="ptp-progress" role="progressbar" aria-label="발표 진행 시간" aria-valuemin={0} aria-valuemax={PRESENTATION_LIMIT_SECONDS} aria-valuenow={presentation.elapsedSeconds} aria-valuetext={`${elapsed} / 8:00`}>
                      <span className="ptp-progress-fill" style={{ width: `${presentation.elapsedSeconds / PRESENTATION_LIMIT_SECONDS * 100}%` }} />
                      <span className="ptp-progress-marker" aria-hidden="true"><i /><span>2분</span></span>
                    </div>
                  </div>

                  <Button type="button" className="ptp-primary" onClick={finish} disabled={paused || short}>
                    발표 완료 <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                  <p className="ptp-limit-hint">발표는 최대 8분까지 가능하며, 시간이 되면 자동으로 마쳐요.</p>
                  <div className="ptp-alternatives">
                    {presentation.inputMode === "AUDIO" && <button type="button" onClick={() => setDialog("TEXT")} disabled={paused || short}>텍스트로 발표하기</button>}
                    {hasNote && <button type="button" onClick={() => setDialog("NOTE")} disabled={paused || short}>메모로 진행하기</button>}
                  </div>
                </>
              )}
            </section>
          </div>

          {import.meta.env.DEV && !complete && (
            <details className="ptp-preview-controls">
              <summary>화면 상태 빠르게 확인</summary>
              <p>긴 대기 없이 시간에 따른 화면 변화를 확인할 수 있어요.</p>
              <div>
                <Button type="button" variant="outline" size="sm" disabled={!active} onClick={() => presentation.seek(120)}>2분 경과</Button>
                <Button type="button" variant="outline" size="sm" disabled={!active} onClick={() => presentation.seek(475)}>종료 5초 전</Button>
                <Button type="button" variant="ghost" size="sm" onClick={restart}>처음부터</Button>
              </div>
            </details>
          )}
        </div>
      </main>

      <Dialog open={openDialog !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-[400px] rounded-[24px] p-7 sm:max-w-[400px]" showCloseButton={false}>
          <DialogTitle className="text-[21px] font-semibold leading-snug">
            {openDialog === "EXIT" ? "발표 미리보기를 그만둘까요?" : openDialog === "SHORT" ? "조금 더 설명해 볼까요?" : openDialog === "TEXT" ? "텍스트로 발표할까요?" : openDialog === "NOTE" ? "준비한 메모로 진행할까요?" : "발표 내용을 입력해 주세요"}
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-7">
            {openDialog === "EXIT" ? "입력 중인 발표 내용과 진행 시간은 초기화돼요. 준비 화면에서 작성한 메모는 변경되지 않아요."
              : openDialog === "SHORT" ? `지금까지 ${elapsed} 발표했어요. 이어서 말하면 앞서 말한 시간은 유지돼요. 이어 말하기는 한 번만 할 수 있고, 전체 발표는 8분까지 가능해요.`
              : openDialog === "TEXT" ? "전환 후에는 이번 발표에서 음성으로 돌아갈 수 없어요. 준비한 메모는 계속 참고할 수 있어요."
              : openDialog === "NOTE" ? "음성이나 텍스트 발표 대신 준비한 메모를 바탕으로 질의응답을 진행하는 방식이에요. 미리보기에서는 메모 선택 후의 완료 화면을 확인할 수 있어요."
              : "텍스트가 비어 있어요. 발표할 내용을 입력하거나 준비한 메모로 진행해 주세요."}
          </DialogDescription>
          <div className="mt-2 flex flex-col gap-2.5">
            {openDialog === "EXIT" ? (
              <>
                <Button type="button" className="h-12 rounded-xl" onClick={() => blocker.state === "blocked" && blocker.reset()}>계속 발표하기</Button>
                <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => blocker.state === "blocked" && blocker.proceed()}>나가기</Button>
              </>
            ) : openDialog === "SHORT" ? (
              <>
                <Button type="button" className="h-12 rounded-xl" onClick={presentation.continuePresentation}>이어서 말하기</Button>
                <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={presentation.finishShortPresentation}>이대로 마치기</Button>
              </>
            ) : (
              <>
                <Button type="button" className="h-12 rounded-xl" onClick={() => {
                  if (openDialog === "TEXT") presentation.switchToText();
                  if (openDialog === "NOTE") presentation.finishWithNote();
                  setDialog(null);
                }}>{openDialog === "TEXT" ? "텍스트로 전환" : openDialog === "NOTE" ? "메모로 진행" : "확인"}</Button>
                {openDialog !== "EMPTY" && <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={closeDialog}>취소</Button>}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
