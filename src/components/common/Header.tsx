import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* 상단 네비게이션 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-[68px] px-[20px] md:px-[40px] flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#F0EFED]">
        {/* 로고 영역 */}
        <div 
          className="text-2xl font-bold tracking-tighter cursor-pointer flex items-baseline"
          onClick={() => navigate('/')}
        >
          Knock<span className="inline-block w-[5px] h-[5px] bg-[#0A0A0A] rounded-full ml-[1px] mb-[3px]"></span>
        </div>
        
        {/* 우측 로그인 버튼 */}
        <Button variant="default" className="rounded-md font-semibold">
          로그인
        </Button>
      </header>

      {!isHomePage && (
        <div className="fixed top-[68px] left-0 z-40 px-[20px] md:px-[40px] pt-[20px]">
          <button 
            onClick={() => navigate(-1)} // 이전 페이지로 이동
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