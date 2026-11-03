import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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

export default function Header({ reportForLogin }: { reportForLogin?: ReportResponseData } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const showAlert = useAlertStore((state) => state.showAlert);
  const hideBackButton = location.pathname === "/" || location.pathname === "/interview";

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
    <>
      <header className={`devoir-header ${isLoggedIn ? "has-member-navigation" : ""}`}>
        <Link to="/" className="devoir-header-logo" aria-label="Devoir 홈" onClick={(event) => handleNavigation(event, "/")}>
          <img src="/devoir-logo.svg" alt="devoir" width="113" height="24" />
        </Link>
        {isLoggedIn ? (
          <div className="devoir-header-actions">
            <nav className="devoir-header-navigation" aria-label="주 메뉴">
              {navigation.map((item) => <Link key={item.path} to={item.path} className={`devoir-header-link ${isCurrent(item.path) ? "is-current" : ""}`} aria-current={isCurrent(item.path) ? "page" : undefined} onClick={(event) => handleNavigation(event, item.path)}>{item.label}</Link>)}
            </nav>
            <Link to="/mypage" className="devoir-header-profile" aria-label="마이페이지" title={user?.nickname ? `${user.nickname}님 마이페이지` : "마이페이지"} aria-current={location.pathname.startsWith("/mypage") ? "page" : undefined} onClick={(event) => handleNavigation(event, "/mypage")}>
              {user?.nickname?.charAt(0) || "유"}
            </Link>
          </div>
        ) : <Button type="button" className="rounded-md text-[14px] font-semibold" onClick={handleLogin}>로그인</Button>}
      </header>
      {!hideBackButton && (
        <div className="fixed left-0 top-[68px] z-40 px-[20px] pt-[20px] md:px-[40px]">
          <button type="button" onClick={() => navigate(-1)} className="-ml-[4px] cursor-pointer rounded-lg p-[4px] text-[#0A0A0A] hover:bg-gray-200" aria-label="뒤로 가기"><ChevronLeft className="h-7 w-7" strokeWidth={2.5} /></button>
        </div>
      )}
    </>
  );
}
