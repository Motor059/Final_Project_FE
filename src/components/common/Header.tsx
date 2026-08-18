import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();

  // TODO: 기존 스타일 가이드 삭제하고 /로 경로 수정
  const isHomePage = location.pathname === '/home';
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-[68px] px-[20px] md:px-[40px] flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#F0EFED]">
        <div 
          className="text-2xl font-bold tracking-tighter cursor-pointer flex items-baseline"
          onClick={() => navigate('/home')} // 여기도 /로 수정 예정
        >
          Knock<span className="inline-block w-[5px] h-[5px] bg-[#0A0A0A] rounded-full ml-[1px] mb-[3px]"></span>
        </div>
        
        {isLoggedIn ? (
          <div className="w-[36px] h-[36px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[14px] font-semibold cursor-pointer shadow-sm">
            {user?.nickname ? user.nickname.charAt(0) : '유'}
          </div>
        ) : (
          <Button variant="default" className="rounded-md font-semibold text-[14px]">
            로그인
          </Button>
        )}
      </header>

      {!isHomePage && (
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