interface HistorySummaryProps {
  totalSessions: number;
  weekSessions: number;
}

export default function HistorySummary({
  totalSessions,
  weekSessions,
}: HistorySummaryProps) {
  const summaryItems = [
    {
      label: "총 연습 횟수",
      value: totalSessions,
    },
    {
      label: "이번 주",
      value: weekSessions,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-background px-6 py-6"
        >
          <p className="text-[12.5px] font-semibold text-muted-foreground">
            {item.label}
          </p>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {item.value}
            </span>

            <span className="text-[15px] font-medium text-muted-foreground">
              회
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}