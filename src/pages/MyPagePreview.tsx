import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/common/Header";
import MyQuestionsSection from "@/components/mypage/MyQuestionsSection";
import useArchivePreview from "@/hooks/useArchivePreview";

export default function MyPagePreview() {
  const model = useArchivePreview();
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <div className="min-h-screen bg-white pb-12 pt-[132px]">
      <Header />
      <main className="mx-auto w-full max-w-[760px] px-5 md:px-8">
        <section className="mb-8 rounded-[20px] border border-[#ECEBE8] bg-[#FAFAF9] p-5">
          <span className="text-[11px] font-semibold text-[#8A857D]">화면 미리보기</span>
          <p className="mt-2 text-[13px] leading-6 text-[#78716C]">예시 질문과 미리보기에서 등록한 질문을 표시해요. 아카이브와 상태를 공유하며, 새로고침하거나 로그인 계정이 바뀌면 초기화돼요.</p>
          <label className="mt-3 flex items-center gap-2 text-[12px] text-[#8A857D]"><input type="checkbox" checked={showEmpty} onChange={(event) => setShowEmpty(event.target.checked)} className="accent-black" />빈 목록 보기</label>
        </section>
        <h1 className="mb-8 text-[30px] font-bold tracking-[-0.03em] text-[#0A0A0A]">내 정보와 활동</h1>
        <div className="mb-12 flex items-center gap-4 rounded-[20px] border border-[#ECEBE8] p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">예</span><div><p className="text-[12px] text-[#8A857D]">닉네임 · 예시</p><p className="mt-1 text-[19px] font-semibold">미리보기 사용자</p></div>
        </div>
        <MyQuestionsSection records={showEmpty ? [] : model.records} companies={model.companies} liked={model.liked} preview archivePath="/archive/preview" onDelete={model.deleteRecord} />
        {model.toast && <p className="mb-4 text-[13px] text-[#78716C]" role="status">{model.toast}</p>}
        <Link to="/archive/preview?view=new" className="inline-flex rounded-full bg-black px-5 py-3 text-[13px] font-semibold text-white">기출 질문 미리보기에서 등록하기</Link>
      </main>
    </div>
  );
}
