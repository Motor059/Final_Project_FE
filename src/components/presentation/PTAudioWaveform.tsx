import { useEffect, useRef, type RefObject } from "react";

export default function PTAudioWaveform({ active, levelRef }: { active: boolean; levelRef: RefObject<number> }) {
  const bars = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const draw = () => {
      bars.current.forEach((bar, index) => {
        if (bar) bar.style.height = `${6 + Math.max(0, levelRef.current) * 36 * (1 - Math.abs(index - 4) / 6)}px`;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      bars.current.forEach((bar) => { if (bar) bar.style.height = "6px"; });
    };
  }, [active, levelRef]);
  return <div className="iv-wave" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} ref={(element) => { bars.current[index] = element; }} />)}</div>;
}
