interface AccountSectionProps { onLogout: () => void; onWithdraw: () => void; }

export default function AccountSection({ onLogout, onWithdraw }: AccountSectionProps) {
  return <section aria-labelledby="member-account-title">
    <h2 id="member-account-title" className="member-section-eyebrow">계정</h2>
    <div className="member-account-card">
      <button type="button" onClick={onLogout} className="member-account-row"><span>로그아웃</span><span aria-hidden="true">→</span></button>
      <button type="button" onClick={onWithdraw} className="member-account-row is-danger"><span>회원 탈퇴</span><span aria-hidden="true">→</span></button>
    </div>
  </section>;
}
