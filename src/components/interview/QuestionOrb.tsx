import { useEffect, useState, useRef } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";
import { OrbEngine, type OrbState } from "@/lib/OrbEngine";
import LoadingState, { LoadingIndicator } from "@/components/common/LoadingState";

export default function QuestionOrb() {
  const { phase, currentQuestion, recordingAttempt, isSubmitting, questionError, answerError } = useInterviewStore();
  const isThinkingBusy = phase === "THINKING" && isSubmitting && !questionError && !answerError;
  const [typedQuestion, setTypedQuestion] = useState<{ questionId: number; attempt: number; content: string; text: string } | null>(null);
  const displayedText = phase === 'ASKING'
    ? (typedQuestion && typedQuestion.questionId === currentQuestion?.questionId &&
       typedQuestion.attempt === recordingAttempt && typedQuestion.content === currentQuestion?.content ? typedQuestion.text : '')
    : currentQuestion?.content || '';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrbEngine | null>(null);

  useEffect(() => {
    if (!currentQuestion?.content || phase !== 'ASKING') return;

    const sessionId = useInterviewStore.getState().sessionId;
    const questionId = currentQuestion.questionId;
    const content = currentQuestion.content;
    const characters = Array.from(content);
    let currentIndex = 0;
    let active = true;
    setTypedQuestion({ questionId, attempt: recordingAttempt, content, text: '' });

    const typingInterval = setInterval(() => {
      const state = useInterviewStore.getState();
      if (!active || state.sessionId !== sessionId || state.currentQuestion?.questionId !== questionId ||
          state.recordingAttempt !== recordingAttempt || state.phase !== 'ASKING' || state.isFinished || state.questionError) {
        clearInterval(typingInterval);
        return;
      }
      if (state.isPaused) return;
      if (currentIndex < characters.length) {
        currentIndex++;
        setTypedQuestion({ questionId, attempt: recordingAttempt, content, text: characters.slice(0, currentIndex).join('') });
      } else {
        // 마지막 글자가 표시된 다음 틱에서 질문 표시 완료를 알린다.
        clearInterval(typingInterval);
        state.completeQuestionPresentation(questionId, recordingAttempt, 'TEXT');
      }
    }, 60);

    return () => {
      active = false;
      clearInterval(typingInterval);
    };
  }, [currentQuestion?.questionId, currentQuestion?.content, recordingAttempt, phase]);

  // OrbEngine 생성 (캔버스가 마운트된 직후 1회만 생성)
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new OrbEngine(canvasRef.current, bgRef.current);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, []);

  // 상태 변경 시 엔진에 상태값만 주입
  useEffect(() => {
    if (!engineRef.current) return;
    
    let orbState: OrbState = 'idle';
    if (phase === 'ASKING') orbState = 'asking';
    else if (phase === 'RECORDING') orbState = 'recording';
    else if (phase === 'THINKING') orbState = 'thinking';

    engineRef.current.setState(orbState);
  }, [phase]);

  return (
    <>
      {phase === "PREPARING" && !questionError && (
        <LoadingState title="질문을 준비하고 있어요" description="면접 설정에 맞는 질문을 불러오고 있어요." className="w-full py-12" />
      )}
    <div className={`flex-col items-center justify-center w-full max-w-3xl space-y-12 animate-Devoir-fade ${phase === 'PREPARING' ? 'hidden' : 'flex'}`} aria-hidden={phase === 'PREPARING'}>
      
      {/* 160x160 오로라 구슬 영역 */}
      <div className="relative flex items-center justify-center w-[160px] h-[160px]">
        {/* 레이어 0: 배경 글로우 */}
        <div 
          ref={bgRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full pointer-events-none z-0" 
          style={{
            background: `
              radial-gradient(ellipse at 60% 30%, rgba(170,100,255,0.40) 0%, transparent 55%),
              radial-gradient(ellipse at 30% 30%, rgba(255,160,90,0.34) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 75%, rgba(80, 210, 155, 0.28) 0%, transparent 55%)
            `
          }}
        />

        {/* 레이어 1: WebGL 캔버스 */}
        <canvas 
          ref={canvasRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full pointer-events-none z-10"
        />

        {/* 레이어 2: 답변 처리 중 표시 */}
        <div className="relative z-20 flex items-center justify-center w-[160px] h-[160px]">
          {isThinkingBusy && <LoadingIndicator className="text-[#78716C]" />}
        </div>
      </div>

      <div className="text-center space-y-4 min-h-[120px]">
        {phase === "ASKING" && (
          <p className="text-[#A8A29E] text-[15px] font-medium">면접관이 질문하고 있어요</p>
        )}
        {isThinkingBusy && (
          <p className="text-[#A8A29E] text-[14px] font-medium" role="status">답변을 처리하고 다음 질문을 준비하고 있어요</p>
        )}
        <h2 className={`text-2xl sm:text-[28px] font-bold leading-relaxed break-keep transition-opacity duration-500 ${phase === "THINKING" ? "opacity-30" : "opacity-100"}`}>
          "{displayedText}"
        </h2>
      </div>
    </div>
    </>
  );
}
