import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/common/Header';
import ReportHero from '@/components/report/ReportHero';
import ReportScoreBoard from '@/components/report/ReportScoreBoard';
import FeedbackCard from '@/components/report/FeedbackCard';
import DeliveryAnalytics from '@/components/report/DeliveryAnalytics';
import ReportLoading from '@/components/report/ReportLoading';
import StickySaveBanner from '@/components/report/StickySaveBanner';
import { mockReportData } from '@/data/mockReportData';

export default function ReportPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isAnalyzing) {
    return <ReportLoading />;
  }

  const data = mockReportData;

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-[120px] animate-in fade-in duration-500 relative">      
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F0EFED]">
        <Header />
      </div>
      <main className="max-w-[780px] mx-auto pt-[100px] px-[20px]">
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

        {/* 종합 점수 및 차트 */}
        <ReportScoreBoard 
          totalScore={data.totalScore} 
          verdict={data.verdict}
          chartData={data.radar.axes} 
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

        {/* 전달력 분석 */}
        <DeliveryAnalytics data={data.delivery} />

        {/* 하단 액션 버튼 */}
        <div className="flex gap-[12px] mt-[36px] flex-wrap">
          <button className="px-[26px] py-[15px] font-semibold text-[15px] text-white bg-[#0A0A0A] rounded-[13px] transition-transform active:scale-95">
            다시 연습하기
          </button>
          <button className="px-[24px] py-[15px] font-semibold text-[15px] text-[#1C1917] bg-white border border-[#E0DEDA] rounded-[13px] hover:bg-gray-50 transition-all active:scale-95">
            새 면접 시작
          </button>
        </div>
      </main>

      {/* 로그인 유도 고정 배너 */}
      <StickySaveBanner />
    </div>
  );
}