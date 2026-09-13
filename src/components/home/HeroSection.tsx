import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  isLoggedIn: boolean;
  userName?: string;
  lastSetting?: string | null;
}

export default function HeroSection({ isLoggedIn, userName, lastSetting }: HeroSectionProps) {
  const navigate = useNavigate();

  let savedSetup: any = null;
  try {
    const savedSetupStr = sessionStorage.getItem("interviewSetup");
    if (savedSetupStr) {
      savedSetup = JSON.parse(savedSetupStr);
    }
  } catch (e) {
    console.error("이전 설정 파싱 에러:", e);
  }

  const formatCompanyType = (type?: string) => {
    if (!type) return '';
    const map: Record<string, string> = {
      BIG_TECH_SW: '대기업 SW',
      SERVICE: '서비스 기업',
      FINANCE_IT: '금융 IT',
    };
    return map[type] || type;
  };

  const formatStage = (stage?: string) => {
    if (!stage) return '';
    return stage === 'TECHNICAL' ? '기술' : '인성';
  };

  const displaySettingText = savedSetup
    ? `${formatCompanyType(savedSetup.companyType)} · ${formatStage(savedSetup.interviewStage)}`
    : lastSetting;

  const handleRetry = () => {
    let retrySetup = null;

    if (savedSetup) {
      retrySetup = savedSetup;
    } else if (lastSetting) {
      retrySetup = {
        companyType: lastSetting.includes("대기업") ? "BIG_TECH_SW" 
                   : lastSetting.includes("서비스") ? "SERVICE" 
                   : lastSetting.includes("금융") ? "FINANCE_IT" : null,
        interviewStage: lastSetting.includes("기술") ? "TECHNICAL" 
                      : lastSetting.includes("인성") ? "PERSONALITY" : null,
      };
    }

    if (retrySetup) {
      navigate('/setup', { state: { retrySetup } });
    } else {
      navigate('/setup');
    }
  };
  
  return (
    <section className="relative pt-[90px] pb-[30px] animate-fade-in">
      <div 
        className="absolute left-1/2 top-[-140px] -translate-x-1/2 w-[1400px] max-w-[140vw] h-[760px] z-0 pointer-events-none blur-[8px]"
        style={{
          background: 'radial-gradient(34% 40% at 68% 26%, rgba(170,100,255,0.38), transparent 72%), radial-gradient(40% 44% at 28% 34%, rgba(255,160,90,0.32), transparent 72%), radial-gradient(46% 50% at 50% 80%, rgba(80,210,155,0.24), transparent 75%)'
        }}
      />

      <div className="relative z-10">
        {isLoggedIn ? (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] text-[#A8A29E] font-medium">안녕하세요</div>
            <h1 className="text-[46px] font-medium tracking-[-0.02em] m-0 leading-[1.05]">
              <span className="text-[#111111]">{userName}</span>님, 다시 오셨네요.
            </h1>
          </div>
        ) : (
          <>
            <h1 className="font-medium text-[64px] leading-[1.04] tracking-[-0.025em] m-0 max-w-[880px] text-balance text-[#111111]">
              삼성, 네이버, 카카오, 토스 면접.<br/>
              <span className="font-normal text-[#57534E]">AI와 미리 연습하세요.</span>
            </h1>
            <p className="text-[19px] leading-[1.55] text-[#78716C] max-w-[560px] mt-[26px]">
              실제 면접관처럼 음성으로 묻고, 답변에 따라 더 깊이 파고듭니다. 끝나면 점수와 함께, 다음 면접에서 무엇을 바꿔야 할지 구체적인 피드백을 드려요.
            </p>
          </>
        )}

        {/* 액션 버튼 영역 */}
        <div className={`flex items-center gap-[16px] ${isLoggedIn ? 'mt-[32px] flex-wrap' : 'mt-[38px]'}`}>
          <button 
            className="text-[16px] font-semibold text-white px-[32px] py-[16px] rounded-[14px] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, rgb(42, 37, 64) 0%, rgb(10, 10, 10) 62%)' }}
            onClick={() => navigate('/setup')}
          >
            모의면접 시작
          </button>
          
          {/* 유저 상태에 따른 분기 처리 */}
          {isLoggedIn ? (
            displaySettingText ? (
               <button 
                 onClick={handleRetry} 
                 className="text-[15px] font-semibold text-[#1C1917] bg-white border border-[#E0DEDA] px-[28px] py-[15px] rounded-[13px] inline-flex items-center gap-[9px] hover:bg-[#FAFAF9] active:scale-95 transition-all shadow-sm cursor-pointer"
               >
                 마지막 설정으로 시작 <span className="text-[#A8A29E]">· {displaySettingText}</span>
               </button>
            ) : (
              <span className="text-[14px] font-medium text-[#A8A29E]">첫 모의면접 설정을 시작해 보세요!</span>
            )
          ) : (
            <span className="text-[14px] font-medium text-[#A8A29E]">로그인 없이 바로 체험할 수 있어요</span>
          )}
        </div>
      </div>
      
      {isLoggedIn && <div className="h-[1px] bg-[#F0EFED] mt-[56px]" />}
    </section>
  );
}