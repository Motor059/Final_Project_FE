import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUserInfo } = useAuthStore();
  
  const code = searchParams.get('code');
  
  const isProcessed = useRef(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processLogin = async (termsAgreed: boolean) => {
    if (!code) return;
    
    try {
      const data = await authApi.kakaoLogin({ 
        authorizationCode: code, 
        termsAgreed 
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      await fetchUserInfo();
      navigate('/home', { replace: true });
      
    } catch (error: any) {
      console.error("로그인 실패 상세 원인:", error);
      const backendCode = error.response?.data?.code || error.response?.status;
      if (backendCode === 400) {
        setShowTerms(true);
      } 
      else {
        setErrorMsg("카카오 인증에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  useEffect(() => {
    if (!code || isProcessed.current) return;
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
    
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <h2 className="text-[20px] font-semibold text-[#1C1917] mb-4">{errorMsg}</h2>
        <button 
          onClick={() => navigate('/home', { replace: true })}
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
      <div className="w-8 h-8 border-[3px] border-[#E7E5E4] border-t-[#0A0A0A] rounded-full animate-spin mb-4" />
      <p className="text-[15px] font-medium text-[#78716C]">카카오 로그인 중입니다...</p>
    </div>
  );
}