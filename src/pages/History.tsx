import Header from "@/components/common/Header";
import PageLoading from "@/components/common/PageLoading";
import MemberPageHero from "@/components/common/MemberPageHero";
import HistoryList, {
  type InterviewHistoryItem,
} from "@/components/history/HistoryList";
import HistorySummary from "@/components/history/HistorySummary";
import useHistory from "@/hooks/useHistory";
import { useNavigate } from "react-router-dom";
import { companyTypeLabel, interviewStageLabel } from "@/lib/reportDisplay";
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
  const { history, isLoading, isError } = useHistory();
  const navigate = useNavigate();

  const historyItems: InterviewHistoryItem[] =
    history?.sessions.map((session) => ({
      id: session.sessionId,
      interviewType: session.format ?? session.interviewType ?? "QA",
      date: formatDate(session.createdAt),
      company: session.companyName ?? companyTypeLabel(session.companyType),
      role: session.jobRole ?? "직무 미지정",
      stage: interviewStageLabel(session.interviewStage),
      totalScore: session.totalScore ?? null,
    })) ?? [];
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

  if (isLoading) return <PageLoading layout="history" title="지난 면접 기록을 불러오고 있어요" />;
  if (isError) return <div className="member-page">
    <Header hideBackButton />
    <MemberPageHero eyebrow="히스토리" title="지난 면접을 다시 살펴봐요" />
    <main className="member-page-container member-page-body"><p role="alert" className="member-notice">면접 기록을 불러오지 못했습니다.</p></main>
  </div>;

  const totalSessions = history?.totalCount ?? 0;
  const weekSessions = history?.weekCount ?? 0;

  return <div className="member-page">
    <Header hideBackButton />
    <MemberPageHero eyebrow="히스토리" title={<>지금까지 {totalSessions}번 연습했어요.</>}
      description="점수보다 꾸준함이 면접을 바꿔요. 지난 면접을 눌러 다시 복습해 보세요." />
    <main className="member-page-container member-page-body">
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
    </main>
  </div>;
}
