import { useInterviewStore } from "@/store/useInterviewStore";
import { Badge } from "@/components/ui/badge";

export default function InterviewHeader() {
  const { currentQuestion } = useInterviewStore();
  if (!currentQuestion) return <div className="w-full h-8" />;

  const currentMainIndex = currentQuestion.mainProgress.current;
  const totalMains = currentQuestion.mainProgress.total;
  const isFollowUp = currentQuestion.type === "FOLLOW_UP";

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* 라벨 텍스트 영역 */}
      <div className="flex items-end justify-between px-0.5">
        <div className="flex items-center gap-2.5">
          <Badge 
            variant="default" 
            className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              isFollowUp
                ? "bg-[#57534E] hover:bg-[#57534E]/90 text-white"
                : "bg-black text-white"
            }`}
          >
            {currentQuestion.label} {/* "메인 질문" 또는 "Deep Dive" */}
          </Badge>
          
          {/* Action, What-if 등 꼬리질문 태그 출력 */}
          {currentQuestion.followUpType && (
            <span className="text-[13px] font-medium text-[#8A8A8E]">
              {currentQuestion.followUpType}
            </span>
          )}
        </div>
        
        {/* 진행도 텍스트 */}
        <span className="text-[13px] font-medium text-[#78716C]">
            메인 질문 {currentMainIndex} / {totalMains}
        </span>
      </div>

      {/* 프로그레스 바 영역 */}
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
