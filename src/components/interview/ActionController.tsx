import { useInterviewStore } from "@/store/useInterviewStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AudioWaveform from "./AudioWaveform";

export default function ActionController() {
  const { phase, inputMode, setInputMode, answerText, setAnswerText, timeLeft, nextQuestion, skipToNextMain } = useInterviewStore();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (phase !== "RECORDING") return <div className="h-[200px]" />; 

  return (
    <div className="w-full max-w-3xl flex flex-col items-center space-y-8 animate-knock-fade">
      
      {/* 파형(또는 텍스트 입력창) 및 상태 텍스트 영역 */}
      <div className="flex flex-col items-center space-y-4 w-full min-h-[90px]">
        {inputMode === "AUDIO" ? (
          <AudioWaveform isRecording={phase === "RECORDING"} />
        ) : (
          <div className="w-full max-w-2xl px-4 flex justify-center">
            <Textarea 
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="답변을 텍스트로 입력하세요..." 
              className="w-full min-h-[180px] text-base p-6 leading-relaxed resize-none border-[#E0DEDA] focus-visible:ring-black shadow-sm"            />
          </div>
        )}        
      </div>

      {/* 타이머 및 답변 완료 버튼 */}
      <div className="flex flex-row items-center justify-center gap-6">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
          <span className="text-[22px] font-semibold tabular-nums tracking-wide">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[#A8A29E] text-lg font-medium">/ 3:00</span>
        </div>

        <Button 
          size="lg" 
          className="px-8 py-6 rounded-xl text-base font-semibold shadow-sm bg-[#111111] hover:bg-black transition-colors" 
          onClick={nextQuestion}
        >
          답변 완료
        </Button>
      </div>

      {/* 모드 전환 및 건너뛰기 링크 */}
      <div className="flex items-center gap-6 text-[13px] text-[#A8A29E] pt-2">
        <button 
          className="underline underline-offset-4 hover:text-black transition-colors"
          onClick={() => setInputMode(inputMode === "AUDIO" ? "TEXT" : "AUDIO")}
        >
          {inputMode === "AUDIO" ? "텍스트로 입력하기" : "음성으로 답하기"}
        </button>
        <button 
          className="hover:text-black transition-colors"
          onClick={skipToNextMain}
        >
          이 주제 그만하고 다음으로 →
        </button>
      </div>
    </div>
  );
}