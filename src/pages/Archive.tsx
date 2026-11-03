import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import Header from "@/components/common/Header";
import ArchiveCard from "@/components/archive/ArchiveCard";
import ArchiveForm from "@/components/archive/ArchiveForm";
import CompanySearch from "@/components/archive/CompanySearch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { archiveCompanyLabels, archiveLikeCount, archiveReportReasons, archiveRoles, filterArchiveRecords, initialArchiveFilters } from "@/lib/archiveDisplay";
import useArchivePreview from "@/hooks/useArchivePreview";
import { useAuthStore } from "@/store/authStore";
import { startKakaoLogin } from "@/lib/authRedirect";
import { useAlertStore } from "@/store/useAlertStore";
import type { ArchiveFilters, ArchiveRecord } from "@/types/archive";
import "@/components/archive/archive.css";

export default function Archive({ preview = false }: { preview?: boolean }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showAlert = useAlertStore((state) => state.showAlert);
  if (!preview && !isLoggedIn) {
    return <><Header /><main className="archive-page"><section className="hero"><div className="hero-bg"><div className="hero-glow" /></div><div className="wrap narrow archive-login"><h1>실제 면접에서 받은 질문</h1><p>로그인하면 다른 지원자들이 실제 면접에서 받은 질문을 볼 수 있어요. 내가 받은 질문도 공유할 수 있어요.</p><button type="button" className="btn ink" onClick={() => { try { startKakaoLogin(); } catch { showAlert("로그인을 준비하지 못했습니다. 다시 시도해 주세요."); } }}>카카오로 로그인하기</button>{import.meta.env.DEV && <Link className="dv-link" to="/archive/preview">기출 질문 화면 미리보기</Link>}</div></section></main></>;
  }
  return <><Header /><ArchiveWorkspace key={preview ? "preview" : "member"} /></>;
}

function ArchiveWorkspace() {
  const model = useArchivePreview();
  const [params, setParams] = useSearchParams();
  const formView = params.get("view") === "new";
  const focusRecordId = params.get("record");
  const focusRecord = model.records.find((record) => record.id === focusRecordId);
  const [filters, setFilters] = useState<ArchiveFilters>(() => focusRecord ? { ...initialArchiveFilters, companyId: focusRecord.companyId } : initialArchiveFilters);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"arc" | "co">("arc");
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [limit, setLimit] = useState(() => {
    const index = [...model.records].sort((a, b) => b.order - a.order).findIndex((record) => record.id === focusRecordId);
    return Math.max(6, Math.ceil((index + 1) / 6) * 6);
  });
  useEffect(() => {
    if (!focusRecordId || formView) return;
    const frame = requestAnimationFrame(() => document.getElementById(`archive-record-${focusRecordId}`)?.scrollIntoView({ block: "start", behavior: "auto" }));
    return () => cancelAnimationFrame(frame);
  }, [focusRecordId, formView]);
  const [rank, setRank] = useState<Record<string, number>>({});
  const [dialog, setDialog] = useState<{ kind: "report" | "delete"; record: ArchiveRecord } | null>(null);
  const [reason, setReason] = useState("");
  const companiesById = new Map(model.companies.map((company) => [company.id, company]));
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const record of model.records) result[record.companyId] = (result[record.companyId] ?? 0) + record.questions.length;
    return result;
  }, [model.records]);
  const refreshPopularity = () => setRank(Object.fromEntries([...model.records].sort((a, b) => archiveLikeCount(b, model.liked) - archiveLikeCount(a, model.liked) || b.order - a.order).map((record, index) => [record.id, index])));
  const changeFilter = <K extends keyof ArchiveFilters>(key: K, value: ArchiveFilters[K]) => {
    setFilters((previous) => ({ ...previous, [key]: value })); setLimit(6); refreshPopularity();
  };
  const filtered = filterArchiveRecords(model.records, filters).sort((a, b) => sort === "latest" ? b.order - a.order : (rank[a.id] ?? -1) - (rank[b.id] ?? -1) || b.order - a.order);
  const companyGroups = [...new Set(filtered.map((record) => record.companyId))].map((companyId) => {
    const records = filtered.filter((record) => record.companyId === companyId);
    return { companyId, companyType: records[0].companyType, questionCount: records.reduce((sum, record) => sum + record.questions.length, 0), latest: records.reduce((latest, record) => record.period > latest ? record.period : latest, "") };
  }).sort((a, b) => b.questionCount - a.questionCount || b.latest.localeCompare(a.latest));
  const selectedCompany = filters.companyId ? companiesById.get(filters.companyId) : undefined;
  const goList = () => { const next = new URLSearchParams(params); next.delete("view"); next.delete("record"); setParams(next); window.scrollTo({ top: 0, behavior: "auto" }); };
  const openForm = () => { const next = new URLSearchParams(params); next.set("view", "new"); next.delete("record"); setParams(next); window.scrollTo({ top: 0, behavior: "auto" }); };
  const rows: { label: string; key: "companyType" | "format" | "stage" | "role"; values: [string, string][] }[] = [
    { label: "유형", key: "companyType", values: [["all", "전체"], ["large", "대기업 SW"], ["service", "서비스 기업"], ["fintech", "금융 IT"]] },
    { label: "형식", key: "format", values: [["all", "전체"], ["qa", "일반 면접"], ["pt", "PT 면접"]] },
    { label: "단계", key: "stage", values: [["all", "전체"], ["tech", "기술"], ["exec", "인성"]] },
    { label: "직무", key: "role", values: [["all", "전체"], ...archiveRoles.map((role): [string, string] => [role, role])] },
  ];

  return (
    <main className="archive-page">
      <div className="wrap"><div className="archive-preview-notice"><strong>화면 미리보기</strong><span>질문과 회사 정보는 시안의 예시예요. 등록·하트·신고·삭제는 미리보기에서만 반영돼요. 마이페이지와 상태를 공유하고 새로고침하면 초기화돼요.</span></div></div>
      <div className="wrap narrow archive-preview-navigation"><Link to="/mypage/preview">내가 등록한 질문 미리보기 →</Link></div>
      {focusRecordId && !focusRecord && <p className="wrap narrow archive-record-missing" role="status">선택한 면접 기록을 찾지 못했어요. 아래 목록에서 다시 선택해 주세요.</p>}
      {formView ? <ArchiveForm companies={model.companies} records={model.records} remaining={model.remainingQuestions} onBack={goList} onSubmit={(submission) => {
        if (!model.addRecord(submission)) return false;
        setFilters(initialArchiveFilters); setSort("latest"); setMode("arc"); setQuery(""); setLimit(6); goList(); return true;
      }} /> : (
        <>
          <section className="hero"><div className="hero-bg"><div className="hero-glow" /></div><div className="wrap archive-hero-content">
            <h1>{"실제 면접에서 받은 질문".split(" ").map((word, index) => <span key={word}><span className="dv-w" style={{ animationDelay: `${0.05 + index * .08}s` }}>{word}</span>{" "}</span>)}</h1>
            <p className="dv-up dv-d1">지원자들이 직접 겪은 질문을 회사별로 모았어요. 마음에 드는 질문은 하트로 저장해 두고 면접 전에 다시 보세요.</p>
            <div className="stat">질문 <b>{model.records.reduce((sum, record) => sum + record.questions.length, 0)}</b>개, 회사 <b>{Object.keys(counts).length}</b>곳</div>
            <CompanySearch companies={model.companies} query={query} onQueryChange={setQuery} counts={counts} onSelect={(company) => { changeFilter("companyId", company.id); setQuery(""); setMode("arc"); }} />
            {selectedCompany && <div><span className="picked">{selectedCompany.display}{selectedCompany.name !== selectedCompany.display && <span className="picked-legal">{selectedCompany.name}</span>}<button type="button" aria-label="회사 선택 해제" onClick={() => changeFilter("companyId", null)}><X size={13} aria-hidden="true" /></button></span></div>}
          </div></section>
          <section className="archive-list-section"><div className="wrap narrow archive-list-content">
            <div className="panel filters">{rows.map((row) => <div className="frow" key={row.key} role="group" aria-label={`${row.label} 필터`}><span className="lb">{row.label}</span>{row.values.map(([value, label]) => <button type="button" className={`chip ${filters[row.key] === value ? "on" : ""}`} aria-pressed={filters[row.key] === value} key={value} onClick={() => {
              if (row.key === "companyType") changeFilter("companyType", value as ArchiveFilters["companyType"]);
              else if (row.key === "format") changeFilter("format", value as ArchiveFilters["format"]);
              else if (row.key === "stage") changeFilter("stage", value as ArchiveFilters["stage"]);
              else changeFilter("role", value);
            }}>{label}</button>)}</div>)}</div>
            <div className="archive-list-toolbar"><div className="archive-list-total"><span aria-live="polite">{mode === "arc" ? `면접 ${filtered.length}건, 질문 ${filtered.reduce((sum, record) => sum + record.questions.length, 0)}개` : `질문 많은 순으로 회사 ${companyGroups.length}곳`}</span>{mode === "arc" && <div className="seg" role="group" aria-label="정렬">{([['latest', '최신순'], ['popular', '인기순']] as const).map(([value, label]) => <button type="button" key={value} className={sort === value ? "on" : ""} aria-pressed={sort === value} onClick={() => { refreshPopularity(); setSort(value); setLimit(6); }}>{label}</button>)}</div>}</div><div className="seg" role="group" aria-label="목록 보기 방식">{([['arc', '면접별 보기'], ['co', '회사별 보기']] as const).map(([value, label]) => <button type="button" key={value} className={mode === value ? "on" : ""} aria-pressed={mode === value} onClick={() => { setMode(value); setLimit(6); }}>{label}</button>)}</div></div>
            {filtered.length === 0 ? <div className="empty-state"><h3>{selectedCompany ? `‘${selectedCompany.display}’에서 받은 질문은 아직 없어요` : "조건에 맞는 질문이 아직 없어요"}</h3><p>처음으로 공유해 보세요. 다음 지원자에게 가장 현실적인 준비 자료가 돼요.</p><button type="button" className="btn ink" onClick={openForm}><Plus size={17} aria-hidden="true" />질문 등록</button><button type="button" className="archive-reset" onClick={() => { setFilters(initialArchiveFilters); setQuery(""); setLimit(6); }}>필터 초기화</button></div>
              : mode === "arc" ? <><div className="list">{filtered.slice(0, limit).map((record) => <ArchiveCard key={record.id} record={record} defaultExpanded={record.id === focusRecordId} highlight={record.id === focusRecordId} company={companiesById.get(record.companyId)!} liked={model.liked} popular={sort === "popular"} onLike={model.toggleLike} onReport={() => { setDialog({ kind: "report", record }); setReason(""); }} onDelete={() => setDialog({ kind: "delete", record })} />)}</div>{filtered.length > limit ? <button type="button" className="btn ghost archive-more" onClick={() => setLimit((value) => value + 6)}>면접 더 보기</button> : limit > 6 && <p className="archive-last">마지막 면접이에요</p>}</>
              : <div className="cogrid">{companyGroups.map((group, index) => <button type="button" className={`cocard glow-${index % 3}`} key={group.companyId} onClick={() => { changeFilter("companyId", group.companyId); setMode("arc"); }}><span><span className="n">{companiesById.get(group.companyId)?.display}</span><span className="s">{archiveCompanyLabels[group.companyType]}, 최근 {group.latest.replace("-", ".")}</span></span><span className="c"><span>질문</span><b>{group.questionCount}</b><span>개</span></span></button>)}</div>}
          </div></section>
          <button type="button" className="fab" onClick={openForm}><Plus size={17} aria-hidden="true" />질문 등록</button>
        </>
      )}
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null); }}><DialogContent className="archive-dialog rounded-[28px] p-0 sm:max-w-[400px]" showCloseButton={false}><div className="archive-page archive-modal"><div className="sheet">
        <DialogTitle>{dialog?.kind === "delete" ? "이 면접 기록을 삭제할까요?" : "이 면접 기록을 신고할까요?"}</DialogTitle>
        <DialogDescription>{dialog?.kind === "delete" ? `같이 등록한 질문 ${dialog.record.questions.length}개가 모두 미리보기에서 사라지고 되돌릴 수 없어요.` : "사유를 골라 주세요. 같은 기록은 한 번만 신고할 수 있어요."}</DialogDescription>
        {dialog?.kind === "report" && <><div className="quote"><b>{companiesById.get(dialog.record.companyId)?.display}</b> {dialog.record.period.replace("-", ".")}<br />{dialog.record.questions[0]?.text}{dialog.record.questions.length > 1 && ` 외 ${dialog.record.questions.length - 1}개`}</div><div role="radiogroup" aria-label="신고 사유">{archiveReportReasons.map((item) => <label key={item.value} className={`reason ${reason === item.value ? "on" : ""}`}><input className="sr" type="radio" name="archive-report-reason" value={item.value} checked={reason === item.value} onChange={() => setReason(item.value)} /><span className="dot" aria-hidden="true" /><span><span className="t">{item.title}</span><span className="d">{item.description}</span></span></label>)}</div></>}
        <div className="acts"><button type="button" className="btn danger" disabled={dialog?.kind === "report" && !reason} onClick={() => { if (!dialog) return; if (dialog.kind === "delete") model.deleteRecord(dialog.record.id); else if (reason) model.reportRecord(dialog.record.id); setDialog(null); }}>{dialog?.kind === "delete" ? "삭제하기" : "신고하기"}</button><button type="button" className="btn ghost" onClick={() => setDialog(null)}>취소</button></div>
      </div></div></DialogContent></Dialog>
      {model.toast && <div className="toast" role="status">{model.toast}</div>}
    </main>
  );
}
