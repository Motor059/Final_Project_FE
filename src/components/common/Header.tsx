import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useInterviewStore } from '@/store/useInterviewStore';
import { useAlertStore } from '@/store/useAlertStore';
import { startKakaoLogin } from '@/lib/authRedirect';
import { reportSessionId } from '@/lib/reportNavigation';
import type { ReportResponseData } from '@/types/report';

export default function Header({ reportForLogin }: { reportForLogin?: ReportResponseData } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore(); 
  const { setExitModalOpen, setExitTargetPath } = useInterviewStore();
  const { showConfirm, showAlert } = useAlertStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hideBackButton = 
    location.pathname === '/' || 
    location.pathname === '/interview';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKakaoLogin = () => {
    const sessionId = location.pathname === '/report'
      ? reportSessionId(location.search, location.state?.sessionId) : undefined;
    try {
      startKakaoLogin(sessionId ? { sessionId, report: reportForLogin } : null);
    } catch {
      showAlert('로그인을 준비하지 못했습니다. 브라우저 저장 설정을 확인하고 다시 시도해 주세요.');
    }
  };

  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false);
    if (location.pathname === '/interview') {
      setExitTargetPath(path);
      setExitModalOpen(true);
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    showConfirm("로그아웃 하시겠습니까?", async () => {
      await logout();
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60] w-full h-[68px] px-[20px] md:px-[40px] flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#F0EFED]">
        <div 
          className="text-2xl font-bold tracking-tighter cursor-pointer flex items-baseline"
          onClick={() => handleNavigation('/')} 
        >
          Devoir<span className="inline-block w-[5px] h-[5px] bg-[#0A0A0A] rounded-full ml-[1px] mb-[3px]"></span>
        </div>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-4 relative" ref={dropdownRef}> 
            <button
              type="button"
              aria-label="프로필 메뉴"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="내 정보"
              className="w-[36px] h-[36px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[14px] font-semibold cursor-pointer shadow-sm hover:scale-105 transition-transform"
            >
              {user?.nickname ? user.nickname.charAt(0) : '유'}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-[48px] w-[220px] bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#F0EFED] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                
                {/* 상단 유저 정보 */}
                <div className="px-5 py-4 border-b border-[#F0EFED]">
                  <div className="text-[16px] font-bold text-[#111111] tracking-tight">
                    {user?.nickname ? `${user.nickname}님` : "카카오사용자님"}
                  </div>
                  <div className="text-[13px] text-[#A8A29E] mt-1 font-medium">
                    카카오 계정 연결됨
                  </div>
                </div>

                {/* 네비게이션 메뉴 */}
                <div className="py-2">
                  <button
                    onClick={() => handleNavigation('/mypage')}
                    className="w-full text-left px-5 py-3 text-[15px] font-medium text-[#111111] hover:bg-[#FAFAF9] transition-colors"
                  >
                    마이페이지
                  </button>
                  <button
                    onClick={() => handleNavigation('/history')}
                    className="w-full text-left px-5 py-3 text-[15px] font-medium text-[#111111] hover:bg-[#FAFAF9] transition-colors"
                  >
                    히스토리
                  </button>
                </div>

                {/* 로그아웃 버튼 */}
                <div className="border-t border-[#F0EFED] py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-[15px] font-medium text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
                
              </div>
            )}
          </div>
        ) : (
          <Button 
            variant="default" 
            className="rounded-md font-semibold text-[14px]"
            onClick={handleKakaoLogin}
          >
            로그인
          </Button>
        )}
      </header>

      {!hideBackButton && (
        <div className="fixed top-[68px] left-0 z-40 px-[20px] md:px-[40px] pt-[20px]">
          <button 
            onClick={() => navigate(-1)}
            className="p-[4px] -ml-[4px] text-[#0A0A0A] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </>
  );
}
