import Header from "@/components/common/Header";
import MemberPageBody from "@/components/common/MemberPageBody";
import MemberPageHero from "@/components/common/MemberPageHero";
import HistoryList, {
  type InterviewHistoryItem,
} from "@/components/history/HistoryList";
import HistorySummary from "@/components/history/HistorySummary";
import useHistory from "@/hooks/useHistory";
import { useNavigate } from "react-router-dom";
import { companyTypeLabel, interviewStageLabel, scoreValue } from "@/lib/reportDisplay";
import { reportPath } from "@/lib/reportNavigation";

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
  const { history, isLoading, isError, analysisJobs } = useHistory();
  const navigate = useNavigate();

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
        interviewType: session.format ?? session.interviewType ?? "QA",
        date: formatDate(session.createdAt),
        company: session.companyName ?? companyTypeLabel(session.companyType),
        role: session.jobRole ?? "직무 미지정",
        stage: interviewStageLabel(session.interviewStage),
        totalScore: completedReport ? scoreValue(completedReport.totalScore) : score,
        resultState,
      };
    }) ?? [];
  const qaHistoryItems = historyItems.filter(
    (item) => item.interviewType !== "PT"
  );

  const ptHistoryItems = historyItems.filter(
    (item) => item.interviewType === "PT"
  );
  const handleSelectHistory = (id: number) => {
    const selectedItem = historyItems.find((item) => item.id === id);

    navigate(reportPath(id), {
      state: { sessionId: id, isFromHistory: true, interviewType: selectedItem?.interviewType },
    });
  };

  const totalSessions = history?.totalCount ?? 0;
  const weekSessions = history?.weekCount ?? 0;

  return <div className="member-page">
    <Header hideBackButton />
    {isLoading && <p role="status" className="sr-only">지난 면접 기록을 불러오고 있어요</p>}
    <MemberPageHero eyebrow="히스토리"
      title={isError ? '지난 면접을 다시 살펴봐요' : `지금까지 ${history ? totalSessions : '…'}번 연습했어요.`}
      titleWords={isError ? undefined : ['지금까지', <span key="count"><span className="member-history-title-count">{history ? totalSessions : '…'}</span>번</span>, '연습했어요.']}
      description="점수보다 꾸준함이 면접을 바꿔요. 지난 면접을 눌러 다시 복습해 보세요." />
    <MemberPageBody layout="history" loading={isLoading}>
      {isError ? <p role="alert" className="member-notice">면접 기록을 불러오지 못했습니다.</p> : <>
      <HistorySummary totalSessions={totalSessions} weekSessions={weekSessions} />
      <section aria-labelledby="history-records-title">
        <h2 id="history-records-title" className="member-section-title">지난 면접</h2>
        <div className="member-history-groups">
          <section aria-labelledby="history-qa-title">
            <h3 id="history-qa-title" className="member-subsection-title">일반면접 기록</h3>
            <HistoryList items={qaHistoryItems} onSelect={handleSelectHistory} emptyMessage="아직 저장된 일반면접 기록이 없어요." />
          </section>
          <section aria-labelledby="history-pt-title">
            <h3 id="history-pt-title" className="member-subsection-title">PT 면접 기록</h3>
            <HistoryList items={ptHistoryItems} onSelect={handleSelectHistory} emptyMessage="아직 저장된 PT 면접 기록이 없어요." />
          </section>
        </div>
      </section>
      </>}
    </MemberPageBody>
  </div>;
}
