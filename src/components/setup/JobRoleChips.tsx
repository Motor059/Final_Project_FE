interface JobRoleChipsProps {
  value: string;
  onChange: (value: string) => void;
}

const JOB_ROLES = [
  "백엔드",
  "프론트엔드",
  "풀스택",
  "데이터",
  "AI/ML",
  "DevOps",
];

export default function JobRoleChips({
  value,
  onChange,
}: JobRoleChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {JOB_ROLES.map((role) => {
        const selected = value === role;

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            aria-pressed={selected}
            className={[
              "rounded-full border px-3 py-1.5 text-[12px] font-medium",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}