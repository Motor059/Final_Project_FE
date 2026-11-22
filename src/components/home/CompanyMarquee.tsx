import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const companies = ['삼성전자', '네이버', '카카오', '토스', '쿠팡', 'LG CNS', '카카오뱅크', 'SK하이닉스', '배달의민족'];

export default function CompanyMarquee() {
  const maskRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [copyCount, setCopyCount] = useState(3);

  useLayoutEffect(() => {
    const mask = maskRef.current;
    const group = groupRef.current;
    if (!mask || !group) return;

    const observer = new ResizeObserver(() => {
      const groupWidth = group.getBoundingClientRect().width;
      if (groupWidth <= 0) return;

      // Keep the viewport filled while one complete group moves offscreen.
      setCopyCount(Math.max(2, Math.ceil(mask.clientWidth / groupWidth) + 1));
    });

    observer.observe(mask);
    observer.observe(group);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="dv-marquee" aria-label="면접 방식을 참고한 기업">
      <div className="wrap dv-marquee-label">이런 기업들의 면접 방식을 바탕으로 연습해요</div>
      <div ref={maskRef} className="dv-marquee-mask">
        <div className="dv-track" style={{ '--marquee-copies': copyCount } as CSSProperties}>
          {Array.from({ length: copyCount }, (_, copy) => (
            <div
              key={copy}
              ref={copy === 0 ? groupRef : undefined}
              className="dv-track-group"
              aria-hidden={copy > 0 ? true : undefined}
            >
              {companies.map((company) => <span key={company}>{company}</span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
