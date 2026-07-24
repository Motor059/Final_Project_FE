import { useEffect, useState } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";

export default function QuestionOrb() {
  const { phase, script, qIndex } = useInterviewStore();
  const currentQ = script[qIndex];
  const [displayedText, setDisplayedText] = useState("");

  // 질문이 바뀌거나 단계가 변할 때 타이핑 애니메이션 실행
  useEffect(() => {
    if (!currentQ?.q) return;

    if (phase === "ASKING") {
      setDisplayedText("");
      let currentIndex = 0;
      const fullText = currentQ.q;
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 60);

      return () => clearInterval(typingInterval);
    } else {
      // 녹음 중(RECORDING)이거나 생각 중(THINKING)일 때는 완성된 전체 텍스트 고정
      setDisplayedText(currentQ.q);
    }
  }, [currentQ?.q, phase]);

  // --- UI 렌더링 영역 ---

  if (phase === "PREPARING") {
    return (
      <div className="flex flex-col items-center justify-center w-full mt-16 animate-knock-fade">
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

  const orbBgStyle = {
    background: `
      radial-gradient(at 70% 100%, rgba(255, 170, 100, 0.4) 0%, transparent 55%),
      radial-gradient(at 30% 30%, rgba(255, 160, 255, 0.4) 0%, transparent 55%),
      radial-gradient(at 50% 75%, rgba(80, 210, 155, 0.28) 0%, transparent 55%)
    `,
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl space-y-12 animate-knock-fade">
      
      {/* 오로라 구슬 */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <div 
          className="absolute inset-0 rounded-full animate-knock-orb-idle blur-xl" 
          style={orbBgStyle} 
        />
        {phase === "THINKING" && (
          <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-knock-spin z-10" />
        )}
      </div>

      <div className="text-center space-y-4 min-h-[120px]">
        {phase === "ASKING" && (
          <p className="text-[#A8A29E] text-[15px] font-medium">면접관이 질문하고 있어요</p>
        )}

        {phase === "THINKING" && (
          <p className="text-[#A8A29E] text-[15px] font-medium">면접관이 답변을 듣고 다음 질문을 생각하고 있어요...</p>
        )}

        {/* 실제 질문 내용 (currentQ.q 대신 displayedText를 렌더링) */}
        <h2 className={`text-2xl sm:text-[28px] font-bold leading-relaxed break-keep transition-opacity duration-500 ${phase === "THINKING" ? "opacity-30" : "opacity-100"}`}>
          "{displayedText}"
        </h2>
      </div>
    </div>
  );
}