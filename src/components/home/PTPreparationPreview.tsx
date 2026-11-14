import { useEffect, useRef, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { homePTMemo, homePTTask as task } from './homePTDemo';

type Track = keyof typeof task.guide;
const fields: { code: Track; label: string }[] = [
  { code: 'security', label: '보안' }, { code: 'ux', label: 'UI·UX' },
  { code: 'ai', label: 'AI' }, { code: 'data', label: '데이터' },
];
const cycleDuration = 4600 + homePTMemo.length * 55 + 6500;
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function PTPreparationPreview({ active }: { active: boolean }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [memo, setMemo] = useState('');
  const [typing, setTyping] = useState(false);
  const [remaining, setRemaining] = useState(18 * 60 + 42);
  const scrollRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLElement>(null);
  const constraintsRef = useRef<HTMLElement>(null);
  const manualTrack = useRef<Track | null>(null);
  const manualScroll = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let previous: number | null = null;
    let lastCycle = Math.floor(elapsedRef.current / cycleDuration);
    let lastCharacters = -1;
    let lastSecond = -1;
    let selected = false;
    const tick = (time: number) => {
      if (previous !== null) elapsedRef.current += Math.min(time - previous, 100);
      previous = time;
      const cycle = Math.floor(elapsedRef.current / cycleDuration);
      const elapsed = elapsedRef.current % cycleDuration;
      if (cycle !== lastCycle) {
        lastCycle = cycle; lastCharacters = -1; lastSecond = -1; selected = false;
        manualTrack.current = null; manualScroll.current = false;
        setTrack(null);
      }
      const second = Math.floor(elapsed / 1000);
      if (lastSecond !== second) { lastSecond = second; setRemaining(18 * 60 + 42 - second); }
      if (!selected && elapsed >= 3600) { selected = true; if (!manualTrack.current) setTrack('data'); }
      const characters = Math.max(0, Math.min(homePTMemo.length, Math.floor((elapsed - 4600) / 55)));
      if (characters !== lastCharacters) {
        lastCharacters = characters;
        setMemo(homePTMemo.slice(0, characters));
        setTyping(elapsed >= 4600 && characters < homePTMemo.length);
      }
      const box = scrollRef.current;
      if (box && !manualScroll.current) {
        const problem = Math.max(0, (problemRef.current?.offsetTop ?? 420) - 24);
        const bottom = Math.min(box.scrollHeight - box.clientHeight, constraintsRef.current?.offsetTop ?? box.scrollHeight);
        const first = Math.min(1, Math.max(0, (elapsed - 700) / 2900));
        const second = Math.min(1, Math.max(0, (elapsed - 4600) / (homePTMemo.length * 55)));
        box.scrollTop = second > 0 ? problem + (bottom - problem) * second : problem * first;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const guide = track ? task.guide[track] : null;
  const label = fields.find((field) => field.code === track)?.label;
  return <>
    <div className="dv-win-head"><span className="dv-chip">기업은행 · PT 준비</span><span className="dv-preview-progress">남은 준비 시간 {clock(remaining)}</span></div>
    <div className="dv-pt-preview">
      <div className="dv-pt-preview-task">
        <div ref={scrollRef} className="dv-pt-preview-scroll" tabIndex={0} aria-label="PT 과제 화면 예시" onWheel={() => { manualScroll.current = true; }} onTouchStart={() => { manualScroll.current = true; }} onKeyDown={() => { manualScroll.current = true; }}>
          <article className="dv-pt-task-content">
            <header><h3>{task.title}</h3><div className="dv-pt-virtual"><b>가상 연습 과제</b><span>실제 기업의 내부 시스템이나 기출문제를 설명한 것이 아닙니다.</span></div></header>
            <section><h4>서비스 개요</h4>{task.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
            <section><h4>현재 이용 흐름</h4><ol className="dv-pt-steps">{task.flow.map((step) => <li key={step.t}><b>{step.t}</b><span>{step.d}</span></li>)}</ol></section>
            <section ref={problemRef}><h4>문제 상황{label && <em>{label} 분야와 이어지는 문제 강조</em>}</h4><ol className="dv-pt-problems">{task.problems.map((problem, index) => <li key={problem.t} className={guide?.rel.includes(index) ? 'highlight' : ''}><b>{problem.t}</b><span>{problem.d}</span></li>)}</ol></section>
            <section><h4>사용 가능한 자료</h4><div className="dv-pt-data">{task.data.map((item) => <div key={item.t}><b>{item.t}</b><span>{item.c}<small>{item.n}</small></span><em>{item.f}</em></div>)}</div></section>
            <section ref={constraintsRef}><h4>제약 조건</h4><ul className="dv-pt-constraints">{task.constraints.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h4>연습용 가정</h4><div className="dv-pt-assumptions">{task.assume.map((item) => <span key={item.t}><b>{item.t}</b><small>{item.d}</small></span>)}</div></section>
            <section><h4>발표 요구사항</h4><p>{task.require}</p><ul className="dv-pt-constraints">{task.requireItems.map((item) => <li key={item}>{item}</li>)}</ul></section>
          </article>
        </div>
      </div>
      <div className="dv-pt-preview-side">
        <div className="dv-pt-preview-card"><div className="dv-pt-card-heading"><b>발표 분야 선택</b><span>한 분야만</span></div>
          <div className="dv-pt-preview-fields" role="group" aria-label="시연 발표 분야">{fields.map((field) => <button type="button" key={field.code} aria-pressed={track === field.code} className={track === field.code ? 'on' : ''} onClick={() => { manualTrack.current = field.code; setTrack(field.code); }}>{field.label}</button>)}</div>
          <p className="dv-pt-preview-guide" key={track ?? 'none'}>{guide ? <><b>{label} 분야로 발표해요.</b> {guide.scope}</> : '분야를 고르면 이 과제에서 다룰 범위를 알려드려요.'}</p>
        </div>
        <div className="dv-pt-preview-card dv-pt-preview-memo"><div className="dv-pt-card-heading"><b>개인 메모</b><span><LockKeyhole size={12} aria-hidden="true" />평가에 사용되지 않아요</span></div><p className={memo ? '' : 'is-placeholder'}>{memo || '자유롭게 정리하세요.'}{typing && <span className="dv-caret" aria-hidden="true" />}</p></div>
      </div>
    </div>
  </>;
}
