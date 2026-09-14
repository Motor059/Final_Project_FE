import { useInterviewStore } from "@/store/useInterviewStore";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

export default function InterviewHeader() {
  const { currentQuestion, currentMainIndex } = useInterviewStore();
  
  const totalMains = 5;
  const rawType = String((currentQuestion as any)?.type || "MAIN").trim().toUpperCase();
  const isFollowUp = rawType === "FOLLOW_UP" || rawType === "SUB" || rawType === "TAIL";   
  const badgeLabel = isFollowUp ? "Deep Dive" : "메인 질문";
  const subLabel = isFollowUp ? "What-if" : "";

  useEffect(() => {
    if (currentQuestion) {
      console.log("[디버깅] 현재 질문 타입(type):", rawType);
      console.log("[디버깅] 현재 질문 순서(seq):", (currentQuestion as any)?.seq);
      console.log("[디버깅] 질문 내용:", (currentQuestion as any)?.content);
    }
  }, [currentQuestion, rawType]);

  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex items-end justify-between px-0.5">
        <div className="flex items-center gap-2.5">
          <Badge 
            variant="default" 
            className={`rounded-md px-2.5 py-0.5 text-[12px] font-semibold tracking-wide ${
              isFollowUp ? "bg-[#57534E] text-white" : "bg-[#111111] text-white"
            }`}
          >
            {badgeLabel} 
          </Badge>
          
          {isFollowUp && subLabel && (
            <span className="text-[13px] font-medium text-[#A8A29E]">
              {subLabel}
            </span>
          )}
        </div>
        
        <span className="text-[13px] font-medium text-[#78716C]">
            메인 질문 {currentMainIndex} / {totalMains}
        </span>
      </div>

      <div className="flex gap-1.5 w-full">
        {Array.from({ length: totalMains }).map((_, idx) => (
          <div
            key={idx}
            className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
              idx < currentMainIndex ? "bg-[#111111]" : "bg-[#F5F5F4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}