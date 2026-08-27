import type { RadarAxis } from '@/types/report';
import ScoreChart from '@/components/report/ScoreChart';

interface ReportScoreBoardProps {
  totalScore: number;
  verdict: string;
  chartData: RadarAxis[];
  radarType?: string;
}

export default function ReportScoreBoard({ totalScore, verdict, chartData, radarType }: ReportScoreBoardProps) {
  
  const getRadarTitle = (type?: string) => {
    if (type === 'PERSONALITY') return '인성 면접';
    if (type === 'FINANCE_TECHNICAL') return '금융 IT 면접';
    return '기술 면접'; // 기본값 (TECHNICAL 등)
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-4 mb-4">
      {/* 종합 점수 카드 */}
      <div className="border border-[#F0EFED] rounded-[20px] p-[30px] flex flex-col justify-center bg-white shadow-sm">
        <div className="text-[12.5px] text-[#A8A29E] font-semibold mb-2">
          종합 점수
        </div>
        <div className="flex items-baseline gap-[5px] mb-4">
          <span className="text-[64px] font-semibold tracking-[-0.04em] leading-[0.9] text-[#1C1917]">
            {totalScore}
          </span>
          <span className="text-[22px] text-[#A8A29E] font-medium">점</span>
        </div>
        <p className="text-[14.5px] leading-[1.55] text-[#44403C] m-0">
          {verdict}
        </p>
      </div>

      {/* 항목별 분석 (방사형 차트) 카드 */}
      <div className="border border-[#F0EFED] rounded-[20px] p-[24px] bg-white shadow-sm flex flex-col">
        <div className="text-[12.5px] text-[#A8A29E] font-semibold text-center mb-[6px]">
          항목별 분석 · {getRadarTitle(radarType)}
        </div>
        
        {/* ScoreChart 컴포넌트 적용 */}
        <div className="flex-1 w-full min-h-[220px]">
          <ScoreChart data={chartData} />
        </div>
      </div>
    </section>
  );
}