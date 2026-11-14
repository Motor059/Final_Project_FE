import AnimatedCount from "@/components/common/AnimatedCount";

interface HistorySummaryProps { totalSessions: number; weekSessions: number; }

export default function HistorySummary({ totalSessions, weekSessions }: HistorySummaryProps) {
  return <section className="member-history-summary" aria-label="면접 연습 현황">
    {[{ label: "총 연습 횟수", value: totalSessions }, { label: "이번 주", value: weekSessions }].map((item) => <div key={item.label} className="member-history-stat">
      <p>{item.label}</p><div className="member-history-value"><strong><AnimatedCount value={item.value} /></strong><span>회</span></div>
    </div>)}
  </section>;
}
