interface SelectionCardProps {
  title: string;
  description?: string;
  detail?: string;
  selected: boolean;
  onClick: () => void;
}

export default function SelectionCard({
  title,
  description,
  detail,
  selected,
  onClick,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "w-full rounded-xl border px-[18px] py-[18px] text-left",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-foreground/30",
      ].join(" ")}
    >
      <div className="text-[15px] font-semibold">{title}</div>

      {description && (
        <div
          className={[
            "mt-1.5 text-[13px]",
            selected
              ? "text-primary-foreground/60"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {description}
        </div>
      )}

      {detail && (
        <div
          className={[
            "mt-3 text-[12.5px]",
            selected
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {detail}
        </div>
      )}
    </button>
  );
}