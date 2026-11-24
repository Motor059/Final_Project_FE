import { useEffect, useRef, useState } from 'react';

export default function AnimatedCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const canObserve = typeof IntersectionObserver !== 'undefined';
  useEffect(() => {
    if (!canObserve) return;
    let frame = 0;
    let started: number | null = null;
    const tick = (time: number) => {
      started ??= time;
      const progress = Math.min(1, (time - started) / 1200);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      setDisplay(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, canObserve]);
  return <span ref={ref} aria-label={String(value)} style={{ font: 'inherit', color: 'inherit' }}><span aria-hidden="true" style={{ font: 'inherit', color: 'inherit' }}>{canObserve ? display : value}</span></span>;
}
