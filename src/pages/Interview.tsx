import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✨ 1. useNavigate 추가
import { useInterviewStore } from "@/store/useInterviewStore";
import InterviewHeader from "@/components/interview/InterviewHeader";
import QuestionOrb from "@/components/interview/QuestionOrb";
import ActionController from "@/components/interview/ActionController";
import { useInterviewTimer } from "@/hooks/useInterviewTimer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import Header from "@/components/common/Header";

export default function Interview() {
  const navigate = useNavigate();
  const { phase, setPhase, proceedToNextQuestion, isFinished } = useInterviewStore();
  
  useInterviewTimer();
  useSpeechRecognition();

  useEffect(() => {
    if (isFinished) {
      navigate('/report', { replace: true }); 
    }
  }, [isFinished, navigate]);

  // [면접 흐름 제어기] : PREPARING -> ASKING -> RECORDING -> THINKING
  useEffect(() => {
    if (phase === "PREPARING") {
      // 2초간 질문 준비(로딩) 후 ASKING(질문 읽기)으로 전환
      const timer = setTimeout(() => setPhase("ASKING"), 2000);
      return () => clearTimeout(timer);
    } 
    else if (phase === "ASKING") {
      // 2초간 질문을 보여준 뒤 본격적인 녹음(RECORDING) 상태로 전환 -> 이때 타이머와 마이크가 켜짐
      const timer = setTimeout(() => setPhase("RECORDING"), 2000);
      return () => clearTimeout(timer);
    }
    else if (phase === "THINKING") {
      // 답변을 완료하면 3초간 꼬리 질문을 생성하다가 다음 질문으로 넘어감
      const timer = setTimeout(() => proceedToNextQuestion(), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase, proceedToNextQuestion]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-[68px]">
      <div className="sticky top-0 z-50 w-full bg-white flex flex-col">
        <Header />        
        <header className="relative w-full h-[68px] backdrop-blur-md border-border flex items-center justify-center px-6 md:px-10">
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