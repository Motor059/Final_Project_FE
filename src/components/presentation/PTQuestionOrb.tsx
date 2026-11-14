import { useEffect, useRef } from "react";
import { OrbEngine, type OrbState } from "@/lib/OrbEngine";
import { LoadingIndicator } from "@/components/common/LoadingState";

export default function PTQuestionOrb({ text, state, orbOnly = false, caption }: { text: string; state: OrbState; orbOnly?: boolean; caption?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const engine = useRef<OrbEngine | null>(null);
  useEffect(() => {
    if (!canvas.current) return;
    try { engine.current = new OrbEngine(canvas.current, background.current); }
    catch { /* WebGL을 사용할 수 없어도 질문과 답변 입력은 유지한다. */ }
    const current = engine.current;
    return () => { current?.destroy(); if (engine.current === current) engine.current = null; };
  }, []);
  useEffect(() => { engine.current?.setState(state); }, [state]);
  return (
    <div className={`flex w-full flex-col items-center gap-10${orbOnly ? "" : " ptw-question-orb"}`}>
      <div className="relative h-40 w-40" aria-hidden="true">
        <div ref={background} className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(ellipse at 60% 30%, #AA64FF66, transparent 55%), radial-gradient(ellipse at 30% 30%, #FFA05A57, transparent 55%), radial-gradient(ellipse at 50% 75%, #50D29B47, transparent 55%)" }} />
        <canvas ref={canvas} className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        {state === "thinking" && <div className="absolute inset-0 flex items-center justify-center"><LoadingIndicator /></div>}
      </div>
      {caption && <p role="status" className="ptw-state">{caption}</p>}
      {!orbOnly && <h1 className={`ptw-orb-text min-h-[100px] w-full whitespace-pre-wrap break-keep text-center text-[24px] font-semibold leading-relaxed sm:text-[28px] ${state === "thinking" ? "opacity-40" : ""}`}>{text}</h1>}
    </div>
  );
}
