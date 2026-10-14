import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/useAlertStore';
import { startKakaoLogin } from '@/lib/authRedirect';
import type { ReportResponseData } from '@/types/report';

export default function StickySaveBanner({ report }: { report: ReportResponseData }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showAlert = useAlertStore((state) => state.showAlert);
  if (isLoggedIn) return null;

  const handleLogin = () => {
    try {
      startKakaoLogin({ sessionId: report.sessionId, report });
    } catch {
      showAlert('로그인을 준비하지 못했습니다. 브라우저 저장 설정을 확인하고 다시 시도해 주세요.');
    }
  };
  return (
    <div className="fixed left-0 right-0 bottom-0 z-30 bg-white/90 backdrop-blur-md border-t border-[#EBEAE7] py-[16px] px-5 md:px-[40px] animate-in slide-in-from-bottom-4">
      <div className="max-w-[780px] mx-auto flex items-center justify-between gap-[20px] flex-wrap">
        <span className="text-[14px] text-[#1C1917] font-medium">
          회원으로 진행한 면접은 히스토리에서 다시 볼 수 있어요.
        </span>
        <button type="button" onClick={handleLogin}
          className="px-[22px] py-[11px] bg-[#FEE500] text-[#1C1917] font-semibold text-[14px] rounded-[11px] whitespace-nowrap hover:bg-[#F4DC00] transition-colors">
          카카오로 로그인하기
        </button>
      </div>
    </div>
  );
}
