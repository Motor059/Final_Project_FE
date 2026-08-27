import Header from "@/components/common/Header";
import HistoryList, {
  type InterviewHistoryItem,
} from "@/components/history/HistoryList";
import HistorySummary from "@/components/history/HistorySummary";
import useHistory from "@/hooks/useHistory";

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

const formatCompanyType = (companyType: string) => {
  switch (companyType) {
    case "BIG_TECH_SW":
      return "대기업 SW";
    case "SERVICE":
      return "서비스 기업";
    case "FINANCE_IT":
      return "금융 IT";
    default:
      return companyType;
  }
};

const formatInterviewStage = (interviewStage: string) => {
  switch (interviewStage) {
    case "TECHNICAL":
      return "기술 면접";
    case "PERSONALITY":
      return "인성·임원 면접";
    default:
      return interviewStage;
  }
};

export default function History() {
  const { history, isLoading, isError } = useHistory();

  const historyItems: InterviewHistoryItem[] =
    history?.sessions.map((session) => ({
      id: session.sessionId,
      date: formatDate(session.createdAt),
      company: session.companyName ?? formatCompanyType(session.companyType),
      role: session.jobRole ?? "직무 미지정",
      stage: formatInterviewStage(session.interviewStage),
    })) ?? [];

  const handleSelectHistory = (id: number) => {
    window.alert(
      `면접 기록 ${id}번 상세 페이지는 결과 페이지 연결 후 구현할 예정입니다.`,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto w-full max-w-[780px] px-6 py-14 md:px-10 md:py-16">
          <p className="text-[14px] text-muted-foreground">
            면접 기록을 불러오는 중입니다.
          </p>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto w-full max-w-[780px] px-6 py-14 md:px-10 md:py-16">
          <p className="text-[14px] text-muted-foreground">
            면접 기록을 불러오지 못했습니다.
          </p>
        </main>
      </div>
    );
  }

  const totalSessions = history?.totalCount ?? 0;
  const weekSessions = history?.weekCount ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[780px] px-6 py-14 md:px-10 md:py-16">
        <header>
          <p className="text-[13px] font-medium text-muted-foreground">
            히스토리
          </p>

          <h1 className="mt-2 text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-foreground md:text-[38px]">
            지금까지 {totalSessions}번 연습했어요.
          </h1>

          <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
            점수보다 꾸준함이 면접을 바꿉니다. 지난 면접을 눌러 다시
            복습해보세요.
          </p>
        </header>

        <div className="mt-9">
          <HistorySummary
            totalSessions={totalSessions}
            weekSessions={weekSessions}
          />
        </div>

        <div className="mt-10">
          <HistoryList
            items={historyItems}
            onSelect={handleSelectHistory}
          />
        </div>
      </main>
    </div>
  );
}