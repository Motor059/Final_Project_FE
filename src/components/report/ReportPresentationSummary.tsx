import { Clock3 } from "lucide-react";

export default function ReportPresentationSummary({ durationSeconds }: { durationSeconds?: number | null }) {
  const duration = typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds >= 0
    ? Math.floor(durationSeconds) : null;
  const durationLabel = duration === null ? "기록 없음"
    : `${Math.floor(duration / 60)}분 ${String(duration % 60).padStart(2, "0")}초`;

  return (
    <section aria-label="PT 발표 시간" className="mb-4 flex flex-col gap-5 rounded-[20px] border border-[#ECEBE8] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F6F6F4] text-[#78716C]"><Clock3 size={20} aria-hidden="true" /></span>
        <div>
          <h2 className="text-[12px] font-medium text-[#8A857D]">발표 시간</h2>
          <p className="mt-1 text-[25px] font-semibold tracking-[-0.035em] text-[#1C1917] tabular-nums">{durationLabel}</p>
        </div>
      </div>
      <div className="w-full sm:max-w-[260px]">
        {duration !== null ? (
          <>
            <div className="mb-2 flex justify-between text-[11.5px] text-[#A8A29E]"><span>발표에 사용한 시간</span><span>최대 8분</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EFED]" aria-hidden="true"><div className="h-full rounded-full bg-[#78716C]" style={{ width: `${Math.min(100, duration / 480 * 100)}%` }} /></div>
            <p className="mt-2.5 text-[11px] leading-5 text-[#A8A29E]">시간은 발표 길이를 확인하는 참고 정보예요.</p>
          </>
        ) : (
          <p className="text-[12px] leading-6 text-[#A8A29E]">발표 시간이 기록되지 않았어요.</p>
        )}
      </div>
    </section>
  );
}
