import type { ReactNode } from "react";
import { Check, FileText, LockKeyhole, NotebookPen, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import usePTMemo from "@/hooks/usePTMemo";
import { formatPTTime } from "@/lib/ptSession";
import { ptTrackLabels } from "@/lib/ptSession";
import { ptRelatedProblems, ptTaskParagraphs, ptTaskProblems, ptTaskTextBlock } from "@/lib/ptTaskView";
import type { PTSession, PTTaskContent as TaskContent, PTTrack } from "@/types/pt";
import "./pt-reference.css";

export type PTReferenceTab = "task" | "memo" | "talk";

export function PTProgressHeader({ company, step, remaining, recording, children, tabs }: {
  company: string; step: 0 | 1 | 2; remaining?: number | null; recording?: boolean; children?: ReactNode; tabs?: ReactNode;
}) {
  const stages = ["과제 확인·준비", "발표", "질의응답"];
  return <header className="pt-bar"><div className="wrap pt-bar-in">
    <div className="pt-who"><b>{company}{step > 0 ? " PT 면접" : ""}</b><span>{step === 0 ? "PT 준비" : stages[step]}</span></div>
    <ol className="pt-steps" aria-label="진행 단계">{stages.map((label, index) => <li key={label} className={index < step ? "done" : index === step ? "now" : ""} aria-current={index === step ? "step" : undefined}><i aria-hidden="true">{index < step ? <Check size={13} /> : index + 1}</i><span>{label}</span></li>)}</ol>
    <div className="pt-bar-r">{remaining !== undefined && remaining !== null && <div className={`pt-timer${recording ? " rec" : ""}${remaining === 0 ? " end" : ""}`} role="timer" aria-label={`${step === 0 ? "남은 준비 시간" : "남은 발표 시간"} ${formatPTTime(remaining)}`}>
      {recording && <span className="rd" aria-hidden="true" />}<span className="lb">{step === 0 ? remaining === 0 ? "준비 시간 종료" : "남은 준비 시간" : "발표"}</span><b>{formatPTTime(remaining)}</b>
    </div>}{children}</div>
    {tabs}
  </div></header>;
}

export function PTTaskContent({ content, track }: { content: TaskContent; track?: PTTrack | null }) {
  const related = ptRelatedProblems(content, track);
  const problems = ptTaskProblems(content);
  return <article className="pt-task" aria-label="PT 과제">
    <div className="pt-task-h"><h1 className="pt-h">{content.title}</h1><div className="pt-virtual"><b>가상 연습 과제</b><span>실제 기업의 내부 시스템이나 기출문제를 설명한 것이 아닙니다.</span></div></div>
    <section className="pt-sec"><h2>서비스 개요</h2>{ptTaskParagraphs(content.serviceDescription).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
    {!!content.currentFlow?.length && <section className="pt-sec"><h2>현재 이용 흐름</h2><ol className="pt-stepv">{content.currentFlow.map((item, index) => {
      const { title, detail } = ptTaskTextBlock(item);
      return <li key={index}><b>{title}</b>{detail && <span>{detail}</span>}</li>;
    })}</ol></section>}
    <section className="pt-sec"><h2>문제 상황{!!related.length && track && <em>{ptTrackLabels[track]} 분야와 이어지는 문제 강조</em>}</h2><ol className="pt-ul num pt-prob">{problems.map(({ title, detail }, index) => <li key={index} className={related.some((problem) => problem.index === index) ? "hl" : undefined}><b>{title}</b>{detail && <span>{detail}</span>}</li>)}</ol></section>
    {!!content.availableData?.length && <section className="pt-sec"><h2>사용 가능한 자료</h2><div className="pt-data">{content.availableData.map((item, index) => {
      const { title, detail } = ptTaskTextBlock(item);
      return <div className={`r${detail ? " pt-data-text" : " pt-data-title"}`} key={index}><b>{title}</b>{detail && <span className="c">{detail}</span>}</div>;
    })}</div></section>}
    {!!content.constraints?.length && <section className="pt-sec"><h2>제약 조건</h2><ul className="pt-ul">{content.constraints.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
    {!!content.exerciseAssumptions?.length && <section className="pt-sec"><h2>연습용 가정</h2><div className="pt-assume">{content.exerciseAssumptions.map((item, index) => {
      const { title, detail } = ptTaskTextBlock(item);
      return <span key={index}><b>{title}</b>{detail && <small>{detail}</small>}</span>;
    })}</div></section>}
    {!!content.presentationRequirements?.length && <section className="pt-sec pt-req"><h2>발표 요구사항</h2><p>한 분야를 선택하고 문제·근거·대안·실행·검증 방법을 5분 안에 설명하세요.</p><ul>{content.presentationRequirements.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
  </article>;
}

export function PTTrackGuide({ content, track }: { content: TaskContent; track: PTTrack }) {
  const [scope, ...details] = ptTaskParagraphs(content.trackGuidance[track] ?? "");
  const related = ptRelatedProblems(content, track);
  if (!scope) return null;
  return <div className="pt-guide" key={track} role="status" aria-live="polite">
    <p><b>{ptTrackLabels[track]} 분야로 발표해요.</b> {scope}</p>
    {details.map((detail, index) => <p key={index}>{detail}</p>)}
    {!!related.length && <div className="pt-rel">이어지는 문제{related.map(({ index, title }) => <span key={index}><i>{index + 1}</i>{title}</span>)}</div>}
  </div>;
}

export function PTReferenceButtons({ onOpen, includeTalk = false }: { onOpen: (tab: PTReferenceTab) => void; includeTalk?: boolean }) {
  return <div className="pt-aux"><button type="button" className="btn ghost sm" onClick={() => onOpen("task")}><FileText size={15} aria-hidden="true" />과제 보기</button><button type="button" className="btn ghost sm" onClick={() => onOpen("memo")}><NotebookPen size={15} aria-hidden="true" />내 메모 보기</button>{includeTalk && <button type="button" className="btn ghost sm" onClick={() => onOpen("talk")}><FileText size={15} aria-hidden="true" />내 발표 보기</button>}</div>;
}

export function PTReferencePanel({ session, tab, onChange }: { session: PTSession; tab: PTReferenceTab | null; onChange: (tab: PTReferenceTab | null) => void }) {
  const { memo } = usePTMemo(session.sessionId);
  const tabs: { value: PTReferenceTab; label: string }[] = [{ value: "task", label: "과제" }, { value: "memo", label: "내 메모" }, ...(session.presentation ? [{ value: "talk" as const, label: "내 발표" }] : [])];
  return <Dialog open={tab !== null} onOpenChange={(open) => { if (!open) onChange(null); }}><DialogContent className="pt-ref pt-drawer-host" overlayClassName="pt-reference-overlay" showCloseButton={false}>
    <aside className="pt-drawer"><DialogTitle className="sr-only">과제와 메모 보기</DialogTitle>
      <div className="pt-drawer-h"><div className="seg" role="tablist" aria-label="참고 내용">{tabs.map(({ value, label }, index) => <button type="button" className={tab === value ? "on" : ""} role="tab" key={value} id={`pt-reference-tab-${value}`} aria-selected={tab === value} aria-controls="pt-reference-content" tabIndex={tab === value ? 0 : -1} onClick={() => onChange(value)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
        if (next === null) return;
        event.preventDefault(); onChange(tabs[next].value); document.getElementById(`pt-reference-tab-${tabs[next].value}`)?.focus();
      }}>{label}</button>)}</div><button type="button" className="pt-x" aria-label="닫기" onClick={() => onChange(null)}><X size={18} /></button></div>
      <div id="pt-reference-content" className="pt-drawer-b" role="tabpanel" aria-labelledby={tab ? `pt-reference-tab-${tab}` : undefined} tabIndex={0}>
        {tab === "task" ? <PTTaskContent content={session.task.content} track={session.track} /> : <><p className="pt-ro">{tab === "memo" ? memo || "아직 작성한 개인 메모가 없어요." : session.presentation?.transcript || "저장된 발표 내용이 없어요."}</p>{tab === "memo" && <p className="pt-ro-cap"><LockKeyhole size={14} aria-hidden="true" />개인 메모는 평가에 사용되지 않아요.</p>}</>}
      </div>
    </aside>
  </DialogContent></Dialog>;
}
