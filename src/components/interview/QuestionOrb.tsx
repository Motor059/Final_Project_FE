import { useEffect, useState, useRef } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";
import { OrbEngine, type OrbState } from "@/lib/OrbEngine";

export default function QuestionOrb() {
  const { phase, currentQuestion, setPhase } = useInterviewStore();
  const [displayedText, setDisplayedText] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrbEngine | null>(null);

  useEffect(() => {
    if (!currentQuestion?.content) return;

    if (phase === "ASKING") {
      setDisplayedText(""); 
      let currentIndex = 0;
      const fullText = currentQuestion.content;
      
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setPhase("RECORDING");
          }, 500);
        }
      }, 60);
      
      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText(currentQuestion.content);
    }
  }, [currentQuestion?.content, phase, setPhase]);

  // OrbEngine 생성 (캔버스가 마운트된 직후 1회만 생성)
  useEffect(() => {
    if (phase === "PREPARING" || !canvasRef.current || engineRef.current) return;
    engineRef.current = new OrbEngine(canvasRef.current, bgRef.current);
  }, [phase]);

  // 상태 변경 시 엔진에 상태값만 주입
  useEffect(() => {
    if (!engineRef.current) return;
    
    let orbState: OrbState = 'idle';
    if (phase === 'ASKING') orbState = 'asking';
    else if (phase === 'RECORDING') orbState = 'recording';
    else if (phase === 'THINKING') orbState = 'thinking';

    engineRef.current.setState(orbState);
  }, [phase]);

  // 메모리 해제
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);
  
  // --- UI 렌더링 영역 ---

  if (phase === "PREPARING") {
    return (
      <div className="flex flex-col items-center justify-center w-full mt-16 animate-Devoir-fade">
        <div className="w-[44px] h-[44px] border-[3px] border-[#F5F5F4] border-t-[#1C1917] rounded-full animate-spin mb-10" />
        <h2 className="text-[26px] font-bold text-[#1C1917] mb-3 tracking-tight">
          면접관이 질문을 준비하고 있어요...
        </h2>
        <p className="text-[15px] font-medium text-[#A8A29E]">
          면접 설정과 지원 서류를 바탕으로 질문을 만드는 중
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl space-y-12 animate-Devoir-fade">
      
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

        {/* 레이어 2: Thinking 상태 점 3개 오버레이 */}
        <div className="relative z-20 flex items-center justify-center w-[160px] h-[160px]">
          {phase === "THINKING" && (
            <>
              <style>{`
                @keyframes benly-dot {
                  0%, 60%, 100% { transform: translateY(0); opacity: .35; }
                  30% { transform: translateY(-5px); opacity: 1; }
                }
              `}</style>
              <div className="flex items-center gap-[5px]">
                <i className="w-[6px] h-[6px] rounded-full bg-[#6a55a8] block animate-[benly-dot_1.25s_ease-in-out_infinite]" />
                <i className="w-[6px] h-[6px] rounded-full bg-[#6a55a8] block animate-[benly-dot_1.25s_ease-in-out_infinite]" style={{ animationDelay: '0.18s' }} />
                <i className="w-[6px] h-[6px] rounded-full bg-[#6a55a8] block animate-[benly-dot_1.25s_ease-in-out_infinite]" style={{ animationDelay: '0.36s' }} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center space-y-4 min-h-[120px]">
        {phase === "ASKING" && (
          <p className="text-[#A8A29E] text-[15px] font-medium">면접관이 질문하고 있어요</p>
        )}
        {phase === "THINKING" && (
          <p className="text-[#A8A29E] text-[15px] font-medium">면접관이 답변을 듣고 다음 질문을 생각하고 있어요...</p>
        )}
        <h2 className={`text-2xl sm:text-[28px] font-bold leading-relaxed break-keep transition-opacity duration-500 ${phase === "THINKING" ? "opacity-30" : "opacity-100"}`}>
          "{displayedText}"
        </h2>
      </div>
    </div>
  );
}