import { useCallback, useEffect } from "react";
import { useNavigate, useLocation, useBlocker, useBeforeUnload } from "react-router-dom";
import { useInterviewStore } from "@/store/useInterviewStore";
import InterviewHeader from "@/components/interview/InterviewHeader";
import QuestionOrb from "@/components/interview/QuestionOrb";
import ActionController from "@/components/interview/ActionController";
import { useInterviewTimer } from "@/hooks/useInterviewTimer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useQuestionSpeech } from "@/hooks/useQuestionSpeech";
import Header from "@/components/common/Header";
import { ChevronLeft } from "lucide-react";
import ExitConfirmModal from "@/components/interview/ExitConfirmModal";
import { useAlertStore } from "@/store/useAlertStore";

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phase, startAndFetchFirstQuestion, detachInterview, isFinished, setExitModalOpen, setExitTargetPath, isExitModalOpen, isPaused, setPaused, questionSpeechError } = useInterviewStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const isAlertOpen = useAlertStore((state) => state.isOpen);
  const routeSessionId = location.state?.sessionId;
  const shouldBlock = useCallback(() => {
    const current = useInterviewStore.getState();
    return current.sessionId !== null && !current.isFinished && !current.isSessionUnavailable;
  }, []);
  const blocker = useBlocker(shouldBlock);
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (shouldBlock()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }, [shouldBlock]));

  useInterviewTimer();
  useSpeechRecognition();
  useQuestionSpeech();

  useEffect(() => {
    setPaused(blocker.state === 'blocked' || isExitModalOpen || isAlertOpen);
  }, [blocker.state, isExitModalOpen, isAlertOpen, setPaused]);

  useEffect(() => {
    if (!Number.isInteger(routeSessionId) || routeSessionId <= 0) {
      showAlert("잘못된 접근입니다. 면접을 다시 설정해주세요.", () => navigate('/setup', { replace: true }));
      return;
    }
    void startAndFetchFirstQuestion(routeSessionId);
    return () => detachInterview();
  }, [routeSessionId, navigate, showAlert, startAndFetchFirstQuestion, detachInterview]);

  useEffect(() => {
    if (isFinished && !isPaused) {
      navigate('/report', { replace: true, state: { sessionId: routeSessionId } });
    }
  }, [isFinished, isPaused, navigate, routeSessionId]);

  const handleGoBack = async () => {
    setExitTargetPath('/setup');
    setExitModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-[128px]">
      <Header />   
      <ExitConfirmModal blocker={blocker} />
      <div className="fixed top-[68px] left-0 z-50 w-full flex flex-col bg-white/80 backdrop-blur-md">
        <header className="relative w-full h-[60px] flex items-center justify-center px-6 md:px-10">
          <button 
            onClick={handleGoBack}
            className="absolute left-[20px] md:left-[40px] z-20 p-[4px] -ml-[4px] text-[#0A0A0A] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
          </button>
          {phase !== "PREPARING" && (
            <div className="w-full max-w-[840px] px-12 md:px-16">
              <InterviewHeader />
            </div> 
          )}
        </header>
      </div>
      
      <main className="flex-1 w-full flex flex-col items-center justify-center p-6 mt-10">
        {questionSpeechError && <p className="mb-4 text-sm text-[#78716C] text-center" role="status">{questionSpeechError}</p>}
        <QuestionOrb />
      </main>

      <footer className="w-full flex justify-center pb-12 px-6">
        <ActionController />
      </footer>
    </div>
  );
}
