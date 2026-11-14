import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { RadarAxis } from '@/types/report';
import { axisLabel, scoreColor, scoreText, scoreValue } from '@/lib/reportDisplay';

const ptAxisLabels: Record<string, string> = { STRUCTURE: '구조·논리 전개', RELEVANCE: '과제 적합성', EVIDENCE: '근거·구체성', DEPTH: '이해 깊이·실행 가능성', DELIVERY: '전달력·설득력', CONSISTENCY: '일관성' };

export default function ScoreChart({ data, isPT = false }: { data: RadarAxis[]; isPT?: boolean }) {
  const chartData = data.map((item, index) => ({
    ...item,
    number: index + 1,
    label: isPT && !/[가-힣]/.test(item.label) ? ptAxisLabels[item.axis] ?? axisLabel(item.axis, item.label) : axisLabel(item.axis, item.label, `평가 항목 ${index + 1}`),
    score: scoreValue(item.score),
  }));
  const hasAllScores = chartData.length >= 3 && chartData.every((item) => item.score !== null);
  if (!chartData.length) return <p className="py-10 text-center text-sm text-[#78716C]">항목별 점수가 제공되지 않았습니다.</p>;

  return (
    <div>
      <div className="h-[240px] w-full flex items-center justify-center" aria-hidden="true">
        {isPT ? <PTRadar axes={chartData} hasAllScores={hasAllScores} /> :
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid gridType="polygon" stroke="#E7E5E4" />
            <PolarAngleAxis dataKey="number" tick={{ fill: '#57534E', fontSize: 12 }} tickLine={false} />
            <PolarRadiusAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={false} axisLine={false} />
            {hasAllScores && <Radar name="점수" dataKey="score" stroke="#1C1917" strokeWidth={1.8}
              fill="#0A0A0A" fillOpacity={0.05} dot={{ r: 3, fill: '#1C1917', strokeWidth: 0 }} isAnimationActive={false} />}
          </RadarChart>
        </ResponsiveContainer>}
      </div>
      <p className="mb-3 text-center text-[11px] text-[#A8A29E]">모든 항목은 100점 기준입니다.{isPT ? ' 발표 카드만으로 그려요.' : ''}</p>
      {!hasAllScores && <p className="mb-3 text-center text-xs text-[#78716C]">항목별 점수가 모두 제공되면 그래프가 표시됩니다.</p>}
      <ol className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {chartData.map((item) => (
          <li key={`${item.axis}-${item.number}`} className="flex min-w-0 items-start gap-2 text-[12px]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F5F4] text-[10px] text-[#57534E]">{item.number}</span>
            <span className="min-w-0 flex-1 break-words leading-5 text-[#78716C]">{item.label}</span>
            <span className="shrink-0 font-semibold leading-5" style={{ color: scoreColor(item.score) }}>{scoreText(item.score)}<span className="sr-only">점</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PTRadar({ axes, hasAllScores }: { axes: RadarAxis[]; hasAllScores: boolean }) {
  const point = (index: number, radius: number): [number, number] => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / axes.length;
    return [150 + Math.cos(angle) * radius, 118 + Math.sin(angle) * radius];
  };
  const showPlot = hasAllScores && axes.some((axis) => (axis.score ?? 0) > 0);
  return <svg viewBox="0 0 300 236" className="h-full max-w-full" aria-hidden="true">
    {[.2, .4, .6, .8, 1].map((ratio) => <polygon key={ratio} points={axes.map((_, index) => point(index, 88 * ratio).join(',')).join(' ')} fill="none" stroke="#E7E5E4" />)}
    {axes.map((_, index) => {
      const [x, y] = point(index, 88);
      const [labelX, labelY] = point(index, 102);
      return <g key={index}><line x1={150} y1={118} x2={x} y2={y} stroke="#E7E5E4" /><text x={labelX} y={labelY + 4} textAnchor="middle" fontSize={12} fill="#57534E">{index + 1}</text></g>;
    })}
    {showPlot && <>
      <polygon points={axes.map((axis, index) => point(index, 88 * (axis.score ?? 0) / 100).join(',')).join(' ')} fill="#0A0A0A" fillOpacity={.05} stroke="#1C1917" strokeWidth={1.8} />
      {axes.map((axis, index) => {
        const [x, y] = point(index, 88 * (axis.score ?? 0) / 100);
        return <circle key={index} cx={x} cy={y} r={3} fill="#1C1917" />;
      })}
    </>}
  </svg>;
}
