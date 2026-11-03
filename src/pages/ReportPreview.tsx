import { useSearchParams } from "react-router-dom";
import Header from "@/components/common/Header";
import ReportContent from "@/components/report/ReportContent";
import { Button } from "@/components/ui/button";
import { createReportPreview } from "@/lib/reportPreviewData";

export default function ReportPreview() {
  const [params, setParams] = useSearchParams();
  const kind = params.get("type") === "repo" ? "REPO" : "PT";
  const missingDetails = params.get("missing") === "1";
  const { data, details } = createReportPreview(kind, missingDetails);
  const selectKind = (value: "pt" | "repo") => {
    const next = new URLSearchParams(params);
    next.set("type", value);
    setParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-14">
      <Header />
      <main className="mx-auto max-w-[780px] px-5 pt-[132px] md:pt-[112px]">
        <section aria-label="리포트 미리보기 설정" className="mb-7 rounded-[20px] border border-[#E7E5E4] bg-white p-5">
          <span className="inline-flex rounded-md bg-[#F6F6F4] px-2 py-1 text-[11px] font-semibold text-[#78716C]">화면 미리보기</span>
          <h2 className="mt-3 text-[17px] font-semibold text-[#1C1917]">결과 리포트 미리보기</h2>
          <p className="mt-2 text-[12.5px] leading-6 text-[#8A857D]">점수와 내용은 예시예요. 실제 결과를 조회하거나 히스토리에 저장하지 않아요.</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="미리볼 리포트 유형">
            <Button type="button" variant={kind === "PT" ? "default" : "outline"} className="h-9 rounded-lg px-4 text-[12px]" aria-pressed={kind === "PT"} onClick={() => selectKind("pt")}>PT 리포트</Button>
            <Button type="button" variant={kind === "REPO" ? "default" : "outline"} className="h-9 rounded-lg px-4 text-[12px]" aria-pressed={kind === "REPO"} onClick={() => selectKind("repo")}>레포 질문 리포트</Button>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-[12px] text-[#8A857D]">
            <input type="checkbox" className="h-3.5 w-3.5 accent-[#44403C]" checked={missingDetails} onChange={(event) => {
              const next = new URLSearchParams(params);
              if (event.target.checked) next.set("missing", "1");
              else next.delete("missing");
              setParams(next, { replace: true });
            }} />
            {kind === "PT" ? "발표 시간 정보가 없는 경우 보기" : "근거 파일 경로가 없는 경우 보기"}
          </label>
        </section>
        <ReportContent key={kind} data={data} details={details} expandFirstCard />
      </main>
    </div>
  );
}
