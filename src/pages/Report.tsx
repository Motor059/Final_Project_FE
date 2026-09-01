import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import ReportHero from '@/components/report/ReportHero';
import ReportScoreBoard from '@/components/report/ReportScoreBoard';
import FeedbackCard from '@/components/report/FeedbackCard';
import DeliveryAnalytics from '@/components/report/DeliveryAnalytics';
import ReportLoading from '@/components/report/ReportLoading';
import StickySaveBanner from '@/components/report/StickySaveBanner';
import { useReportPolling } from '@/hooks/useReportPolling';

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const sessionId = location.state?.sessionId;
  const isFromHistory = location.state?.isFromHistory;

  const { data, isLoading, error } = useReportPolling(sessionId, isFromHistory);

  useEffect(() => {
    if (!sessionId) {
      alert("잘못된 접근입니다. 면접을 다시 진행해주세요.");
      navigate('/setup', { replace: true });
    }
  }, [sessionId, navigate]);

  if (isLoading) {
    return <ReportLoading />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <Header />
        <h2 className="text-[20px] font-bold text-[#1C1917] mb-4">면접 결과 분석 실패</h2>
        <p className="text-[#78716C] mb-6">{error || "데이터를 불러오지 못했습니다."}</p>
        <button 
          onClick={() => navigate('/setup')}
          className="px-[24px] py-[12px] bg-[#0A0A0A] text-white rounded-[12px] font-semibold hover:opacity-80 transition-opacity"
        >
          면접 다시 설정하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-[120px] animate-in fade-in duration-500 relative">      
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F0EFED]">
        <Header />
      </div>
      
      <main className="max-w-[780px] mx-auto pt-[100px] px-[20px]">
        {/* 상단 메타 정보 */}
        <div className="mb-[20px]">
          <div className="flex items-center gap-[10px] text-[13px] text-[#A8A29E] font-medium">
            <span>
              {new Date(data.meta.createdAt).toLocaleDateString()} · {data.meta.companyName} {data.meta.jobTitle} · {data.meta.stage === 'TECHNICAL' ? '기술 면접' : '인성 면접'}
            </span>
          </div>
        </div>

        {/* 핵심 코칭 배너 */}
        <ReportHero 
          title={data.keyCoaching.weakness} 
          suggestion={data.keyCoaching.action} 
        />

        {/* 종합 점수 및 차트 (radarType 추가) */}
        <ReportScoreBoard 
          totalScore={data.totalScore} 
          verdict={data.verdict}
          chartData={data.radar.axes} 
          radarType={data.radar.type}
        />

        {/* 질문별 피드백 리스트 */}
        <div className="mt-8">
          <div className="text-[13px] font-semibold text-[#78716C] mb-[12px]">질문별 피드백</div>
          <div className="flex flex-col">
            {data.cards.map((card, idx) => (
              <FeedbackCard key={card.questionId} data={card} index={idx} />
            ))}
          </div>
        </div>

        {/* 전달력 분석 (데이터 방어 처리) */}
        {data.delivery && <DeliveryAnalytics data={data.delivery} />}

        {/* 하단 액션 버튼 */}
        <div className="flex gap-[12px] mt-[36px] flex-wrap">
          {/* TODO: 다시 연습하기는 세션 아이디 복제 API가 있다면 연결, 현재는 홈이나 셋업으로 */}
          <button 
            onClick={() => navigate('/setup')} 
            className="px-[24px] py-[15px] font-semibold text-[15px] text-[#1C1917] bg-white border border-[#E0DEDA] rounded-[13px] hover:bg-gray-50 transition-all active:scale-95"
          >
            새 면접 시작
          </button>
        </div>
      </main>

      {/* 로그인 유도 고정 배너 (미로그인 시에만 노출) */}
      <StickySaveBanner />
    </div>
  );
}