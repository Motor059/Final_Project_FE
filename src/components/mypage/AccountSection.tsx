interface AccountSectionProps {
  onLogout: () => void;
}

export default function AccountSection({
  onLogout,
}: AccountSectionProps) {
  return (
    <section>
      <p className="mb-3 text-[13px] font-semibold text-muted-foreground">
        계정
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted"
        >
          <span className="text-[14px] font-medium text-foreground">
            로그아웃
          </span>

          <span
            aria-hidden="true"
            className="text-[15px] text-muted-foreground"
          >
            →
          </span>
        </button>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-[14px] text-muted-foreground">
            회원 탈퇴
          </span>

          <span className="rounded-lg bg-muted px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">
            준비 중
          </span>
        </div>
      </div>
    </section>
  );
}