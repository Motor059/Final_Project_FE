import ReportHero from "@/components/report/ReportHero";
import ReportScoreBoard from "@/components/report/ReportScoreBoard";
import ReportPresentationSummary from "@/components/report/ReportPresentationSummary";
import FeedbackCard from "@/components/report/FeedbackCard";
import { companyTypeLabel, interviewStageLabel } from "@/lib/reportDisplay";
import type { ReportResponseData } from "@/types/report";
import type { ReportViewDetails } from "@/types/reportView";

interface ReportContentProps {
  data: ReportResponseData;
  details?: ReportViewDetails;
  showGuestNotice?: boolean;
  expandFirstCard?: boolean;
}

export default function ReportContent({ data, details, showGuestNotice = false, expandFirstCard = false }: ReportContentProps) {
  const isPT = details?.interviewType === "PT";
  const presentation = details?.presentation;
  const companyInfoText = [companyTypeLabel(data.meta.companyType), data.meta.companyName, data.meta.jobTitle].filter(Boolean).join(" ");
  const metaHeaderString = [
    new Date(data.meta.createdAt).toLocaleDateString(), companyInfoText, interviewStageLabel(data.meta.stage),
  ].filter(Boolean).join(" · ");

  return (
    <>
      <h1 className="sr-only">{isPT ? "PT 면접" : "면접"} 결과 리포트</h1>
      <div className="mb-[20px] flex flex-wrap items-center gap-2.5 text-[13px] font-medium text-[#A8A29E]">
        {isPT && <span className="rounded-md bg-[#ECE7F3] px-2.5 py-1 text-[11.5px] font-semibold text-[#746680]">PT 면접</span>}
        <span className="min-w-0 break-words">{metaHeaderString}</span>
      </div>

      {showGuestNotice && (
        <p className="mb-5 rounded-xl border border-[#E7E5E4] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#78716C]" role="status">
          체험 결과입니다. 회원으로 진행한 면접은 히스토리에 저장돼요.
        </p>
      )}

      {isPT && <ReportPresentationSummary durationSeconds={presentation?.durationSeconds} />}
      <ReportHero title={data.keyCoaching.weakness} suggestion={data.keyCoaching.action} />
      <ReportScoreBoard totalScore={data.totalScore} verdict={data.verdict} chartData={data.radar.axes} radarType={data.radar.type} analysisLabel={isPT ? "PT 면접" : undefined} />

      {isPT && presentation?.feedback && (
        <section className="mt-8" aria-labelledby="report-presentation-heading">
          <h2 id="report-presentation-heading" className="mb-3 text-[13px] font-semibold text-[#78716C]">발표 피드백</h2>
          <FeedbackCard data={presentation.feedback} index={0} kind="PRESENTATION" presentationNote={presentation.note} defaultOpen={expandFirstCard} />
        </section>
      )}

      <section className="mt-8" aria-labelledby="report-questions-heading">
        <h2 id="report-questions-heading" className="mb-3 text-[13px] font-semibold text-[#78716C]">{isPT ? "질의응답 피드백" : "질문별 피드백"}</h2>
        <div className="flex flex-col">
          {data.cards.map((card, index) => (
            <FeedbackCard
              key={card.questionId} data={card} index={index}
              questionLabel={isPT ? `메인 질문 ${index + 1}` : undefined}
              sourceFiles={details?.evidenceByQuestionId?.[card.questionId]}
              defaultOpen={expandFirstCard && index === 0 && !presentation?.feedback}
            />
          ))}
        </div>
      </section>
    </>
  );
}
