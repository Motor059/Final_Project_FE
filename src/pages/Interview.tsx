import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInterviewStore } from "@/store/useInterviewStore";
import InterviewHeader from "@/components/interview/InterviewHeader";
import QuestionOrb from "@/components/interview/QuestionOrb";
import ActionController from "@/components/interview/ActionController";
import { useInterviewTimer } from "@/hooks/useInterviewTimer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import Header from "@/components/common/Header";

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phase, startAndFetchFirstQuestion, cancelCurrentSession, isFinished } = useInterviewStore();
  
  useInterviewTimer();
  useSpeechRecognition();

  // 첫 진입 시 면접 시작 API 트리거
  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (!sessionId) {
      alert("잘못된 접근입니다. 면접을 다시 설정해주세요.");
      navigate('/setup', { replace: true });
      return;
    }
    startAndFetchFirstQuestion(sessionId);
  }, [location.state, navigate, startAndFetchFirstQuestion]);

  // 면접 종료(isFinished) 시 리포트 페이지로 이동
  useEffect(() => {
    if (isFinished) {
      const sessionId = location.state?.sessionId;
      // 리포트 페이지에서 채점 요청을 보낼 수 있도록 sessionId 전달
      navigate('/report', { replace: true, state: { sessionId } }); 
    }
  }, [isFinished, navigate, location.state]);

  // 중도 포기(뒤로 가기) 핸들러
  const handleGoBack = async () => {
    if (window.confirm("정말 면접을 중단하시겠습니까? 진행 내역은 저장되지 않습니다.")) {
      await cancelCurrentSession();
      navigate('/setup');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-[68px]">
      <div className="fixed top-0 left-0 z-50 w-full flex flex-col bg-white/80 backdrop-blur-md">
        <Header />        
        <header className="relative w-full h-[60px] border-b border-border flex items-center justify-center px-6 md:px-10">
          <button 
            onClick={handleGoBack}
            className="absolute left-6 md:left-10 z-20 text-xl font-bold hover:opacity-70 p-2 text-gray-700"
          >
            〈
          </button>
          {phase !== "PREPARING" && (
            <div className="w-full max-w-[840px] px-12 md:px-16">
              <InterviewHeader />
            </div> 
          )}
        </header>
      </div>

      <main className="flex-1 w-full flex flex-col items-center justify-center p-6 mt-10">
        <QuestionOrb />
      </main>

      <footer className="w-full flex justify-center pb-12 px-6">
        <ActionController />
      </footer>
    </div>
  );
}