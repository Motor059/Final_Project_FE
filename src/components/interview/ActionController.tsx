import { useInterviewStore } from "@/store/useInterviewStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AudioWaveform from "./AudioWaveform";
import LoadingState, { LoadingIndicator } from "@/components/common/LoadingState";
import { useNavigate } from "react-router-dom";

export default function ActionController() {
  const { 
    phase, inputMode, setInputMode, 
    answerText, setAnswerText, timeLeft, 
    submitAnswerAndNext, isSubmitting, questionError, retryQuestion, isSessionUnavailable, resetInterview,
    skipToNextMain, isSkipping, skipError, isPaused, audioStatus, audioError, pendingAnswer, answerError, restartAnswer,
  } = useInterviewStore();
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = () => {
    void submitAnswerAndNext();
  };

  if (questionError) {
    return (
      <div className="w-full max-w-3xl flex flex-col items-center gap-4 text-center" role="alert">
        <p className="text-sm text-[#78716C]">{questionError}</p>
        {isSessionUnavailable ? (
          <Button onClick={() => { resetInterview(); navigate('/setup', { replace: true }); }}>새 면접 설정</Button>
        ) : (
          <Button disabled={isSubmitting || isPaused} onClick={() => { void retryQuestion(); }}>면접 다시 불러오기</Button>
        )}
      </div>
    );
  }

  if (pendingAnswer && answerError) {
    return (
      <div className="w-full max-w-3xl flex flex-col items-center gap-4 text-center" role="alert">
        <p className="text-sm text-[#78716C]">{answerError}</p>
        <div className="flex gap-3">
          <Button disabled={isSubmitting || isPaused} onClick={() => { void submitAnswerAndNext(true); }}>{isSubmitting ? <span className="inline-flex items-center gap-2"><LoadingIndicator size="sm" />확인 중</span> : '같은 답변 다시 제출'}</Button>
          <Button variant="outline" disabled={isSubmitting || isPaused} onClick={restartAnswer}>다시 답변하기</Button>
        </div>
      </div>
    );
  }

  if (phase !== "RECORDING") return <div className="h-[200px]" />; 

  return (
    <div className="w-full max-w-3xl flex flex-col items-center space-y-8 animate-Devoir-fade">
      
      {/* 파형(또는 텍스트 입력창) 및 상태 텍스트 영역 */}
      <div className="flex flex-col items-center space-y-4 w-full min-h-[90px]">
        {inputMode === "AUDIO" ? (
          <>
            <div className={audioStatus === 'READY' ? '' : 'hidden'}>
              <AudioWaveform isRecording={phase === "RECORDING"} />
            </div>
            {audioStatus === 'READY' ? (
              <p className="text-sm text-[#78716C]" role="status">{isPaused ? '녹음이 일시정지됐어요' : '답변을 듣고 있어요'}</p>
            ) : <LoadingState inline title="마이크 권한을 확인하고 있어요" className="py-5" />}
          </>
        ) : (
          <div className="w-full max-w-2xl px-4 flex justify-center">
            <Textarea 
              value={answerText}
              disabled={isSubmitting || isPaused}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="답변을 텍스트로 입력하세요..." 
              className="w-full min-h-[180px] text-base p-6 leading-relaxed resize-none border-[#E0DEDA] focus-visible:ring-black shadow-sm"            
            />
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
          onClick={handleSubmit}
          disabled={isSubmitting || isPaused || (inputMode === 'AUDIO' && audioStatus !== 'READY')}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2"><LoadingIndicator size="sm" />{isSkipping ? "질문 건너뛰는 중" : "답변 제출 중"}</span>
          ) : "답변 완료"}
        </Button>
      </div>

      {/* 모드 전환 및 건너뛰기 링크 */}
      <div className="flex items-center gap-6 text-[13px] text-[#A8A29E] pt-2">
        {inputMode === "AUDIO" ? (
          <button
            className="underline underline-offset-4 hover:text-black transition-colors disabled:opacity-50"
            onClick={() => setInputMode("TEXT")}
            disabled={isSubmitting || isPaused}
          >
            텍스트로 입력하기
          </button>
        ) : (
          <span>텍스트로 답변 중</span>
        )}
        <button 
          className="hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={skipToNextMain}
          disabled={isSubmitting || isPaused}
        >
          {isSkipping ? "질문 건너뛰는 중..." : "이 질문 건너뛰기 →"}
        </button>
      </div>
      {skipError && (
        <p className="text-sm text-red-600 text-center leading-relaxed" role="alert">{skipError}</p>
      )}
      {audioError && <p className="text-sm text-red-600 text-center leading-relaxed" role="alert">{audioError}</p>}
    </div>
  );
}
