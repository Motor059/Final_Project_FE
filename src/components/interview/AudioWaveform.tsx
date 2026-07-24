import { useEffect, useRef } from "react";

export default function AudioWaveform({ isRecording }: { isRecording: boolean }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isRecording) return;

    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    let stream: MediaStream;
    let animationFrameId: number;

    const initAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // 마이크 볼륨에 따라 막대기 높이를 실시간으로 그리는 함수
        const draw = () => {
          analyser.getByteFrequencyData(dataArray);

          for (let i = 0; i < 9; i++) {
            // 특정 주파수 대역의 볼륨값(0~255) 추출
            const value = dataArray[i * 2 + 2] || 0; 
            const height = 6 + (value / 255) * 30; 

            if (barsRef.current[i]) {
              barsRef.current[i]!.style.height = `${height}px`;
            }
          }
          // 브라우저 렌더링 주기에 맞춰 무한 반복
          animationFrameId = requestAnimationFrame(draw);
        };
        draw();
      } catch (error) {
        console.error("마이크 접근 권한이 없습니다.", error);
      }
    };

    initAudio();

    // 컴포넌트가 꺼지거나 녹음이 끝나면 마이크와 애니메이션 메모리 정리
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioCtx) audioCtx.close();
    };
  }, [isRecording]);

  return (
    <div className="flex gap-[6px] items-center justify-center h-[40px]">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          className="w-[6px] h-[6px] bg-[#333333] rounded-full transition-all duration-75 ease-out"
        />
      ))}
    </div>
  );
}