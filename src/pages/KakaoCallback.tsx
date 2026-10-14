import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import LoadingState from '@/components/common/LoadingState';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/useAlertStore';
import { getAuthVersion } from '@/lib/authStorage';
import { clearReportLoginReturn, consumeReportLoginReturn, startKakaoLogin } from '@/lib/authRedirect';
import { reportPath } from '@/lib/reportNavigation';
import { isAxiosError, isCancel } from 'axios';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const showAlert = useAlertStore((state) => state.showAlert);
  
  const code = searchParams.get('code');
  
  const isProcessed = useRef(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processLogin = async (termsAgreed: boolean) => {
    if (!code) return;
    const version = getAuthVersion();
    
    try {
      const data = await authApi.kakaoLogin({ 
        authorizationCode: code, 
        termsAgreed 
      });

      if (version !== getAuthVersion()) return;
      completeLogin(data);
      const target = consumeReportLoginReturn();
      if (target) {
        navigate(reportPath(target.sessionId), {
          replace: true,
          state: { sessionId: target.sessionId, isFromHistory: true, guestPreview: target.report },
        });
      } else {
        navigate('/', { replace: true });
      }
      if (data.isNewUser) showAlert('회원가입이 완료되었습니다.');
      
    } catch (error: unknown) {
      if (isCancel(error) || version !== getAuthVersion()) return;
      console.error("로그인 실패 상세 원인:", error);
      const backendCode = isAxiosError<{ code?: number | string }>(error)
        ? Number(error.response?.data?.code ?? error.response?.status)
        : undefined;
      if (backendCode === 400) {
        setShowTerms(true);
      } 
      else {
        setErrorMsg("카카오 인증에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  useEffect(() => {
    if (!code) {
      setErrorMsg('카카오 로그인이 취소되었거나 인증 정보를 받지 못했습니다.');
      return;
    }
    if (isProcessed.current) return;
    isProcessed.current = true;

    const isPendingTerms = localStorage.getItem('pendingTerms') === 'true';

    if (isPendingTerms) {
      localStorage.removeItem('pendingTerms');
      processLogin(true);
    } else {
      processLogin(false);
    }
  }, [code]);

  const handleAgreeAndRestart = () => {
    localStorage.setItem('pendingTerms', 'true');
    
    try {
      startKakaoLogin(null, true);
    } catch {
      setErrorMsg('로그인을 다시 시작하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <h2 className="text-[20px] font-semibold text-[#1C1917] mb-4">{errorMsg}</h2>
        <button 
          onClick={() => { clearReportLoginReturn(); navigate('/', { replace: true }); }}
          className="px-6 py-3 bg-[#0A0A0A] text-white rounded-xl font-medium"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (showTerms) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#F0EFED] max-w-[400px] w-full text-center">
          <h2 className="text-[22px] font-semibold text-[#1C1917] mb-2">환영합니다! 🎉</h2>
          <p className="text-[14px] text-[#78716C] mb-8 leading-[1.6]">
            서비스 이용을 위해<br/>약관 및 개인정보처리방침 동의가 필요합니다.
          </p>
          <button 
            onClick={handleAgreeAndRestart}
            className="w-full py-4 bg-[#FEE500] text-[#1C1917] font-semibold rounded-xl hover:bg-[#F4DC00] transition-colors"
          >
            동의하고 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
      <LoadingState title="카카오 로그인 중입니다" description="로그인 정보를 확인하고 있어요." className="px-6" />
    </div>
  );
}
