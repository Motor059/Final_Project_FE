import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useInterviewStore } from "@/store/useInterviewStore";
import { useAlertStore } from "@/store/useAlertStore";
import { startKakaoLogin } from "@/lib/authRedirect";
import { reportSessionId } from "@/lib/reportNavigation";
import type { ReportResponseData } from "@/types/report";
import "@/components/common/header.css";

const navigation = [
  { path: "/setup", label: "모의면접 시작" },
  { path: "/archive", label: "기출 질문" },
  { path: "/history", label: "히스토리" },
];

export default function Header({ reportForLogin, focusLabel, onExit, exitDisabled = false }: { reportForLogin?: ReportResponseData; focusLabel?: string; onExit?: () => void; exitDisabled?: boolean } = {}) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", update);
    };
  }, [location.pathname]);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const fetchUserInfo = useAuthStore((state) => state.fetchUserInfo);
  const showAlert = useAlertStore((state) => state.showAlert);
  const profileName = user?.nickname?.trim() ?? "";
  const profileInitial = Array.from(profileName)[0];

  useEffect(() => {
    if (!isLoggedIn || user) return;
    // Restore the shared profile on direct visits as well as on the home page.
    void fetchUserInfo({ includeLastSetting: false }).catch(() => {});
  }, [isLoggedIn, user, fetchUserInfo]);

  const handleNavigation = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (location.pathname === path && !location.search) { event.preventDefault(); return; }
    if (location.pathname === "/interview") {
      event.preventDefault();
      const interview = useInterviewStore.getState();
      interview.setExitTargetPath(path);
      interview.setExitModalOpen(true);
    }
  };
  const handleLogin = () => {
    const sessionId = location.pathname === "/report" ? reportSessionId(location.search, location.state?.sessionId) : undefined;
    try { startKakaoLogin(sessionId ? { sessionId, report: reportForLogin } : null); }
    catch { showAlert("로그인을 준비하지 못했습니다. 브라우저 저장 설정을 확인하고 다시 시도해 주세요."); }
  };
  const isCurrent = (path: string) => path === "/setup"
    ? location.pathname === "/setup" || location.pathname === "/interview" || location.pathname.startsWith("/pt/")
    : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
      <header className={`devoir-header ${isLoggedIn ? "has-member-navigation" : ""}${scrolled ? " is-scrolled" : ""}`}>
        <Link to="/" className="devoir-header-logo" aria-label="Devoir 홈" onClick={(event) => handleNavigation(event, "/")}>
          <img src="/devoir-logo.svg" alt="devoir" width="113" height="24" />
        </Link>
        {focusLabel ? <div className="devoir-header-focus"><span className="devoir-header-focus-label">{focusLabel}</span><button type="button" className="devoir-header-focus-exit" disabled={exitDisabled} onClick={onExit}>면접 종료</button></div> : isLoggedIn ? (
          <div className="devoir-header-actions">
            <nav className="devoir-header-navigation" aria-label="주 메뉴">
              {navigation.map((item) => <Link key={item.path} to={item.path} className={`devoir-header-link ${isCurrent(item.path) ? "is-current" : ""}`} aria-current={isCurrent(item.path) ? "page" : undefined} onClick={(event) => handleNavigation(event, item.path)}>{item.label}</Link>)}
            </nav>
            <Link to="/mypage" className="devoir-header-profile" aria-label="마이페이지" title={profileName ? `${profileName}님 마이페이지` : "마이페이지"} aria-current={location.pathname.startsWith("/mypage") ? "page" : undefined} onClick={(event) => handleNavigation(event, "/mypage")}>
              {profileInitial || <UserRound size={18} aria-hidden="true" />}
            </Link>
          </div>
        ) : <Button type="button" className="rounded-md text-[14px] font-semibold" onClick={handleLogin}>로그인</Button>}
      </header>
  );
}
