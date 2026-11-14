import { useId } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function MyQuestionsSection() {
  const titleId = useId();

  return (
    <section className="member-questions-section my-12" aria-labelledby={titleId}>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="text-[16px] font-bold tracking-[-0.01em] text-[#0A0A0A]">내가 등록한 질문</h2>
        <Link to="/archive" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#78716C] hover:text-black">기출 질문 보기<ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
      <p className="mb-4 text-[12.5px] leading-6 text-[#8A857D]">다른 지원자가 하트로 저장한 수를 볼 수 있어요.</p>
      <div className="rounded-[20px] bg-[#F6F6F4] px-5 py-7 text-center text-[13px] leading-6 text-[#78716C]">
        <p>등록한 질문 목록을 준비하고 있어요.</p>
      </div>
    </section>
  );
}
