import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { RadarAxis } from '@/types/report';

interface ScoreChartProps {
  data: RadarAxis[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
  // 라벨과 점수를 위아래로 배치하는 커스텀 라벨 함수
  const renderCustomTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    const dataItem = data.find(item => item.label === payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        {/* 항목 이름 (회색, 얇게) */}
        <text textAnchor={textAnchor} fill="#78716C" fontSize={11} fontWeight={500} dy={-2}>
          {payload.value}
        </text>
        {/* 점수 (검은색, 진하게) */}
        <text textAnchor={textAnchor} fill="#1C1917" fontSize={13} fontWeight={700} dy={14}>
          {dataItem?.score}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
        <PolarGrid gridType="polygon" stroke="#E7E5E4" />
        <PolarAngleAxis 
          dataKey="label" 
          tick={renderCustomTick}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#1C1917"
          strokeWidth={1.8}
          fill="rgba(10, 10, 10, 0.05)"
          fillOpacity={1}
          dot={{ r: 3, fill: '#1C1917', strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}