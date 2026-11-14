import ReportHero from "@/components/report/ReportHero";
import ReportScoreBoard from "@/components/report/ReportScoreBoard";
import ReportPresentationSummary from "@/components/report/ReportPresentationSummary";
import FeedbackCard from "@/components/report/FeedbackCard";
import { companyTypeLabel, interviewStageLabel } from "@/lib/reportDisplay";
import { ptTrackLabels } from "@/lib/ptSession";
import type { ReportResponseData } from "@/types/report";
import type { ReportViewDetails } from "@/types/reportView";

interface ReportContentProps {
  data: ReportResponseData;
  details?: ReportViewDetails;
  showGuestNotice?: boolean;
}

export default function ReportContent({ data, details, showGuestNotice = false }: ReportContentProps) {
  const presentationCard = data.cards.find((card) => card.cardType === "PRESENTATION");
  const isPT = data.meta.format === "PT" || !!presentationCard || data.radar?.type === "PT" || details?.interviewType === "PT";
  const presentation = presentationCard ?? details?.presentation?.feedback;
  const durationSeconds = presentationCard ? presentationCard.durationSeconds : details?.presentation?.durationSeconds;
  const questionCards = data.cards.filter((card) => card.cardType !== "PRESENTATION");
  const companyInfoText = [companyTypeLabel(data.meta.companyType), data.meta.companyName, data.meta.jobTitle].filter(Boolean).join(" ");
  const metaHeaderString = [
    new Date(data.meta.createdAt).toLocaleDateString("ko-KR"), companyInfoText, interviewStageLabel(data.meta.stage),
  ].filter(Boolean).join(" · ");

  return (
    <>
      <h1 className="sr-only">{isPT ? "PT 면접" : "면접"} 결과 리포트</h1>
      <div className="mb-[20px] flex flex-wrap items-center gap-2.5 text-[13px] font-medium text-[#A8A29E]">
        {isPT && <span className="rounded-md bg-[#ECE7F3] px-2.5 py-1 text-[11.5px] font-semibold text-[#746680]">PT 면접</span>}
        {isPT && presentationCard?.track && <span className="rounded-md bg-[#F6F6F4] px-2.5 py-1 text-[11.5px] font-semibold text-[#78716C]">{ptTrackLabels[presentationCard.track]} 발표</span>}
        <span className="min-w-0 break-words">{metaHeaderString}</span>
      </div>

      {showGuestNotice && (
        <p className="mb-5 rounded-xl border border-[#E7E5E4] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#78716C]" role="status">
          체험 결과입니다. 회원으로 진행한 면접은 히스토리에 저장돼요.
        </p>
      )}

      {isPT && <ReportPresentationSummary durationSeconds={durationSeconds} />}
      {data.keyCoaching && <ReportHero title={data.keyCoaching.weakness} suggestion={data.keyCoaching.action} />}
      <ReportScoreBoard totalScore={data.totalScore} verdict={data.verdict ?? ''} chartData={data.radar?.axes ?? []} radarType={data.radar?.type} analysisLabel={isPT ? "PT 발표" : undefined} isPT={isPT} scoreBreakdown={isPT ? data.scoreBreakdown : undefined} />

      {isPT && presentation && (
        <section className="mt-8" aria-labelledby="report-presentation-heading">
          <h2 id="report-presentation-heading" className="mb-3 text-[13px] font-semibold text-[#78716C]">발표 피드백</h2>
          <FeedbackCard key={`presentation-${data.sessionId}`} data={presentation} index={0} kind="PRESENTATION" defaultOpen />
        </section>
      )}

      <section className="mt-8" aria-labelledby="report-questions-heading">
        <h2 id="report-questions-heading" className="mb-3 text-[13px] font-semibold text-[#78716C]">{isPT ? "질의응답 피드백" : "질문별 피드백"}</h2>
        <div className="flex flex-col">
          {questionCards.map((card, index) => (
            <FeedbackCard
              key={card.questionId ?? `question-${card.num}`} data={card} index={index}
              questionLabel={isPT ? `메인 질문 ${card.num}` : undefined}
              sourceFiles={card.questionId === null ? undefined : details?.evidenceByQuestionId?.[card.questionId]}
            />
          ))}
        </div>
      </section>
    </>
  );
}
