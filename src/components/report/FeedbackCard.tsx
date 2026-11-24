import { useId, useState } from 'react';
import { ChevronDown, ChevronUp, LoaderCircle } from 'lucide-react';
import type { ImprovedOutline, PresentationRequirement, TailQuestion } from '@/types/report';
import type { ReportFeedbackContent, RepositoryEvidenceFile } from '@/types/reportView';
import RepositoryEvidence from '@/components/report/RepositoryEvidence';
import { followUpLabel, scoreColor, scoreText, weakAxisLabel } from '@/lib/reportDisplay';

interface FeedbackCardProps {
  data: ReportFeedbackContent;
  index: number;
  kind?: 'QUESTION' | 'PRESENTATION';
  questionLabel?: string;
  sourceFiles?: readonly RepositoryEvidenceFile[];
  defaultOpen?: boolean;
}

export default function FeedbackCard({ data, index, kind = 'QUESTION', questionLabel, sourceFiles = [], defaultOpen = false }: FeedbackCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isDeepOpen, setIsDeepOpen] = useState(false);
  const [fullTranscript, setFullTranscript] = useState(false);
  const contentId = useId();
  const deepId = useId();
  const transcriptId = useId();
  const isPresentation = kind === 'PRESENTATION';
  const pending = data.status === 'SCORING' || data.status === 'FAILED';
  const noPresentation = isPresentation && !data.answer?.trim();
  const hasEvidence = sourceFiles.some((file) => file.path.trim().length > 0);
  const hasOutline = !!(data.improvedOutline?.before.length || data.improvedOutline?.after.length);
  const hasDeep = !noPresentation && !data.skipped && !!(data.weakAxis || (isPresentation ? hasOutline : data.improvedAnswer || data.tails?.length));

  return <div className="border border-[#F0EFED] rounded-[16px] overflow-hidden bg-white mb-[10px]">
    <button type="button" aria-expanded={!pending && isOpen} aria-controls={contentId} disabled={pending} onClick={() => setIsOpen(!isOpen)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 px-[22px] py-[18px] text-left hover:bg-gray-50 transition-colors disabled:cursor-default sm:gap-x-[14px]">
      <span className="inline-flex h-6 items-center whitespace-nowrap text-[12px] font-semibold leading-none text-[#A8A29E]">{isPresentation ? '발표' : questionLabel ?? `질문 ${index + 1}`}</span>
      <span className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1 text-left text-[14.5px] font-medium leading-6 text-[#1C1917]">
        <span className="min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere]">{data.shortTitle || (pending ? '피드백을 준비하고 있어요' : isPresentation ? 'PT 발표' : '질문 피드백')}</span>
        {isPresentation && <span className="inline-flex h-6 shrink-0 items-center"><span className="inline-flex h-5 items-center rounded-md bg-[#ECE7F3] px-2 text-[10.5px] font-semibold leading-none whitespace-nowrap text-[#746680]">PT 발표</span></span>}
        {hasEvidence && <span className="inline-flex h-6 shrink-0 items-center"><span className="inline-flex h-5 items-center rounded-md bg-[#F1EDF6] px-2 text-[10.5px] font-semibold leading-none whitespace-nowrap text-[#746680]">레포 기반</span></span>}
      </span>
      <span className="inline-flex h-6 shrink-0 items-center gap-2 whitespace-nowrap sm:gap-[12px]">
        {pending ? <span className="inline-flex items-center gap-1.5 text-[12px] leading-none text-[#8A857D]"><LoaderCircle size={14} className="shrink-0 animate-spin" aria-hidden="true" />채점 중</span>
          : <><span className="text-[16px] font-semibold leading-6 tabular-nums" style={{ color: scoreColor(data.topicScore) }}>{scoreText(data.topicScore)}</span>{isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-[#A8A29E]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[#A8A29E]" />}</>}
      </span>
    </button>

    {!pending && isOpen && <div id={contentId} className="min-w-0 px-[22px] pb-[24px] pt-1 animate-in fade-in slide-in-from-top-2 motion-reduce:animate-none">
      {!isPresentation && <h4 className="text-[18px] leading-[1.45] font-medium text-[#0A0A0A] mb-[16px]">{data.question}</h4>}
      <RepositoryEvidence files={sourceFiles} />
      {noPresentation ? <div className="mb-[18px] rounded-[12px] border border-dashed border-[#ECE7F3] bg-[#FAF9FC] p-[16px]">
        <p className="text-[13px] font-semibold text-[#746680]">발표 내용이 기록되지 않았어요</p>
        <p className="mt-1 text-[12.5px] leading-[1.6] text-[#78716C]">발표 원문이 없어 발표 내용에 대한 피드백을 확인할 수 없어요. 질의응답 결과는 아래에서 확인할 수 있어요.</p>
      </div> : data.skipped ? <SkippedNotice /> : <div className="bg-[#FAFAF9] rounded-[12px] p-[16px] mb-[18px]">
        <div className="text-[11.5px] font-semibold text-[#A8A29E] mb-[6px]">{isPresentation ? '내 발표' : '내 답변'}</div>
        <p id={transcriptId} className={`whitespace-pre-wrap break-words text-[13.5px] leading-[1.6] text-[#44403C]${isPresentation && !fullTranscript ? ' line-clamp-4' : ''}`}>{data.answer || '답변 기록이 없어요.'}</p>
        {isPresentation && <button type="button" aria-expanded={fullTranscript} aria-controls={transcriptId} onClick={() => setFullTranscript(!fullTranscript)} className="mt-2 text-[12px] font-medium text-[#78716C] underline underline-offset-4">{fullTranscript ? '접기' : '전체 보기'}</button>}
      </div>}

      {isPresentation && !!data.requirements?.length && <RequirementsList requirements={data.requirements} />}
      {!data.skipped && <FeedbackRows feedback={data} />}
      {hasDeep && <button type="button" aria-expanded={isDeepOpen} aria-controls={deepId} onClick={() => setIsDeepOpen(!isDeepOpen)} className="mt-4 text-[12.5px] text-[#78716C] underline underline-offset-4 hover:text-[#0A0A0A] transition-colors">
        {isDeepOpen ? '심화 닫기' : isPresentation ? '심화 보기 — 개선된 발표 개요' : '심화 보기 — 개선된 답변 · 꼬리 질문'}
      </button>}
      {hasDeep && isDeepOpen && <div id={deepId} className="mt-[20px] border-t border-[#F0EFED] pt-[20px] animate-in fade-in motion-reduce:animate-none">
        {data.weakAxis && <div className="mb-[24px]"><div className="text-[12.5px] font-semibold text-[#57534E] mb-[8px]">약한 축</div><p className="text-[13.5px] leading-[1.55] text-[#78716C]">{weakAxisLabel(data.weakAxis)}</p></div>}
        {isPresentation ? data.improvedOutline && hasOutline && <OutlineComparison outline={data.improvedOutline} /> : <>
          {data.improvedAnswer && <div className="mb-[32px]">
            <div className="text-[12.5px] font-semibold text-[#57534E] mb-[12px]">개선된 답변 예시</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
              <div className="bg-[#FAFAF9] border border-[#F0EFED] rounded-[11px] p-[16px]"><div className="text-[11px] font-semibold text-[#9A3412] mb-[8px]">내 답변</div><p className="whitespace-pre-wrap text-[13px] leading-[1.6] text-[#78716C]">{data.improvedAnswer.before}</p></div>
              <div className="bg-[#0A0A0A] rounded-[11px] p-[16px]"><div className="text-[11px] font-semibold text-[#15803D] mb-[8px]">개선된 답변</div><p className="whitespace-pre-wrap text-[13px] leading-[1.6] text-[#E7E5E4]">{data.improvedAnswer.after}</p></div>
            </div>
          </div>}
          {!!data.tails?.length && <div><div className="text-[12.5px] font-semibold text-[#57534E] mb-[16px]">이 주제의 꼬리 질문</div><div className="flex flex-col gap-[20px]">{data.tails.map((tail, idx) => <TailQuestionBlock key={idx} tail={tail} />)}</div></div>}
        </>}
      </div>}
    </div>}
  </div>;
}

const requirementStyles = {
  COVERED: { label: '다룸', color: 'text-[#15803D] bg-[#F0FDF4]' },
  PARTIAL: { label: '일부', color: 'text-[#A16207] bg-[#FEFCE8]' },
  MISSING: { label: '안 다룸', color: 'text-[#9A3412] bg-[#FFF7ED]' },
};

function RequirementsList({ requirements }: { requirements: PresentationRequirement[] }) {
  return <div className="mb-[18px] rounded-[12px] border border-[#F0EFED] p-[16px]">
    <div className="mb-[12px] flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-[11.5px] font-semibold text-[#A8A29E]">발표 요구사항 체크</h3>
      <div className="flex gap-1.5 text-[10.5px] font-semibold">{(Object.keys(requirementStyles) as PresentationRequirement['status'][]).map((status) => <span key={status} className={`rounded-md px-2 py-0.5 ${requirementStyles[status].color}`}>{requirementStyles[status].label} {requirements.filter((item) => item.status === status).length}</span>)}</div>
    </div>
    <ul className="flex flex-col gap-[10px]">{requirements.map((item, index) => {
      const style = requirementStyles[item.status] ?? { label: '확인 중', color: 'text-[#78716C] bg-[#F6F6F4]' };
      return <li key={index} className="flex items-start gap-[10px]">
        <span className={`text-[11px] font-semibold px-[8px] py-[3.5px] rounded-[6px] whitespace-nowrap mt-[1px] min-w-[52px] text-center ${style.color}`}>{style.label}</span>
        <div className="flex-1 min-w-0"><p className="text-[13.5px] leading-[1.55] text-[#1C1917]">{item.requirement}</p>{item.evidence && <p className="mt-0.5 text-[12px] leading-[1.55] text-[#A8A29E]">{item.evidence}</p>}</div>
      </li>;
    })}</ul>
  </div>;
}

function OutlineComparison({ outline }: { outline: ImprovedOutline }) {
  const hasNewSteps = outline.after.some((step) => !outline.before.includes(step));
  return <div className="mb-[8px]">
    <div className="text-[12.5px] font-semibold text-[#57534E] mb-[12px]">개선된 발표 개요</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
      <div className="bg-[#FAFAF9] border border-[#F0EFED] rounded-[11px] p-[16px]"><div className="text-[11px] font-semibold text-[#9A3412] mb-[8px]">내 발표 흐름</div><ol className="flex flex-col gap-1">{outline.before.map((step, index) => <OutlineStep key={index} text={step} number={index + 1} />)}</ol></div>
      <div className="bg-[#0A0A0A] rounded-[11px] p-[16px]"><div className="text-[11px] font-semibold text-[#15803D] mb-[8px]">개선된 발표 개요</div><ol className="flex flex-col gap-1">{outline.after.map((step, index) => <OutlineStep key={index} text={step} number={index + 1} dark added={!outline.before.includes(step)} />)}</ol>{hasNewSteps && <p className="mt-3 text-[11px] text-[#78716C]">흰색이 새로 추가할 단계예요.</p>}</div>
    </div>
  </div>;
}

function OutlineStep({ text, number, dark = false, added = false }: { text: string; number: number; dark?: boolean; added?: boolean }) {
  return <li className={`flex items-start gap-2 text-[13px] leading-[1.6] ${dark ? added ? 'text-white font-semibold' : 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
    <span className={`mt-[3px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full text-[10px] ${dark ? added ? 'bg-white text-[#0A0A0A]' : 'bg-white/10 text-[#A8A29E]' : 'bg-[#F0EFED] text-[#78716C]'}`}>{number}</span>{text}
  </li>;
}

function TailQuestionBlock({ tail }: { tail: TailQuestion }) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const contentId = useId();
  return <div className="border-l-[2px] border-[#E7E5E4] pl-[16px] mb-[24px]">
    <div className="flex items-start gap-[8px] mb-[12px]"><span className="text-[10.5px] font-semibold text-white bg-[#78716C] px-[8px] py-[2.5px] rounded-[5px] whitespace-nowrap shrink-0">{followUpLabel(tail.strategy)}</span><span className="text-[13.5px] font-medium text-[#1C1917]">{tail.question}</span></div>
    {tail.skipped ? <SkippedNotice /> : <>
      <div className="bg-[#FAFAF9] rounded-[10px] p-[14px] mb-[16px]"><div className="text-[10.5px] font-semibold text-[#A8A29E] mb-[6px]">내 답변</div><p className="whitespace-pre-wrap text-[12.5px] leading-[1.6] text-[#44403C]">{tail.answer || '답변 기록이 없어요.'}</p></div>
      <FeedbackRows feedback={tail} />
      {(tail.weakAxis || tail.improvedAfter) && <button type="button" aria-expanded={isFeedbackOpen} aria-controls={contentId} onClick={() => setIsFeedbackOpen(!isFeedbackOpen)} className="text-[12.5px] text-[#A8A29E] underline underline-offset-4 hover:text-[#57534E] transition-colors mb-[14px]">{isFeedbackOpen ? '피드백 닫기' : '피드백 보기'}</button>}
      {isFeedbackOpen && <div id={contentId} className="border-t border-[#F0EFED] pt-[16px] animate-in fade-in motion-reduce:animate-none">
        {tail.weakAxis && <div className="mb-[20px]"><div className="text-[12px] font-semibold text-[#57534E] mb-[6px]">약한 축</div><p className="text-[13px] leading-[1.55] text-[#78716C]">{weakAxisLabel(tail.weakAxis)}</p></div>}
        {tail.improvedAfter && <div><div className="text-[12px] font-semibold text-[#57534E] mb-[10px]">개선된 답변 예시</div><div className="bg-[#0A0A0A] rounded-[11px] p-[14px]"><div className="text-[11px] font-semibold text-[#15803D] mb-[6px]">개선된 답변</div><p className="whitespace-pre-wrap text-[12.5px] leading-[1.6] text-[#E7E5E4]">{tail.improvedAfter}</p></div></div>}
      </div>}
    </>}
  </div>;
}

function SkippedNotice() {
  return <p className="mb-[18px] bg-[#FAFAF9] rounded-[10px] p-[14px] text-[12.5px] text-[#78716C]">이 질문은 건너뛰어서 0점으로 처리됐어요.</p>;
}

function FeedbackRows({ feedback }: { feedback: Pick<TailQuestion, 'good' | 'weak' | 'next'> }) {
  return <div className="flex flex-col gap-[10px] mb-[6px]">
    <FeedbackRow label="잘한 점" colorClass="text-[#15803D] bg-[#F0FDF4]" text={feedback.good} />
    <FeedbackRow label="아쉬운 점" colorClass="text-[#9A3412] bg-[#FFF7ED]" text={feedback.weak} />
    <FeedbackRow label="다음엔" colorClass="text-white bg-[#0A0A0A]" text={feedback.next} />
  </div>;
}

function FeedbackRow({ label, colorClass, text }: { label: string; colorClass: string; text: string | null }) {
  if (!text?.trim()) return null;
  return <div className="flex items-start gap-[10px]">
    <span className={`text-[11px] font-semibold px-[8px] py-[3.5px] rounded-[6px] whitespace-nowrap mt-[2px] ${colorClass}`}>{label}</span>
    <p className="whitespace-pre-wrap text-[13.5px] leading-[1.55] text-[#1C1917] flex-1">{text}</p>
  </div>;
}
