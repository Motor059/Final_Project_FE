import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ArchiveCompany, ArchiveRecord } from "@/types/archive";

interface MyQuestionsSectionProps {
  records?: ArchiveRecord[];
  companies?: ArchiveCompany[];
  liked?: Record<string, boolean>;
  preview?: boolean;
  archivePath?: string;
  onDelete?: (id: string) => void;
}
export default function MyQuestionsSection({ records = [], companies = [], liked = {}, preview = false, archivePath = "/archive", onDelete }: MyQuestionsSectionProps) {
  const [deleting, setDeleting] = useState<ArchiveRecord | null>(null);
  const titleId = useId();
  const mine = records.filter((record) => record.mine).sort((a, b) => b.order - a.order);
  const questionCount = mine.reduce((sum, record) => sum + record.questions.length, 0);
  const companiesById = new Map(companies.map((company) => [company.id, company]));

  return (
    <section className="my-12" aria-labelledby={titleId}>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="text-[16px] font-bold tracking-[-0.01em] text-[#0A0A0A]">내가 등록한 질문 {preview && <span className="ml-1 text-[14px] font-medium text-[#A8A29E]">{questionCount}개</span>}</h2>
        <Link to={archivePath} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#78716C] hover:text-black">기출 질문 보기<ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
      <p className="mb-4 text-[12.5px] leading-6 text-[#8A857D]">다른 지원자가 하트로 저장한 수를 볼 수 있어요.</p>
      {!preview ? (
        <div className="rounded-[20px] bg-[#F6F6F4] px-5 py-7 text-center text-[13px] leading-6 text-[#78716C]">
          <p>등록한 질문 목록을 준비하고 있어요.</p>
          {import.meta.env.DEV && <Link to="/mypage/preview" className="mt-2 inline-block underline underline-offset-4">내 질문 화면 미리보기</Link>}
        </div>
      ) : mine.length === 0 ? (
        <div className="rounded-[20px] bg-[#F6F6F4] px-5 py-7 text-center">
          <p className="text-[14px] text-[#57534E]">아직 등록한 질문이 없어요.</p>
          <Link to={`${archivePath}?view=new`} className="mt-4 inline-block rounded-full bg-[#0A0A0A] px-5 py-2.5 text-[12.5px] font-semibold text-white">받은 질문 공유하기</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {mine.map((record) => <article key={record.id} className="overflow-hidden rounded-[20px] border border-[#ECEBE8] bg-white">
            <div className="flex flex-wrap items-center gap-2 px-5 pb-1 pt-5 text-[11.5px] text-[#A8A29E]">
              <strong className="text-[14px] font-semibold text-[#0A0A0A]">{companiesById.get(record.companyId)?.display || "회사 미지정"}</strong>
              {record.format === "pt" && <span className="rounded-md border border-[#E7E5E4] px-2 py-0.5 font-semibold text-[#57534E]">PT</span>}
              <span className="rounded-md bg-[#F4F3F1] px-2 py-0.5 font-semibold text-[#57534E]">{record.stage === "tech" ? "기술" : "인성"}</span>
              {record.role && <span>{record.role}</span>}<span>{record.period.replace("-", ".")}</span>
            </div>
            <ul className="divide-y divide-[#F4F3F1] px-5">
              {record.questions.map((question) => <li key={question.id} className="flex flex-col items-start gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                <Link to={`${archivePath}?record=${encodeURIComponent(record.id)}`} className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[14px] font-medium leading-6 text-[#44403C] hover:text-black">{question.text}</Link>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[#E11D48]"><Heart size={14} fill="currentColor" aria-hidden="true" />{question.likes + Number(!!liked[question.id])}명 저장</span>
              </li>)}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F4F3F1] px-5 py-3 text-[12px]">
              <Link to={`${archivePath}?record=${encodeURIComponent(record.id)}`} className="text-[#8A857D] underline underline-offset-4">함께 등록한 질문 {record.questions.length}개 보기</Link>
              {onDelete && <button type="button" onClick={() => setDeleting(record)} className="text-[#9F1239] hover:underline">면접 기록 삭제</button>}
            </div>
          </article>)}
        </div>
      )}
      <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <DialogContent className="rounded-[24px] p-6 sm:max-w-[400px]" showCloseButton={false}>
          <DialogTitle className="text-[20px] font-semibold leading-7">이 면접 기록을 삭제할까요?</DialogTitle>
          <DialogDescription className="text-[14px] leading-7">함께 등록한 질문 {deleting?.questions.length ?? 0}개가 미리보기에서 삭제돼요. 아카이브 목록에도 함께 반영돼요.</DialogDescription>
          <div className="mt-2 flex flex-col gap-2"><button type="button" className="rounded-xl bg-[#9F1239] px-4 py-3 text-[14px] font-semibold text-white" onClick={() => { if (deleting) onDelete?.(deleting.id); setDeleting(null); }}>삭제하기</button><button type="button" className="rounded-xl border border-[#E7E5E4] px-4 py-3 text-[14px]" onClick={() => setDeleting(null)}>취소</button></div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
