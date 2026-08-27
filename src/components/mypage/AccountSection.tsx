interface AccountSectionProps {
  onLogout: () => void;
  onWithdraw: () => void;
}

export default function AccountSection({
  onLogout,
  onWithdraw,
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

        <button
          type="button"
          onClick={onWithdraw}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted"
        >
          <span className="text-[14px] font-medium text-destructive">
            회원 탈퇴
          </span>

          <span
            aria-hidden="true"
            className="text-[15px] text-muted-foreground"
          >
            →
          </span>
        </button>
      </div>
    </section>
  );
}