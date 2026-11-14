import { useEffect, useRef, useState } from "react";
import { isCancel } from "axios";
import { useBlocker, useNavigate } from "react-router-dom";
import LoadingState, { LoadingIndicator } from "@/components/common/LoadingState";
import usePTSetup from "@/hooks/usePTSetup";
import { saveInterviewSetup } from "@/lib/interviewSetup";
import { ptErrorMessage, ptPreparationPath, readPendingPTCreation } from "@/lib/ptSession";
import { useAuthStore } from "@/store/authStore";
import { useInterviewStore } from "@/store/useInterviewStore";
import type { PTInterviewSetup } from "@/types/setup";

import { Search, X } from "lucide-react";
import InterviewSetupLayout from "./InterviewSetupLayout";

interface PTSetupFormProps {
  initialSetup: PTInterviewSetup | null;
  onSelectQA: () => void;
}

export default function PTSetupForm({ initialSetup, onSelectQA }: PTSetupFormProps) {
  const navigate = useNavigate();
  const { options, isLoading, error: optionsError, isCreating, createSession, retry } = usePTSetup();
  const [pending] = useState(() => readPendingPTCreation());
  const [companyId, setCompanyId] = useState<number | null>(initialSetup?.companyId ?? pending?.request.companyId ?? null);
  const [preparationMinutes, setPreparationMinutes] = useState(initialSetup?.preparationMinutes ?? pending?.request.preparationMinutes ?? 20);
  const [jobRole, setJobRole] = useState(initialSetup?.jobRole ?? pending?.request.jobRole ?? "");
  const [error, setError] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(0);
  const companySearchRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const handedOffRef = useRef(false);
  const selectedCompany = options?.companies.find((company) => company.companyId === companyId);
  const matchingCompanies = options?.companies.filter((company) => (company.companyName + (company.companyName.includes("기업은행") ? " IBK" : "")).toLocaleLowerCase().includes(companySearch.trim().toLocaleLowerCase())) ?? [];
  const selectedMinutes = options?.preparationMinutes.includes(preparationMinutes)
    ? preparationMinutes : options?.preparationMinutes[0];
  const canStart = !!selectedCompany && selectedMinutes !== undefined && jobRole.trim().length <= 100 && !isLoading && !optionsError && !isCreating;

  const blocker = useBlocker(() => isCreating && !handedOffRef.current);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("PT 면접을 준비하고 있어요. 화면을 나가시겠어요? 다시 요청하면 같은 면접을 확인할 수 있어요.")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    if (!isCreating) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isCreating]);

  const handleStart = async () => {
    if (!canStart || submittingRef.current || !selectedCompany || selectedMinutes === undefined) return;
    submittingRef.current = true;
    setError(null);
    try {
      const session = await createSession({
        companyId: selectedCompany.companyId,
        preparationMinutes: selectedMinutes,
        ...(jobRole.trim() ? { jobRole: jobRole.trim() } : {}),
      });
      useInterviewStore.getState().resetInterview();
      const auth = useAuthStore.getState();
      saveInterviewSetup({
        interviewType: "PT",
        companyId: session.task.companyId,
        companyName: session.task.companyName,
        preparationMinutes: session.preparationMinutes,
        jobRole: session.jobRole ?? "",
      }, session.sessionId, auth.isLoggedIn ? auth.user?.id ?? null : null);
      try {
        sessionStorage.setItem("ptPreparationSessionId", String(session.sessionId));
      } catch (failure) {
        console.warn("PT 세션 주소 보관 실패:", failure);
      }
      handedOffRef.current = true;
      navigate(ptPreparationPath(session.sessionId), { state: { sessionId: session.sessionId } });
    } catch (failure) {
      if (!isCancel(failure)) setError(ptErrorMessage(failure, "PT 면접을 준비하지 못했습니다. 다시 시도해 주세요."));
    } finally {
      submittingRef.current = false;
    }
  };

  const showResults = searchOpen && !!companySearch.trim() && !selectedCompany;
  const pickCompany = (id: number) => { setCompanyId(id); setCompanySearch(""); setSearchOpen(false); setActiveOption(0); };
  return <InterviewSetupLayout type="PT" locked={isCreating} onTypeChange={(type) => { if (type === "QA") onSelectQA(); }} footer={<div className="submitbar">
    <button type="button" className="btn ink" onClick={() => { void handleStart(); }} disabled={!canStart}>{isCreating ? <><LoadingIndicator size="sm" />PT 과제 준비 중</> : "과제 확인하고 준비 시작"}</button>
    <span className="hint pt-submit-hint">{!selectedCompany ? "기업과 준비 시간을 고르면 시작할 수 있어요" : "과제가 공개되면 준비 시간이 시작돼요"}</span>
  </div>}>
    {isLoading && <LoadingState inline title="PT 기업과 준비 시간을 불러오고 있어요" />}
    {optionsError && <div className="pt-err" role="alert"><span><b>설정을 불러오지 못했어요.</b>{optionsError}<br /><button type="button" className="btn ghost sm" onClick={retry}>다시 불러오기</button></span></div>}
    {!isLoading && !optionsError && options && <div className="su-sub">
      <div className="field"><label className="fl" htmlFor="pt-company-search"><span className="req">필수</span>어느 기업의 PT를 연습할까요?</label>
        {options.companies.length === 0 ? <div className="su-empty"><b>아직 준비된 PT 과제가 없어요.</b><span>과제가 등록되면 연습할 수 있어요.</span></div> : selectedCompany ? <div><span className="picked">{selectedCompany.companyName}<button type="button" aria-label="기업 다시 고르기" onClick={() => { setCompanyId(null); setCompanySearch(""); requestAnimationFrame(() => companySearchRef.current?.focus()); }}><X size={13} aria-hidden="true" /></button></span></div> : <div className="search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
          <Search className="ic" size={19} strokeWidth={2} color="#8A857D" aria-hidden="true" />
          <input ref={companySearchRef} id="pt-company-search" type="text" autoComplete="off" value={companySearch} placeholder="기업명을 검색하세요 (예: 기업은행, IBK)" role="combobox" aria-expanded={showResults} aria-controls="pt-company-options" aria-autocomplete="list" aria-activedescendant={showResults && matchingCompanies[activeOption] ? `pt-company-${matchingCompanies[activeOption].companyId}` : undefined} onFocus={() => setSearchOpen(true)} onChange={(event) => { setCompanySearch(event.target.value); setSearchOpen(true); setActiveOption(0); }} onKeyDown={(event) => {
            if (event.key === "Escape") { setSearchOpen(false); return; }
            if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setSearchOpen(true); setActiveOption((index) => matchingCompanies.length ? (index + (event.key === "ArrowDown" ? 1 : matchingCompanies.length - 1)) % matchingCompanies.length : 0); }
            if (event.key === "Enter" && showResults && matchingCompanies[activeOption]) { event.preventDefault(); pickCompany(matchingCompanies[activeOption].companyId); }
          }} />
          {showResults && <div className="ac" id="pt-company-options" role="listbox" aria-label="PT 과제가 있는 기업">{matchingCompanies.length ? matchingCompanies.map((company, index) => <button type="button" role="option" id={`pt-company-${company.companyId}`} key={company.companyId} className={index === activeOption ? "hl" : ""} aria-selected={index === activeOption} onMouseEnter={() => setActiveOption(index)} onClick={() => pickCompany(company.companyId)}><span className="nm">{company.companyName}</span></button>) : <div className="empty">‘{companySearch.trim()}’의 PT 과제는 아직 없어요. 과제가 등록된 기업만 연습할 수 있어요.</div>}</div>}
        </div>}
        <span className="hint">PT 과제가 등록된 기업만 검색돼요. 과제 내용은 준비를 시작할 때 공개돼요.</span>
      </div>
      <div className="field"><label className="fl" htmlFor="pt-job-role">지원 직무 <span className="opt">선택</span></label><input id="pt-job-role" className="inp" type="text" placeholder="예: 금융 IT / 백엔드" value={jobRole} maxLength={100} onChange={(event) => setJobRole(event.target.value)} /><div className="frow">{["백엔드", "프론트엔드", "금융 IT"].map((role) => <button type="button" className="chip" key={role} onClick={() => setJobRole(role)}>{role}</button>)}</div></div>
      <div className="field"><div className="fl" id="pt-preparation-label"><span className="req">필수</span>준비 시간</div><div className="frow" role="radiogroup" aria-labelledby="pt-preparation-label">{options.preparationMinutes.map((minutes) => <button type="button" role="radio" aria-checked={selectedMinutes === minutes} className={`chip${selectedMinutes === minutes ? " on" : ""}`} key={minutes} onClick={() => setPreparationMinutes(minutes)}>{minutes}분</button>)}</div></div>
      <div className="pt-howto"><span className="lb">진행 안내</span><ol className="pt-route"><li><b>과제 확인·준비</b><span>{selectedMinutes}분</span></li><li><b>발표</b><span>최대 {Math.floor(options.presentationSeconds / 60)}분</span></li><li><b>질의응답</b><span>{options.totalQuestionCount}개</span></li></ol><ul className="pt-notes"><li>과제가 공개되면 준비 시간이 시작돼요.</li><li>개인 메모는 평가에 사용되지 않아요.</li><li>발표가 끝나면 질문이 바로 이어지고, 질문 표시와 음성 재생이 끝나면 녹음돼요. 필요하면 텍스트로 답할 수 있어요.</li></ul></div>
    </div>}
    {error && <div className="pt-err" role="alert"><span><b>과제를 불러오지 못했어요.</b>{error} 설정은 그대로 두었어요. 다시 시도해 주세요.</span></div>}
  </InterviewSetupLayout>;
}
