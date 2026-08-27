export interface InterviewHistoryItem {
  id: number;
  date: string;
  company: string;
  role: string;
  stage: string;
  score?: number;
}

interface HistoryListProps {
  items: InterviewHistoryItem[];
  onSelect: (id: number) => void;
}

export default function HistoryList({
  items,
  onSelect,
}: HistoryListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
        <p className="text-[14px] font-medium text-foreground">
          아직 저장된 면접 기록이 없어요.
        </p>

        <p className="mt-2 text-[12.5px] text-muted-foreground">
          모의면접을 완료하면 이곳에서 다시 확인할 수 있어요.
        </p>
      </section>
    );
  }

  return (
    <section>
      <p className="mb-3 text-[13px] font-semibold text-muted-foreground">
        지난 면접
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={[
              "flex w-full items-center justify-between gap-5 px-5 py-5 text-left",
              "transition-colors hover:bg-muted/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              index !== items.length - 1
                ? "border-b border-border"
                : "",
            ].join(" ")}
          >
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-muted-foreground">
                {item.date}
              </p>

              <p className="mt-1.5 truncate text-[15px] font-semibold text-foreground">
                {item.company} · {item.role}
              </p>

              <p className="mt-1 text-[12.5px] text-muted-foreground">
                {item.stage}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="text-right">
                <p className="text-[11.5px] font-medium text-muted-foreground">
                  종합 점수
                </p>

                <p className="mt-1 text-[22px] font-semibold leading-none text-foreground">
                   {item.score ?? "-"}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="text-[18px] text-muted-foreground"
              >
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}