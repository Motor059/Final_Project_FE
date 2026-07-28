import { useInterviewStore } from "@/store/useInterviewStore";
import { Badge } from "@/components/ui/badge";

export default function InterviewHeader() {
  const { script, qIndex } = useInterviewStore();
  const currentQ = script[qIndex];
  const mainItems = script.filter((item) => item.type === "main");
  const currentMainIndex = mainItems.findIndex(
    (item) => item.main === currentQ?.main
  );

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* 라벨 텍스트 영역 */}
      <div className="flex items-end justify-between px-0.5">
        <div className="flex items-center gap-2.5">
          <Badge 
            variant="default" 
            className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              currentQ?.type === "deep" 
                ? "bg-[#57534E] hover:bg-[#57534E]/90 text-white" // Deep Dive(다크 그레이)
                : "bg-black text-white" // 메인 질문(블랙)
            }`}
          >
            {currentQ?.type === "main" ? "메인 질문" : "Deep Dive"}
          </Badge>
          
          {/* Action, What-if 등 태그 출력 */}
          {currentQ?.tag && (
            <span className="text-[13px] font-medium text-[#8A8A8E]">
              {currentQ.tag}
            </span>
          )}
        </div>
        
        {/* 진행도 텍스트 */}
        <span className="text-[13px] font-medium text-[#78716C]">
            메인 질문 {currentMainIndex >= 0 ? currentMainIndex + 1 : 1} / {mainItems.length}        </span>
      </div>

      {/* 프로그레스 바 영역 */}
      <div className="flex gap-1.5 w-full">
        {mainItems.map((_, idx) => (
          <div
            key={idx}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
              idx <= currentMainIndex ? "bg-[#1C1917]" : "bg-[#F5F5F4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}