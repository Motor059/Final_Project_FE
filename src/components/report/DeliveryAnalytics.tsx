import type { DeliveryInfo } from '@/types/report';

interface DeliveryAnalyticsProps {
  data: DeliveryInfo;
}

export default function DeliveryAnalytics({ data }: DeliveryAnalyticsProps) {
  return (
    <div className="mt-8">
      <div className="text-[13px] font-semibold text-[#78716C] mb-[12px]">전달력 분석</div>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
        <div className="border border-[#F0EFED] rounded-[16px] p-[20px] bg-white">
          <div className="text-[12.5px] text-[#A8A29E] font-semibold mb-[8px]">말하기 속도</div>
          <div className="text-[20px] font-semibold text-[#1C1917] tracking-[-0.01em]">
            {data.speechSpeed ? data.speechSpeed : "데이터 없음"}
          </div>
          <div className="text-[12.5px] text-[#78716C] mt-[5px]">
            {data.speechSpeedNote || "아직 말하기 속도 분석이 제공되지 않습니다."}
          </div>
        </div>

        <div className="border border-[#F0EFED] rounded-[16px] p-[20px] bg-white">
          <div className="text-[12.5px] text-[#A8A29E] font-semibold mb-[8px]">필러워드</div>
          <div className="text-[20px] font-semibold text-[#1C1917] tracking-[-0.01em]">
            {data.fillerWordCount !== null ? `${data.fillerWordCount}회` : "데이터 없음"}
          </div>
          <div className="text-[12.5px] text-[#78716C] mt-[5px]">
            {data.fillerWordNote || "아직 필러워드 분석이 제공되지 않습니다."}
          </div>
        </div>
      </section>
    </div>
  );
}