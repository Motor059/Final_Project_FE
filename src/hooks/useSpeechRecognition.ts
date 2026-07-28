import { useEffect, useRef } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";

export function useSpeechRecognition() {
  const { phase, inputMode, setAnswerText } = useInterviewStore();
    const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 브라우저 지원 여부 확인 및 초기 세팅
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // 끊기지 않고 계속 듣기
    recognition.interimResults = true; // 말하는 도중에도 중간 결과물 뱉어내기
    recognition.lang = "ko-KR"; // 한국어 설정

    // 음성이 인식될 때마다 전역 스토어의 answerText 업데이트
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswerText(transcript);
    };

    recognitionRef.current = recognition;
  }, [setAnswerText]);

  // 면접 상태와 입력 모드에 따라 마이크 켜고 끄기
  useEffect(() => {
    if (phase === "RECORDING" && inputMode === "AUDIO") {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // 이미 켜져 있는데 다시 켜려고 할 때 발생하는 에러 무시
      }
    } else {
      recognitionRef.current?.stop();
    }
    // 단계가 넘어가면 확실히 마이크 끄기
    return () => recognitionRef.current?.stop();
  }, [phase, inputMode]);
}