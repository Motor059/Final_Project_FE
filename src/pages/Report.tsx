import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import PageLoading from '@/components/common/PageLoading';
import ReportContent from '@/components/report/ReportContent';
import ReportLoading from '@/components/report/ReportLoading';
import StickySaveBanner from '@/components/report/StickySaveBanner';
import { useReportPolling } from '@/hooks/useReportPolling';
import { useAlertStore } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/authStore';
import { isReportSnapshot, reportSessionId, validSessionId } from '@/lib/reportNavigation';

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showAlert = useAlertStore((state) => state.showAlert);

  const sessionId = reportSessionId(location.search, location.state?.sessionId);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const previewCandidate: unknown = location.state?.guestPreview;
  const preview = sessionId !== undefined && isReportSnapshot(previewCandidate, sessionId)
    ? previewCandidate : undefined;
  const isFromHistory = location.state?.isFromHistory === true || new URLSearchParams(location.search).has('sessionId');

  const { data, isLoading, error, retry } = useReportPolling(sessionId, isFromHistory, preview);

  useEffect(() => {
    if (!sessionId) {
      showAlert("잘못된 접근입니다. 면접을 다시 진행해주세요.", () => {
        navigate('/setup', { replace: true });
      });
    }
  }, [sessionId, navigate, showAlert]);

  if (isLoading) {
    if (isFromHistory) {
      return <PageLoading layout="report" title="리포트를 불러오고 있어요" reportForLogin={data || undefined} />;
    }
    return <ReportLoading />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <Header reportForLogin={data || undefined} />
        <h2 className="text-[20px] font-bold text-[#1C1917] mb-4">면접 결과 분석 실패</h2>
        <p className="text-[#78716C] mb-6">{error || "데이터를 불러오지 못했습니다."}</p>
        {validSessionId(sessionId) && <button onClick={retry} className="mb-3 px-[24px] py-[12px] bg-white border border-[#E0DEDA] rounded-[12px] font-semibold">결과 다시 불러오기</button>}
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
        <Header reportForLogin={data || undefined} />
      </div>
      
      <main className="max-w-[780px] mx-auto pt-[100px] px-[20px]">
        <ReportContent data={data} showGuestNotice={!!preview && isLoggedIn} />

        {/* 하단 액션 버튼 */}
        <div className="flex gap-[12px] mt-[36px] flex-wrap">
          <button 
            onClick={() => navigate('/setup')} 
            className="px-[24px] py-[15px] font-semibold text-[15px] text-[#1C1917] bg-white border border-[#E0DEDA] rounded-[13px] hover:bg-gray-50 transition-all active:scale-95"
          >
            새 면접 시작
          </button>
        </div>
      </main>

      {/* 로그인 유도 고정 배너 */}
      <StickySaveBanner report={data} />
    </div>
  );
}
