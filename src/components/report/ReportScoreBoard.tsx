import type { RadarAxis, ScoreBreakdown } from '@/types/report';
import ScoreChart from '@/components/report/ScoreChart';
import { interviewStageLabel, scoreColor, scoreText, scoreValue } from '@/lib/reportDisplay';

interface ReportScoreBoardProps {
  totalScore?: number | null;
  verdict: string;
  chartData: RadarAxis[];
  radarType?: string;
  analysisLabel?: string;
  isPT?: boolean;
  scoreBreakdown?: ScoreBreakdown | null;
}

export default function ReportScoreBoard({ totalScore, verdict, chartData, radarType, analysisLabel, isPT = false, scoreBreakdown }: ReportScoreBoardProps) {
  
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-4 mb-4">
      {/* 종합 점수 카드 */}
      <div className="border border-[#F0EFED] rounded-[20px] p-[30px] flex flex-col justify-center bg-white shadow-sm">
        <div className="text-[12.5px] text-[#A8A29E] font-semibold mb-2">
          종합 점수
        </div>
        <div className="flex items-baseline gap-[5px] mb-4">
          <span className="text-[64px] font-semibold tracking-[-0.04em] leading-[0.9] text-[#1C1917]">
            {scoreText(totalScore)}
          </span>
          <span className="text-[22px] text-[#A8A29E] font-medium">점</span>
        </div>
        {isPT && scoreBreakdown && <div className="mb-4 flex flex-col gap-2" aria-label="종합 점수 구성">
          <BreakdownRow label="발표" weight={scoreBreakdown.presentationWeight} value={scoreBreakdown.presentation} />
          <BreakdownRow label="질의응답" weight={scoreBreakdown.qaWeight} value={scoreBreakdown.qaAverage} />
          <p className="-mt-1 text-[11px] leading-5 text-[#A8A29E]">질의응답이 실제 면접 당락을 더 좌우해서 70%로 반영해요.</p>
        </div>}
        <p className="text-[14.5px] leading-[1.55] text-[#44403C] m-0">
          {verdict}
        </p>
      </div>

      {/* 항목별 분석 (방사형 차트) 카드 */}
      <div className="border border-[#F0EFED] rounded-[20px] p-[24px] bg-white shadow-sm flex flex-col">
        <div className="text-[12.5px] text-[#A8A29E] font-semibold text-center mb-[6px]">
          항목별 분석 · {analysisLabel ?? interviewStageLabel(radarType)}
        </div>
        
        {/* ScoreChart 컴포넌트 적용 */}
        <div className="w-full min-w-0">
          <ScoreChart data={chartData} isPT={isPT} />
        </div>
      </div>
    </section>
  );
}

function BreakdownRow({ label, weight, value }: { label: string; weight: number; value: number | null }) {
  return <div className="grid grid-cols-[88px_1fr_32px] items-center gap-3 text-[12px]">
    <span className="text-[#78716C]">{label} <span className="text-[#A8A29E]">{scoreText(weight)}%</span></span>
    <span className="h-1.5 overflow-hidden rounded-full bg-[#F0EFED]" aria-hidden="true"><span className="block h-full rounded-full bg-[#78716C]" style={{ width: `${scoreValue(value) ?? 0}%` }} /></span>
    <span className="text-right font-semibold tabular-nums" style={{ color: scoreColor(value) }}>{scoreText(value)}</span>
  </div>;
}
