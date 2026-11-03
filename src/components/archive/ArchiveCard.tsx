import { useEffect, useId, useRef, useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { archiveCompanyLabels, archiveLikeCount } from "@/lib/archiveDisplay";
import type { ArchiveCompany, ArchiveRecord } from "@/types/archive";

interface ArchiveCardProps {
  record: ArchiveRecord;
  company: ArchiveCompany;
  liked: Record<string, boolean>;
  popular: boolean;
  defaultExpanded?: boolean;
  highlight?: boolean;
  onLike: (id: string) => void;
  onReport: () => void;
  onDelete: () => void;
}
export default function ArchiveCard({ record, company, liked, popular, onLike, onReport, onDelete, defaultExpanded = false, highlight = false }: ArchiveCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tipOverflow, setTipOverflow] = useState(false);
  const tip = useRef<HTMLParagraphElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuAction = useRef<HTMLButtonElement>(null);
  const id = useId();
  const shown = expanded ? record.questions : record.questions.slice(0, 3);
  useEffect(() => {
    const element = tip.current;
    if (!element) return;
    const check = () => setTipOverflow(element.scrollHeight > element.clientHeight + 1);
    check();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [record.tip, expanded]);
  useEffect(() => {
    if (!menuOpen) return;
    menuAction.current?.focus();
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) setMenuOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);
  return (
    <article id={`archive-record-${record.id}`} className={`qcard arccard ${highlight ? "is-highlighted" : ""}`}>
      <div className="qhead">
        <div className="qmeta"><span className="qco">{company.display}</span><span className="qtype">{archiveCompanyLabels[record.companyType]}</span>{record.format === "pt" && <span className="badge pt">PT</span>}<span className="badge">{record.stage === "tech" ? "기술" : "인성"}</span>{record.role && <span className="badge">{record.role}</span>}{record.mine && <span className="badge mine">내 면접</span>}<span className="qdate qdate-m">{record.period.replace("-", ".")}</span></div>
        <div className="qright"><span className="qdate">{record.period.replace("-", ".")}</span>
          <div className="kebab" ref={menu}>
            <button type="button" className="kbtn" ref={menuButton} aria-label={`${company.display} 면접 기록 메뉴`} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={`${id}-menu`} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18} aria-hidden="true" /></button>
            {menuOpen && <div className="kmenu" id={`${id}-menu`} role="menu" onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setMenuOpen(false); }}>
              <button type="button" role="menuitem" ref={menuAction} className={record.mine ? "danger" : ""} disabled={!record.mine && record.reported} onClick={() => { setMenuOpen(false); menuButton.current?.focus(); if (record.mine) onDelete(); else onReport(); }}>{record.mine ? "면접 기록 삭제" : record.reported ? "신고 완료" : "신고하기"}</button>
            </div>}
          </div>
        </div>
      </div>
      <div className="arc-sub row"><span>받은 질문 {record.questions.length}개{popular && <span className="arc-sum">하트 {archiveLikeCount(record, liked)}</span>}</span>{record.reported && <span className="rep-done">신고함</span>}</div>
      <ol className="arcq" id={`${id}-questions`}>
        {shown.map((question, index) => (
          <li key={question.id}><span className="n">{index + 1}</span><span className="t">{question.text}</span><button type="button" className={`icbtn ${liked[question.id] ? "liked" : ""}`} onClick={() => onLike(question.id)} aria-pressed={!!liked[question.id]} aria-label={`질문 ${index + 1} 하트 ${question.likes + Number(!!liked[question.id])}개`}><Heart size={17} fill={liked[question.id] ? "currentColor" : "none"} aria-hidden="true" /><span>{question.likes + Number(!!liked[question.id])}</span></button></li>
        ))}
      </ol>
      {record.tip && <div className={`arc-tip ${expanded ? "open" : ""}`}><div className="arc-sub">분위기와 팁</div><p ref={tip}>{record.tip}</p></div>}
      {(record.questions.length > 3 || tipOverflow || expanded) && <div className="qfoot"><button type="button" className="icbtn" aria-expanded={expanded} aria-controls={`${id}-questions`} onClick={() => setExpanded(!expanded)}>{expanded ? "접기" : record.questions.length > 3 ? `질문 ${record.questions.length - 3}개 더 보기` : "팁 더 보기"}</button></div>}
    </article>
  );
}
