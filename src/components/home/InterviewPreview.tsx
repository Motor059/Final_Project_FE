import { Fragment, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { OrbEngine, type OrbState } from '@/lib/OrbEngine';
import PTPreparationPreview from './PTPreparationPreview';

const demos = [
  {
    id: 'tech', label: '기술 면접', total: 5,
    question: '최근 프로젝트에서 동시성 문제를 겪은 경험과, 그걸 어떻게 해결했는지 설명해 주세요.',
    answer: '재고 차감 API에 같은 상품 주문이 몰리면서 재고가 마이너스로 내려가는 문제가 있었습니다. Redis 분산 락을 걸어 한 번에 한 요청만 차감하도록 바꿨고, 이후 초과 판매는 0건이 됐습니다.',
    followUp: '왜 DB 락이 아니라 Redis 락을 고르셨나요?',
    followAnswer: 'DB 커넥션을 오래 잡으면 다른 요청까지 느려질 것 같았습니다. 요청이 몰리는 구간에만 락을 적용했습니다.',
  },
  {
    id: 'exec', label: '인성 면접', total: 5,
    question: '팀원과 의견이 크게 엇갈렸던 적이 있나요? 그때 어떻게 결론을 냈는지 말씀해 주세요.',
    answer: '인증 방식을 두고 세션과 JWT로 의견이 갈렸습니다. 두 방식의 장단점을 표로 정리해 회의에 가져갔고, 우리 서비스 규모에선 JWT가 낫다는 데 합의했습니다.',
    followUp: '그 합의 이후 결과는 수치로 어떻게 달라졌나요?',
    followAnswer: '인증 관련 문의가 줄었고, 공통 인증 흐름을 정리하면서 다음 기능을 개발하는 시간도 짧아졌습니다.',
  },
  { id: 'pt', label: 'PT 면접', total: 2, question: '', answer: '', followUp: '', followAnswer: '' },
];
const captions: Record<OrbState, string> = {
  idle: '잠시 후 다시 시작해요', asking: '면접관이 질문하고 있어요',
  recording: '답변을 듣고 있어요', thinking: '다음 질문을 준비하고 있어요',
};

export default function InterviewPreview() {
  const [tab, setTab] = useState(0);
  const [visible, setVisible] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const demo = demos[tab];

  useEffect(() => {
    let intersecting = !('IntersectionObserver' in window);
    const update = () => setVisible(intersecting && document.visibilityState !== 'hidden');
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' }) : null;
    if (stageRef.current) observer?.observe(stageRef.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % demos.length
      : event.key === 'ArrowLeft' ? (index + demos.length - 1) % demos.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? demos.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setTab(next);
    tabsRef.current[next]?.focus();
  };
  return <section className="dv-preview" aria-label="모의면접 화면 시연">
    <div className="wrap"><div ref={stageRef} className="dv-stage" data-demo-playing={visible}>
      <div className="dv-preview-tabs">
        <div className="dv-preview-tablist" role="tablist" aria-label="면접 유형">
          {demos.map((item, index) => <button key={item.id} ref={(element) => { tabsRef.current[index] = element; }} id={`home-tab-${item.id}`} type="button" role="tab" className={`dv-tab${tab === index ? ' on' : ''}`} aria-selected={tab === index} aria-controls="home-preview-panel" tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)} onKeyDown={(event) => handleTabKey(event, index)}>{item.label}</button>)}
        </div>
        <div className="dv-preview-description"><span>실제 모의면접 화면이에요. 면접 유형을 바꿔 보세요</span></div>
      </div>
      <div id="home-preview-panel" className="dv-win" role="tabpanel" aria-labelledby={`home-tab-${demo.id}`} aria-live="off">
        {demo.id === 'pt' ? <PTPreparationPreview key="pt" active={visible} /> : <QADemo key={demo.id} demo={demo} active={visible} />}
      </div>
    </div></div>
  </section>;
}

function QADemo({ demo, active }: { demo: typeof demos[number]; active: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrbEngine | null>(null);
  const time = elapsed % 14700;
  const followUp = time >= 8300;
  const phase: OrbState = time < 3000 ? 'asking' : time < 6800 ? 'recording'
    : time < 8300 ? 'thinking' : time < 10300 ? 'asking' : time < 13500 ? 'recording' : 'idle';
  const question = `"${followUp ? demo.followUp : demo.question}"`;
  const typingDuration = followUp ? 1600 : 2600;
  const typingElapsed = followUp ? time - 8300 : time;
  const typed = Array.from(question).slice(0, Math.ceil(Math.min(1, typingElapsed / typingDuration) * Array.from(question).length)).join('');
  const typing = phase === 'asking' && typingElapsed < typingDuration;
  const recordElapsed = Math.max(0, time - (followUp ? 10300 : 3000));
  const answer = followUp ? demo.followAnswer : demo.answer;
  const words = answer.split(' ');
  const answerCount = Math.min(words.length, Math.floor(recordElapsed / (followUp ? 2900 : 3500) * words.length));

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let previous: number | null = null;
    let rendered = 0;
    const tick = (time: number) => {
      if (previous !== null) elapsedRef.current += Math.min(time - previous, 100);
      previous = time;
      if (time - rendered >= 32) { setElapsed(elapsedRef.current); rendered = time; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const engine = new OrbEngine(canvasRef.current, backgroundRef.current);
    engineRef.current = engine;
    return () => { engine.destroy(); if (engineRef.current === engine) engineRef.current = null; };
  }, [active]);
  useEffect(() => { engineRef.current?.setState(phase); }, [phase, active]);

  return <>
    <div className="dv-win-head"><span className={`dv-chip${followUp ? ' follow' : ''}`}>{followUp ? '꼬리 질문 1 / 2' : '메인 질문'}</span><span className="dv-preview-progress">메인 질문 1 / {demo.total}</span></div>
    <div className="dv-segs" aria-hidden="true">{Array.from({ length: demo.total }, (_, index) => <span key={index} className={index === 0 ? 'now' : undefined} />)}</div>
    <div className="dv-win-body">
      <div className="dv-orb-wrap" aria-hidden="true"><div ref={backgroundRef} className="dv-orb-bg" /><canvas ref={canvasRef} className="dv-orb" /></div>
      <div className="dv-preview-caption-wrap">{phase === 'thinking' && <span className="dv-thinking" aria-hidden="true"><i /><i /><i /></span>}<span className="dv-preview-caption">{captions[phase]}</span></div>
      <p className="dv-question">{typed}{typing && <span className="dv-caret" aria-hidden="true" />}</p>
      <div className={`dv-demo-wave${phase === 'recording' ? ' is-recording' : ''}`} aria-hidden="true">{[8, 12, 18, 26, 34, 26, 18, 12, 8].map((height, index) => <i key={index} style={{ height, animationDelay: `${-index * .09}s` }} />)}</div>
      <div className={`dv-answer-box${phase === 'recording' ? ' live' : ''}`}><div className="dv-demo-answer-heading"><span>답변 예시</span><span className={phase === 'recording' ? 'is-live' : ''}>{phase === 'recording' ? `녹음 중 0:${String(Math.floor(recordElapsed / 1000)).padStart(2, '0')}` : phase === 'thinking' ? '답변 분석 중' : '음성으로 답변해요'}</span></div><div className="dv-answer">{answerCount ? words.slice(0, answerCount).map((word, index) => <Fragment key={`${followUp}-${index}`}><span className="dv-word">{word}</span>{' '}</Fragment>) : <span className="dv-ph">질문이 끝나면 답변 녹음이 시작돼요.</span>}</div></div>
      <div className="dv-controls" aria-hidden="true"><span className={`dv-ctl ink${phase === 'thinking' ? ' pulse' : ''}`}>{phase === 'thinking' ? '다음 질문 준비 중' : '답변 완료'}</span><span className="dv-ctl ghost">텍스트로 입력하기</span></div>
    </div>
  </>;
}
