import { useEffect, useRef } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";

export default function AudioWaveform({ isRecording }: { isRecording: boolean }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { setAudioBlob, submitAudioAnswerAndNext } = useInterviewStore();

  useEffect(() => {
    if (!isRecording) return;

    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    let stream: MediaStream;
    let animationFrameId: number;
    let mediaRecorder: MediaRecorder;
    const chunks: BlobPart[] = [];
    let isSubmitting = false;

    const initAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
          analyser.getByteFrequencyData(dataArray);
          for (let i = 0; i < 9; i++) {
            const value = dataArray[i * 2 + 2] || 0; 
            const height = 6 + (value / 255) * 30; 
            if (barsRef.current[i]) {
              barsRef.current[i]!.style.height = `${height}px`;
            }
          }
          animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          setAudioBlob(blob);
          
          if (isSubmitting) {
            submitAudioAnswerAndNext();
          }
        };

        mediaRecorder.start();

      } catch (error) {
        console.error("마이크 접근 권한이 없습니다.", error);
      }
    };

    initAudio();

    const handleRequestStop = () => {
      isSubmitting = true;
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
    window.addEventListener("request-stop-recording", handleRequestStop);

    return () => {
      window.removeEventListener("request-stop-recording", handleRequestStop);
      cancelAnimationFrame(animationFrameId);
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioCtx) audioCtx.close();
    };
  }, [isRecording, setAudioBlob, submitAudioAnswerAndNext]);

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