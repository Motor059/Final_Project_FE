export default function ReportPresentationSummary({ durationSeconds }: { durationSeconds?: number | null }) {
  const duration = typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds >= 0
    ? Math.floor(durationSeconds) : null;
  const durationLabel = duration === null ? "기록 없음"
    : `${Math.floor(duration / 60)}분 ${String(duration % 60).padStart(2, "0")}초`;

  return (
    <section aria-label="PT 발표 시간" className="mb-4 flex flex-col gap-5 rounded-[20px] border border-[#ECEBE8] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F6F6F4] text-[#78716C]"><PresentationWatch fraction={duration === null ? 0 : Math.min(1, duration / 300)} /></span>
        <div>
          <h2 className="text-[12px] font-medium text-[#8A857D]">발표 시간</h2>
          <p className="mt-1 text-[25px] font-semibold tracking-[-0.035em] text-[#1C1917] tabular-nums">{durationLabel}</p>
        </div>
      </div>
      <div className="w-full sm:max-w-[260px]">
        {duration !== null ? (
          <>
            <div className="mb-2 flex justify-between text-[11.5px] text-[#A8A29E]"><span>발표에 사용한 시간</span><span>최대 5분</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EFED]" aria-hidden="true"><div className="h-full rounded-full bg-[#78716C]" style={{ width: `${Math.min(100, duration / 300 * 100)}%` }} /></div>
            <p className="mt-2.5 text-[11px] leading-5 text-[#A8A29E]">시간은 발표 길이를 확인하는 참고 정보예요.</p>
          </>
        ) : (
          <p className="text-[12px] leading-6 text-[#A8A29E]">발표 시간이 기록되지 않았어요.</p>
        )}
      </div>
    </section>
  );
}

function PresentationWatch({ fraction }: { fraction: number }) {
  const circumference = 2 * Math.PI * 8.5;
  const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="10.2" y="1.6" width="3.6" height="2.2" rx="1.1" fill="#A8A29E" />
    <path d="M18.6 5.4l1.3-1.3" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="13.5" r="8.5" stroke="#E7E5E4" strokeWidth="2.2" />
    <circle cx="12" cy="13.5" r="8.5" stroke="#57534E" strokeWidth="2.2" strokeLinecap="round" strokeDasharray={`${circumference * fraction} ${circumference}`} transform="rotate(-90 12 13.5)" />
    <path d={`M12 13.5L${12 + Math.cos(angle) * 5.2} ${13.5 + Math.sin(angle) * 5.2}`} stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="13.5" r="1.6" fill="#1C1917" />
  </svg>;
}
