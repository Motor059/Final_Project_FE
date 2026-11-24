import Header from "@/components/common/Header";
import MemberPageBody from "@/components/common/MemberPageBody";
import MemberPageHero from "@/components/common/MemberPageHero";
import HistoryList, {
  type InterviewHistoryItem,
} from "@/components/history/HistoryList";
import HistorySummary from "@/components/history/HistorySummary";
import useHistory from "@/hooks/useHistory";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { companyTypeLabel, interviewStageLabel, scoreValue } from "@/lib/reportDisplay";
import { reportPath } from "@/lib/reportNavigation";
import { normalizeHistoryFormat } from "@/api/historyApi";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

export default function History() {
  const { history, isLoading, isError, analysisJobs, isResolvingFormats, retry } = useHistory();
  const navigate = useNavigate();
  const [stageFilter, setStageFilter] = useState<'ALL' | 'TECHNICAL' | 'PERSONALITY'>('ALL');
  const [formatFilter, setFormatFilter] = useState<'QA' | 'PT'>('QA');

  const historyItems: InterviewHistoryItem[] =
    history?.sessions.map((session) => {
      const job = analysisJobs?.[session.sessionId];
      const completedReport = job?.state === "COMPLETED" ? job.report : null;
      const score = scoreValue(session.totalScore);
      const interviewEnded = session.status === "ANALYZING" || session.status === "COMPLETED";
      const resultState: InterviewHistoryItem["resultState"] = completedReport
        ? "COMPLETED"
        : job && job.state !== "COMPLETED"
          ? job.state
          : session.status === "FAILED"
            ? "FAILED"
            : !interviewEnded
              ? "INCOMPLETE"
              : score !== null && score > 0 ? "COMPLETED" : "CHECKING";

      return {
        id: session.sessionId,
        format: session.format ?? normalizeHistoryFormat(job?.report?.meta?.format),
        date: formatDate(session.createdAt),
        company: session.companyName ?? companyTypeLabel(session.companyType),
        role: session.jobRole ?? "직무 미지정",
        stage: interviewStageLabel(session.interviewStage),
        stageCode: session.interviewStage,
        totalScore: completedReport ? scoreValue(completedReport.totalScore) : score,
        resultState,
      };
    }) ?? [];
  const filteredHistoryItems = historyItems.filter((item) => formatFilter === 'PT' || stageFilter === 'ALL' || item.stageCode === stageFilter);
  const qaHistoryItems = filteredHistoryItems.filter(
    (item) => item.format === "QA"
  );

  const ptHistoryItems = filteredHistoryItems.filter(
    (item) => item.format === "PT"
  );
  const unclassifiedHistoryItems = filteredHistoryItems.filter((item) => item.format === null);
  const handleSelectHistory = (id: number) => {
    const selectedItem = historyItems.find((item) => item.id === id);

    navigate(reportPath(id), {
      state: { sessionId: id, isFromHistory: true, interviewType: selectedItem?.format ?? undefined },
    });
  };

  const totalSessions = history?.totalCount ?? 0;
  const weekSessions = history?.weekCount ?? 0;

  return <div className="member-page">
    <Header />
    {isLoading && <p role="status" className="sr-only">지난 면접 기록을 불러오고 있어요</p>}
    <MemberPageHero eyebrow="히스토리"
      title={isError ? '지난 면접을 다시 살펴봐요' : `지금까지 ${history ? totalSessions : '…'}번 연습했어요.`}
      titleWords={isError ? undefined : ['지금까지', `${history ? totalSessions : '…'}번`, '연습했어요.']}
      description="점수보다 꾸준함이 면접을 바꿔요. 지난 면접을 눌러 다시 복습해 보세요." />
    <MemberPageBody layout="history" loading={isLoading}>
      {isError ? <p role="alert" className="member-notice">면접 기록을 불러오지 못했습니다.</p> : <>
      <HistorySummary totalSessions={totalSessions} weekSessions={weekSessions} />
      <section aria-labelledby="history-records-title">
        <div className="member-history-toolbar">
          <div className="member-history-heading">
            <h2 id="history-records-title" className="member-section-title">지난 면접</h2>
            <div className="member-history-filters" role="group" aria-label="면접 형식 필터">
              {([['QA', '일반 면접'], ['PT', 'PT 면접']] as const).map(([value, label]) =>
                <button type="button" key={value} aria-pressed={formatFilter === value} className={formatFilter === value ? 'on' : ''} onClick={() => setFormatFilter(value)}>{label}</button>)}
            </div>
          </div>
          {formatFilter === 'QA' && <div className="member-history-filters" role="group" aria-label="면접 단계 필터">
            {([['ALL', '전체'], ['TECHNICAL', '기술 면접'], ['PERSONALITY', '인성 면접']] as const).map(([value, label]) =>
              <button type="button" key={value} aria-pressed={stageFilter === value} className={stageFilter === value ? 'on' : ''}
                onClick={() => setStageFilter(value)}>{label}</button>)}
          </div>}
        </div>
        <div className="member-history-groups">
          {formatFilter === 'QA' && (qaHistoryItems.length > 0 || unclassifiedHistoryItems.length === 0) && <section aria-labelledby="history-qa-title">
            <h3 id="history-qa-title" className="member-subsection-title">일반면접 기록</h3>
            <HistoryList items={qaHistoryItems} onSelect={handleSelectHistory} emptyMessage={stageFilter === 'ALL' ? '아직 저장된 일반면접 기록이 없어요.' : '선택한 단계의 일반면접 기록이 없어요.'} />
          </section>}
          {formatFilter === 'PT' && (ptHistoryItems.length > 0 || unclassifiedHistoryItems.length === 0) && <section aria-labelledby="history-pt-title">
            <h3 id="history-pt-title" className="member-subsection-title">PT 면접 기록</h3>
            <HistoryList items={ptHistoryItems} onSelect={handleSelectHistory} emptyMessage="아직 저장된 PT 면접 기록이 없어요." />
          </section>}
          {unclassifiedHistoryItems.length > 0 && <section aria-labelledby="history-unclassified-title">
            <h3 id="history-unclassified-title" className="member-subsection-title">{isResolvingFormats ? '형식 확인 중인 기록' : '형식 미확인 기록'}</h3>
            <p className="mb-4 text-[13px] leading-6 text-[#8A857D]" role="status">
              {isResolvingFormats ? '면접 형식을 확인하고 있어요. 기록은 먼저 확인할 수 있어요.' : '일부 기록의 면접 형식을 확인하지 못했어요. 기록을 눌러 결과를 볼 수 있어요.'}
              {!isResolvingFormats && <button type="button" onClick={retry} className="ml-2 underline underline-offset-4">다시 확인</button>}
            </p>
            <HistoryList items={unclassifiedHistoryItems} onSelect={handleSelectHistory} />
          </section>}
        </div>
      </section>
      </>}
    </MemberPageBody>
  </div>;
}
