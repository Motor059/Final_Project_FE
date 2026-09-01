import { useInterviewStore } from "@/store/useInterviewStore";
import { Badge } from "@/components/ui/badge";

export default function InterviewHeader() {
  const { currentQuestion } = useInterviewStore();
  
  const currentMainIndex = currentQuestion?.mainProgress?.current || 1;
  const totalMains = currentQuestion?.mainProgress?.total || 5;
  const isFollowUp = currentQuestion?.type === "FOLLOW_UP";
  const label = currentQuestion?.label || "질문 진행 중";
  const followUpType = currentQuestion?.followUpType || "";

  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex items-end justify-between px-0.5">
        <div className="flex items-center gap-2.5">
          <Badge 
            variant="default" 
            className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              isFollowUp ? "bg-[#57534E] text-white" : "bg-black text-white"
            }`}
          >
            {label} 
          </Badge>
          
          {followUpType && (
            <span className="text-[13px] font-medium text-[#8A8A8E]">
              {followUpType}
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
            className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
              idx < currentMainIndex ? "bg-[#1C1917]" : "bg-[#F5F5F4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}