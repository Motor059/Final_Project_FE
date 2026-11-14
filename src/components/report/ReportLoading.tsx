import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingState';
import FeedbackCard from '@/components/report/FeedbackCard';
import { companyTypeLabel, interviewStageLabel } from '@/lib/reportDisplay';
import { ptTrackLabels } from '@/lib/ptSession';
import type { ReportAnalysisJob } from '@/store/useReportAnalysisStore';

export default function ReportLoading({ isPT = false, job, onRetry }: {
  isPT?: boolean; job?: ReportAnalysisJob; onRetry: () => void;
}) {
  const report = job?.report;
  const total = job?.totalCards ?? (isPT ? 3 : 5);
  const interrupted = job?.state === 'FAILED' || job?.state === 'ERROR';
  const allCardsDone = !!job && job.completedCards >= total;
  const presentation = report?.cards.find((card) => card.cardType === 'PRESENTATION');
  const rows = Array.from({ length: total }, (_, index) => {
    const num = isPT ? index : index + 1;
    const card = report?.cards.find((item) => isPT && index === 0 ? item.cardType === 'PRESENTATION' : item.cardType !== 'PRESENTATION' && item.num === num);
    return { key: isPT && index === 0 ? 'presentation' : `question-${num}`, card,
      label: isPT && index === 0 ? '발표' : `${num === 1 ? '첫 번째' : num === 2 ? '두 번째' : `${num}번째`} ${isPT ? '질의응답 묶음' : '질문 답변 묶음'}`,
      completed: allCardsDone || card?.status === 'COMPLETED',
    };
  });
  const current = rows.findIndex((row) => !row.completed);
  const completedRows = rows.filter((row) => row.completed && row.card);
  const company = report?.meta.companyName || (report ? companyTypeLabel(report.meta.companyType) : null);

  return <main className="mx-auto min-h-screen w-full max-w-[600px] px-6 pb-16 pt-[126px] sm:pt-[145px]">
    <div className="flex flex-col items-center text-center">
      <span className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#0A0A0A] text-white"><Check size={35} strokeWidth={2.5} aria-hidden="true" /></span>
      <h1 className="mt-7 text-[25px] font-semibold tracking-[-0.04em] text-[#1C1917]">{isPT ? 'PT 면접' : '면접'}을 완료했어요.</h1>
      <p className="mt-3 text-[16px] leading-7 text-[#78716C]" role="status">{interrupted ? '분석 상태를 다시 확인해 주세요.' : allCardsDone ? '종합 점수와 코칭을 정리하고 있어요.' : '답변을 분석하고 있습니다.'}</p>
      {(company || presentation?.track || (!isPT && report)) && <div className="mt-6 flex flex-wrap justify-center gap-2 text-[12px] font-medium text-[#78716C]">
        {company && <span className="rounded-lg bg-[#F5F5F4] px-3 py-1">{company}</span>}
        {isPT && presentation?.track && <span className="rounded-lg bg-[#F5F5F4] px-3 py-1">{ptTrackLabels[presentation.track]} 분야</span>}
        {!isPT && report && <span className="rounded-lg bg-[#F5F5F4] px-3 py-1">{interviewStageLabel(report.meta.stage)}</span>}
      </div>}
    </div>

    <section className="mt-10" aria-labelledby="analysis-progress-title">
      <div className="mb-3 flex items-center justify-between text-[12px] font-medium text-[#A8A29E]">
        <h2 id="analysis-progress-title">평가 진행 상태</h2>
        {job && <span>{job.completedCards}/{total}개 완료</span>}
      </div>
      <ol className="space-y-2.5">
        {rows.map((row, index) => <li key={row.key} className="flex min-h-[58px] items-center justify-between gap-4 rounded-[20px] bg-[#F6F6F4] px-5 py-4">
          <span className={`text-[14px] font-semibold ${row.completed || index === current ? 'text-[#1C1917]' : 'text-[#8A847F]'}`}>{row.label}</span>
          <span className={`flex shrink-0 items-center gap-2 text-[12px] ${row.completed ? 'font-medium text-[#57534E]' : 'text-[#A8A29E]'}`}>
            {row.completed ? <><Check size={17} aria-hidden="true" />완료</> : interrupted ? '확인 필요' : index === current ? <><LoadingIndicator size="sm" />분석 중</> : '확인 대기'}
          </span>
        </li>)}
      </ol>
      {allCardsDone && !interrupted && <p role="status" className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#78716C]"><LoadingIndicator size="sm" />마지막으로 종합 코칭을 정리하고 있어요</p>}
      {interrupted && <div role="alert" className="mt-4 rounded-2xl border border-[#E7E5E4] p-5 text-[13px] leading-6 text-[#78716C]">
        <p>{job.error || '분석 상태를 불러오지 못했어요. 다시 확인해 주세요.'}</p>
        <button type="button" onClick={onRetry} className="mt-3 rounded-full border border-[#D6D3D1] px-4 py-1.5 font-semibold text-[#44403C] hover:bg-[#F5F5F4]">{job.state === 'FAILED' ? '다시 분석하기' : '분석 상태 다시 확인'}</button>
      </div>}
      <p className="mt-5 break-keep text-center text-[12px] leading-6 text-[#A8A29E]">다른 페이지로 이동해도 분석은 계속돼요.<br />완료되면 사이트 안에서 알려드릴게요.</p>
    </section>

    <div className="mt-7 flex flex-wrap justify-center gap-3">
      <Link to="/setup" className="rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-80">새 면접 시작</Link>
      <Link to="/" className="rounded-full border border-[#E7E5E4] bg-white px-7 py-3.5 text-[14px] font-semibold text-[#1C1917] hover:bg-[#FAFAF9]">홈으로</Link>
    </div>

    {!!completedRows.length && <section className="mt-10 border-t border-[#E7E5E4] pt-7" aria-labelledby="completed-feedback-title">
      <h2 id="completed-feedback-title" className="mb-3 text-[13px] font-semibold text-[#78716C]">먼저 완료된 피드백</h2>
      {completedRows.map(({ key, card }, index) => card && <FeedbackCard key={key} data={card} index={index} kind={card.cardType === 'PRESENTATION' ? 'PRESENTATION' : 'QUESTION'} questionLabel={card.cardType === 'PRESENTATION' ? undefined : `메인 질문 ${card.num}`} />)}
    </section>}
  </main>;
}
