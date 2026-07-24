import { useEffect } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";

export function useInterviewTimer() {
  const { phase, timeLeft, setTimeLeft, setPhase } = useInterviewStore();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    // 답변 중(RECORDING)이고 시간이 남아있을 때만 1초마다 타이머 감소
    if (phase === "RECORDING" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 
    // 시간이 0이 되면 자동으로 생각 중(THINKING) 단계로 강제 전환
    else if (timeLeft === 0 && phase === "RECORDING") {
      setPhase("THINKING");
    }

    // 컴포넌트가 사라지거나 단계가 바뀌면 타이머 메모리 누수 방지
    return () => clearInterval(timer);
  }, [phase, timeLeft, setTimeLeft, setPhase]);
}