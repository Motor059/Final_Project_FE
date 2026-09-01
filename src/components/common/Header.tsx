import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();

  const hideBackButton = 
    location.pathname === '/' || 
    location.pathname === '/home' || 
    location.pathname === '/interview';

  const handleKakaoLogin = () => {
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-[68px] px-[20px] md:px-[40px] flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#F0EFED]">
        <div 
          className="text-2xl font-bold tracking-tighter cursor-pointer flex items-baseline"
          onClick={() => navigate('/home')} 
        >
          Devoir<span className="inline-block w-[5px] h-[5px] bg-[#0A0A0A] rounded-full ml-[1px] mb-[3px]"></span>
        </div>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-4"> 
            <button
              onClick={() => navigate('/history')}
              className="text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              히스토리
            </button>
            <div 
              onClick={() => navigate('/mypage')}
              title="마이페이지"
              className="w-[36px] h-[36px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[14px] font-semibold cursor-pointer shadow-sm hover:scale-105 transition-transform"
            >
              {user?.nickname ? user.nickname.charAt(0) : '유'}
            </div>
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