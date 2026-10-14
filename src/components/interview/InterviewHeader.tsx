import { useInterviewStore } from "@/store/useInterviewStore";
import { Badge } from "@/components/ui/badge";
import { followUpLabel } from "@/lib/reportDisplay";

export default function InterviewHeader() {
  const { currentQuestion, currentMainIndex } = useInterviewStore();
  
  const totalMains = currentQuestion?.mainProgress?.total || 5;
  const rawType = String(currentQuestion?.type || "MAIN").trim().toUpperCase();
  const isFollowUp = rawType === "FOLLOW_UP" || rawType === "SUB" || rawType === "TAIL";   
  const badgeLabel = isFollowUp ? "꼬리 질문" : "메인 질문";
  const subLabel = isFollowUp ? followUpLabel(currentQuestion?.followUpType) : "";

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