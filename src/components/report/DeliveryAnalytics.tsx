import type { DeliveryInfo } from '@/types/report';

interface DeliveryAnalyticsProps {
  data?: DeliveryInfo | null;
}

export default function DeliveryAnalytics({ data }: DeliveryAnalyticsProps) {
  const isSpeedNull = !data || data.speechSpeed === null;
  const isFillerNull = !data || data.fillerWordCount === null;

  return (
    <div className="mt-8">
      <div className="text-[13px] font-semibold text-[#78716C] mb-[12px]">전달력 분석</div>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
        
        {/* 말하기 속도 카드 */}
        <div className="border border-[#F0EFED] rounded-[16px] p-[20px_22px] bg-white">
          <div className="text-[12.5px] text-[#A8A29E] font-semibold mb-[8px]">말하기 속도</div>
          <div className="text-[20px] font-semibold text-[#1C1917] tracking-[-0.01em]">
            {isSpeedNull ? "데이터 없음" : data.speechSpeed}
          </div>
          <div className="text-[12.5px] text-[#78716C] mt-[5px]">
            {isSpeedNull 
              ? "아직 말하기 속도 분석이 제공되지 않습니다." 
              : data.speechSpeedNote}
          </div>
        </div>

        {/* 필러워드 카드 */}
        <div className="border border-[#F0EFED] rounded-[16px] p-[20px_22px] bg-white">
          <div className="text-[12.5px] text-[#A8A29E] font-semibold mb-[8px]">필러워드</div>
          <div className="text-[20px] font-semibold text-[#1C1917] tracking-[-0.01em]">
            {isFillerNull ? "데이터 없음" : `${data.fillerWordCount}회`}
          </div>
          <div className="text-[12.5px] text-[#78716C] mt-[5px]">
            {isFillerNull 
              ? "아직 필러워드 분석이 제공되지 않습니다." 
              : data.fillerWordNote}
          </div>
        </div>
        
      </section>
    </div>
  );
}