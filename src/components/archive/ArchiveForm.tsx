import { useCallback, useRef, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import { ArrowLeft, Check, Plus } from "lucide-react";
import CompanySearch from "@/components/archive/CompanySearch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { archiveCompanyLabels, archiveRoles, localInterviewMonth } from "@/lib/archiveDisplay";
import type { ArchiveCompany, ArchiveCompanyType, ArchiveFormat, ArchiveRecord, ArchiveStage, ArchiveSubmission } from "@/types/archive";

interface ArchiveFormProps {
  companies: ArchiveCompany[];
  records: ArchiveRecord[];
  remaining: number;
  onSubmit: (value: ArchiveSubmission) => boolean;
  onBack: () => void;
}
export default function ArchiveForm({ companies, records, remaining, onSubmit, onBack }: ArchiveFormProps) {
  const [format, setFormat] = useState<ArchiveFormat>("qa");
  const [company, setCompany] = useState<ArchiveCompany | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyType, setCompanyType] = useState<ArchiveCompanyType | null>(null);
  const [stage, setStage] = useState<ArchiveStage | null>(null);
  const [initialMonth] = useState(localInterviewMonth);
  const [period, setPeriod] = useState(initialMonth);
  const [questions, setQuestions] = useState([{ id: 1, text: "" }]);
  const [role, setRole] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [tip, setTip] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const nextQuestionId = useRef(2);
  const focusNewQuestion = useRef(false);
  const submitted = useRef(false);
  const dirty = !!(company || companyQuery.trim() || companyType || stage || format !== "qa" || period !== initialMonth || questions.length > 1 || questions.some((item) => item.text.trim()) || role || tip.trim() || consent);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !submitted.current && dirty
    && currentLocation.pathname + currentLocation.search !== nextLocation.pathname + nextLocation.search);
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (dirty && !submitted.current) { event.preventDefault(); event.returnValue = ""; }
  }, [dirty]));
  const filled = questions.map((item) => item.text.trim()).filter(Boolean);
  const validPeriod = /^\d{4}-(0[1-9]|1[0-2])$/.test(period) && period <= localInterviewMonth();
  const ready = !!(company && companyType && stage && validPeriod && filled.length && filled.length <= remaining && consent);
  const selectCompany = (value: ArchiveCompany) => {
    setCompany(value); setCompanyQuery("");
    if (!companyType) setCompanyType(records.find((record) => record.companyId === value.id)?.companyType ?? null);
  };

  return (
    <>
      <section className="hero archive-form-hero"><div className="hero-bg"><div className="hero-glow" /></div>
        <div className="wrap narrow archive-form-heading"><button type="button" className="btn ghost sm" onClick={onBack}><ArrowLeft size={14} aria-hidden="true" />아카이브로</button><h1>어떤 질문을 받으셨나요?</h1><p>직접 겪은 질문을 공유해 주세요. 다른 지원자가 하트로 저장하면 면접 전에 다시 볼 수 있어요.</p></div>
      </section>
      <section className="archive-form-body"><div className="wrap narrow">
        <form className="form" onSubmit={(event) => {
          event.preventDefault();
          if (!ready || !company || !companyType || !stage || submitted.current) return;
          submitted.current = true;
          const accepted = onSubmit({ company, companyType, format, stage, period, questions: filled, role: role === "기타" ? otherRole.trim() || role : role, tip: tip.trim() });
          if (!accepted) { submitted.current = false; setError("등록 가능한 질문 수를 확인하고 다시 시도해 주세요."); }
        }}>
          <fieldset className="field"><legend className="fl"><span className="req">필수</span>면접 형식</legend><div className="opts c2">
            {([['qa', '일반 면접', '질문과 답변으로 진행'], ['pt', 'PT 면접', '주제 발표 후 질의응답']] as const).map(([value, title, description]) => <button type="button" className={`opt-card ${format === value ? "on" : ""}`} key={value} aria-pressed={format === value} onClick={() => { setFormat(value); if (value === "pt") setStage("tech"); }}><span className="t">{title}</span><span className="d">{description}</span></button>)}
          </div></fieldset>
          <div className="field"><span className="fl"><span className="req">필수</span>회사명</span>
            {company ? <div><span className="picked">{company.display}{company.name !== company.display && <span className="picked-legal">{company.name}</span>}{company.id === "new" && <span className="picked-legal">직접 등록</span>}<button type="button" onClick={() => setCompany(null)} aria-label="회사 다시 고르기">×</button></span></div>
              : <CompanySearch companies={companies} query={companyQuery} onQueryChange={setCompanyQuery} onSelect={selectCompany} label="등록할 회사명" onCreate={(name) => selectCompany({ id: "new", name, display: name, listed: false, aliases: [] })} />}
            <p className="hint">한글, 영문, 브랜드명 어느 것으로 검색해도 같은 회사로 묶여요.</p>
          </div>
          <fieldset className="field"><legend className="fl"><span className="req">필수</span>기업 유형</legend><div className="opts c3">
            {([['large', '삼성, SK하이닉스, LG CNS'], ['service', '네이버, 카카오, 쿠팡, 배민'], ['fintech', '토스, 카카오뱅크, 은행 IT']] as const).map(([value, description]) => <button type="button" className={`opt-card ${companyType === value ? "on" : ""}`} key={value} aria-pressed={companyType === value} onClick={() => setCompanyType(value)}><span className="t">{archiveCompanyLabels[value]}</span><span className="d">{description}</span></button>)}
          </div></fieldset>
          <div className="opts c2 archive-stage-period">
            <fieldset className="field"><legend className="fl"><span className="req">필수</span>면접 단계</legend><div className="opts c2">{([['tech', '기술'], ['exec', '인성']] as const).map(([value, title]) => <button type="button" key={value} className={`opt-card centered ${stage === value ? "on" : ""} ${format === "pt" && value === "exec" ? "off" : ""}`} aria-pressed={stage === value} disabled={format === "pt" && value === "exec"} onClick={() => setStage(value)}><span className="t">{title}</span></button>)}</div></fieldset>
            <div className="field"><label className="fl" htmlFor="archive-period"><span className="req">필수</span>면접 시기</label><input id="archive-period" className="inp" type="month" max={localInterviewMonth()} value={period} required onChange={(event) => setPeriod(event.target.value)} /><span className="hint">질문이 얼마나 최신인지 판단하는 데 쓰여요</span></div>
          </div>
          <fieldset className="field"><legend className="fl"><span className="req">필수</span>질문 내용</legend><p className="hint">한 번에 여러 개 등록할 수 있어요.</p>
            {format === "pt" && <div className="note">PT 면접은 발표 주제와 발표 뒤에 받은 질문을 함께 적어 주세요. 면접 단계는 기술로 고정돼요.</div>}
            {questions.map((question, index) => <div className="qrow" key={question.id}><span className="qnum" aria-hidden="true">{index + 1}</span><textarea className="inp" rows={2} aria-label={`질문 ${index + 1}`} placeholder="면접관이 한 질문을 최대한 그대로 적어 주세요." value={question.text} ref={index === questions.length - 1 ? (element) => { if (element && focusNewQuestion.current) { focusNewQuestion.current = false; element.focus(); } } : undefined} onChange={(event) => setQuestions((previous) => previous.map((item) => item.id === question.id ? { ...item, text: event.target.value } : item))} />{questions.length > 1 && <button type="button" className="txtbtn question-remove" aria-label={`질문 ${index + 1} 삭제`} onClick={() => setQuestions((previous) => previous.filter((item) => item.id !== question.id))}>삭제</button>}</div>)}
            <button type="button" className="addq" disabled={questions.length >= remaining} onClick={() => { const id = nextQuestionId.current++; focusNewQuestion.current = true; setQuestions((previous) => [...previous, { id, text: "" }]); }}><Plus size={17} aria-hidden="true" />질문 추가</button>
          </fieldset>
          <section className="panel archive-optional">
            <fieldset className="field"><legend className="fl">직무 <span className="opt">선택</span></legend><div className="frow">{archiveRoles.map((value) => <button type="button" className={`chip ${role === value ? "on" : ""}`} key={value} aria-pressed={role === value} onClick={() => setRole(role === value ? "" : value)}>{value}</button>)}</div>{role === "기타" && <input className="inp" aria-label="기타 직무" value={otherRole} onChange={(event) => setOtherRole(event.target.value)} placeholder="직무를 입력해 주세요 (예: 보안, QA)" />}</fieldset>
            <div className="field"><label className="fl" htmlFor="archive-tip">분위기와 팁 메모 <span className="opt">선택</span></label><textarea className="inp" id="archive-tip" rows={3} value={tip} onChange={(event) => setTip(event.target.value)} placeholder="예: 다대다 면접, 꼬리 질문이 3단계까지 이어졌어요." /></div>
          </section>
          <button type="button" className={`confirm ${consent ? "on" : ""}`} aria-pressed={consent} onClick={() => setConsent(!consent)}><span className="box">{consent && <Check size={13} aria-hidden="true" />}</span><span><span className="t">본인이 직접 경험한 질문입니다 <span className="req">필수</span></span><span className="d">다른 사이트나 커뮤니티의 글을 옮겨 등록하면 안 돼요. 확인되면 삭제돼요.</span><span className="w">회사와 비밀유지 약정을 맺은 내용은 올리지 마세요. 그로 인한 책임은 등록한 분에게 있어요.</span></span></button>
          <p className="hint archive-limit">하루에 질문 20개까지 등록할 수 있어요. 등록한 면접은 기출 질문의 내 면접 카드에서 언제든 삭제할 수 있어요.<br />현재 미리보기에서 추가할 수 있는 질문: {remaining}개</p>
          {error && <p className="archive-error" role="alert">{error}</p>}
          <div className="submitbar"><button type="submit" className="btn ink" disabled={!ready}>{filled.length > 1 ? `질문 ${filled.length}개 등록하기` : "질문 등록하기"}</button></div>
        </form>
      </div></section>
      <Dialog open={blocker.state === "blocked"} onOpenChange={(open) => { if (!open && blocker.state === "blocked") blocker.reset(); }}><DialogContent className="archive-dialog rounded-[28px] p-0 sm:max-w-[400px]" showCloseButton={false}><div className="archive-page archive-modal"><div className="sheet"><DialogTitle>작성을 그만두시겠어요?</DialogTitle><DialogDescription>지금 나가면 작성 중인 면접 기록이 저장되지 않아요.</DialogDescription><div className="acts"><button type="button" className="btn ink" onClick={() => blocker.state === "blocked" && blocker.reset()}>계속 작성하기</button><button type="button" className="btn ghost" onClick={() => blocker.state === "blocked" && blocker.proceed()}>나가기</button></div></div></div></DialogContent></Dialog>
    </>
  );
}
