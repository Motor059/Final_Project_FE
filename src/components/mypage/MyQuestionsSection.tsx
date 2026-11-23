import { useId } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Heart } from "lucide-react";
import { archiveCompanyLabels } from "@/lib/archiveDisplay";
import { useArchivePreviewStore } from "@/store/useArchivePreviewStore";

export default function MyQuestionsSection() {
  const titleId = useId();
  const records = useArchivePreviewStore((state) => state.records);
  const companies = useArchivePreviewStore((state) => state.companies);
  const liked = useArchivePreviewStore((state) => state.liked);
  const myRecords = records.filter((record) => record.mine).sort((a, b) => b.order - a.order);
  const companiesById = new Map(companies.map((company) => [company.id, company]));
  const questionCount = myRecords.reduce((count, record) => count + record.questions.length, 0);

  return (
    <section className="member-questions-section my-12" aria-labelledby={titleId}>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="text-[16px] font-bold tracking-[-0.01em] text-[#0A0A0A]">내가 등록한 질문 <span className="member-question-count">{questionCount}개</span></h2>
        <Link to="/archive" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#78716C] hover:text-black">기출 질문 보기<ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
      <p className="mb-4 text-[12.5px] leading-6 text-[#8A857D]">다른 지원자가 하트로 저장한 수를 볼 수 있어요.</p>
      {myRecords.length ? <div className="member-question-list">
        {myRecords.map((record) => <Link key={record.id} to={`/archive?record=${encodeURIComponent(record.id)}`} className="member-question-card">
          <div className="member-question-header">
            <div className="member-question-meta">
              <strong>{companiesById.get(record.companyId)?.display ?? "회사 정보 없음"}</strong>
              <span className="member-question-company-type">{archiveCompanyLabels[record.companyType]}</span>
              {record.format === "pt" && <span className="member-question-badge is-pt">PT 면접</span>}
              <span className="member-question-badge">{record.stage === "tech" ? "기술" : "인성"}</span>
              {record.role && <span className="member-question-badge">{record.role}</span>}
              <span className="member-question-badge is-owner">내 면접</span>
            </div>
            <span className="member-question-date"><time dateTime={record.period}>{record.period.replaceAll("-", ".")}</time><ArrowUpRight size={15} aria-hidden="true" /></span>
          </div>
          <p className="member-question-caption">받은 질문 {record.questions.length}개</p>
          <ol className="member-question-items">
            {record.questions.map((question, index) => <li key={question.id}>
              <span className="member-question-number" aria-hidden="true">{index + 1}</span>
              <span className="member-question-text">{question.text}</span>
              <span className="member-question-likes"><Heart size={17} aria-hidden="true" /><span className="sr-only">하트 </span><span>{question.likes + Number(!!liked[question.id])}</span></span>
            </li>)}
          </ol>
        </Link>)}
      </div> : <div className="member-empty-state">
        <p>아직 등록한 질문이 없어요.</p>
        <p className="member-empty-caption">직접 받은 질문을 공유하면 이곳에서 다시 볼 수 있어요.</p>
        <Link to="/archive?view=new" className="member-button member-button--primary member-question-create">질문 등록하기<ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>}
    </section>
  );
}
