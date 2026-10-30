import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { OrbEngine, type OrbState } from '@/lib/OrbEngine';

const demos = [
  {
    id: 'tech', label: '기술 면접', total: 5,
    question: '최근 프로젝트에서 동시성 문제를 겪은 경험과, 그걸 어떻게 해결했는지 설명해 주세요.',
    followUp: '왜 DB 락이 아니라 Redis 락을 고르셨나요?',
  },
  {
    id: 'exec', label: '인성 면접', total: 5,
    question: '팀원과 의견이 크게 엇갈렸던 적이 있나요? 그때 어떻게 결론을 냈는지 말씀해 주세요.',
    followUp: '그 합의 이후 결과는 수치로 어떻게 달라졌나요?',
  },
  {
    id: 'pt', label: 'PT 면접', total: 2,
    question: '발표하신 생성형 AI 상담 도입 방안에서 가장 큰 리스크는 무엇이라고 보시나요?',
    followUp: '설명의무 대상인지 아닌지는 어떤 기준으로 나누나요?',
  },
];
type PreviewFrame = { tab: number; phase: OrbState; followUp: boolean; text: string };
const captions = { idle: '면접관이 질문하고 있어요', asking: '면접관이 질문하고 있어요', recording: '답변을 듣고 있어요', thinking: '다음 질문을 준비하고 있어요' };

export default function InterviewPreview() {
  const [tab, setTab] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [frame, setFrame] = useState<PreviewFrame>({ tab: 0, phase: 'asking', followUp: false, text: `"${demos[0].question}"` });
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrbEngine | null>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const demo = demos[tab];
  const current = frame.tab === tab ? frame : { tab, phase: 'asking' as const, followUp: false, text: `"${demo.question}"` };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    media.addEventListener('change', change);
    const element = stageRef.current;
    const observer = element && 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .3 }) : null;
    if (observer && element) observer.observe(element);
    else setVisible(true);
    return () => { observer?.disconnect(); media.removeEventListener('change', change); };
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion || !canvasRef.current) return;
    const engine = new OrbEngine(canvasRef.current, backgroundRef.current);
    engineRef.current = engine;
    return () => { engine.destroy(); if (engineRef.current === engine) engineRef.current = null; };
  }, [visible, reducedMotion]);

  useEffect(() => { engineRef.current?.setState(current.phase); }, [current.phase, visible, reducedMotion]);

  useEffect(() => {
    if (!visible || reducedMotion) {
      setFrame({ tab, phase: 'asking', followUp: false, text: `"${demo.question}"` });
      return;
    }
    let active = true;
    const timers = new Set<number>();
    const intervals = new Set<number>();
    const after = (delay: number, action: () => void) => {
      const timer = window.setTimeout(() => { timers.delete(timer); if (active) action(); }, delay);
      timers.add(timer);
    };
    const phase = (value: OrbState) => setFrame((previous) => ({ ...previous, phase: value }));
    const typeQuestion = (question: string, followUp: boolean, duration: number, done: () => void) => {
      const characters = Array.from(`"${question}"`);
      let index = 0;
      setFrame({ tab, phase: 'asking', followUp, text: '' });
      const timer = window.setInterval(() => {
        if (!active) return;
        index++;
        setFrame({ tab, phase: 'asking', followUp, text: characters.slice(0, index).join('') });
        if (index >= characters.length) {
          clearInterval(timer);
          intervals.delete(timer);
          done();
        }
      }, Math.max(18, Math.floor(duration / characters.length)));
      intervals.add(timer);
    };
    const cycle = () => {
      typeQuestion(demo.question, false, 2600, () => {
        after(400, () => {
          phase('recording');
          after(3800, () => {
            phase('thinking');
            after(1500, () => {
              typeQuestion(demo.followUp, true, 1600, () => {
                after(400, () => {
                  phase('recording');
                  after(3200, () => { phase('idle'); after(1200, cycle); });
                });
              });
            });
          });
        });
      });
    };
    cycle();
    return () => { active = false; timers.forEach(clearTimeout); intervals.forEach(clearInterval); };
  }, [tab, demo, visible, reducedMotion]);

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % demos.length
      : event.key === 'ArrowLeft' ? (index + demos.length - 1) % demos.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? demos.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setTab(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <section className="dv-preview" aria-label="모의면접 화면 미리 보기">
      <div className="wrap">
        <div ref={stageRef} className="dv-stage">
          <div className="dv-preview-tabs">
            <div className="dv-preview-tablist" role="tablist" aria-label="면접 유형">
              {demos.map((item, index) => (
                <button key={item.id} ref={(element) => { tabsRef.current[index] = element; }} id={`home-tab-${item.id}`}
                  type="button" role="tab" className={`dv-tab${tab === index ? ' on' : ''}`} aria-selected={tab === index}
                  aria-controls="home-preview-panel" tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)} onKeyDown={(event) => handleTabKey(event, index)}>
                  {item.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 14, color: '#57534E' }}>실제 모의면접 화면이에요. 면접 유형을 바꿔 보세요</span>
          </div>
          <div id="home-preview-panel" className="dv-win" role="tabpanel" aria-labelledby={`home-tab-${demo.id}`} aria-live="off">
            <div className="dv-win-head">
              <span className="dv-chip">{current.followUp ? '꼬리 질문' : '메인 질문'}</span>
              <span className="dv-preview-progress">메인 질문 1 / {demo.total}</span>
            </div>
            <div className="dv-segs" aria-hidden="true">
              {Array.from({ length: demo.total }, (_, index) => <span key={index} className={index === 0 ? 'now' : undefined} />)}
            </div>
            <div className="dv-win-body">
              <div className="dv-orb-wrap" aria-hidden="true">
                <div ref={backgroundRef} className="dv-orb-bg" />
                <canvas ref={canvasRef} className="dv-orb" />
              </div>
              <div className="dv-preview-caption-wrap"><span className="dv-preview-caption">{captions[current.phase]}</span></div>
              <p className="dv-question">{current.text}{current.phase === 'asking' && visible && !reducedMotion && <span className="dv-caret" aria-hidden="true" />}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
