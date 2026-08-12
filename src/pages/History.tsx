import Header from "@/components/common/Header";
import HistoryList, {
  type InterviewHistoryItem,
} from "@/components/history/HistoryList";
import HistorySummary from "@/components/history/HistorySummary";

const HISTORY_ITEMS: InterviewHistoryItem[] = [
  {
    id: 1,
    date: "2026.08.10",
    company: "카카오",
    role: "백엔드",
    stage: "1차 기술 면접",
    score: 78,
  },
  {
    id: 2,
    date: "2026.08.06",
    company: "네이버",
    role: "백엔드",
    stage: "1차 기술 면접",
    score: 82,
  },
  {
    id: 3,
    date: "2026.08.02",
    company: "토스",
    role: "서버 개발자",
    stage: "2차 인성·임원 면접",
    score: 74,
  },
];

export default function History() {
  const totalSessions = HISTORY_ITEMS.length;
  const weekSessions = 2;

  const handleSelectHistory = (id: number) => {
    window.alert(
      `면접 기록 ${id}번 상세 페이지는 API 및 결과 페이지 연결 후 구현할 예정입니다.`,
    );
  };

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
            items={HISTORY_ITEMS}
            onSelect={handleSelectHistory}
          />
        </div>
      </main>
    </div>
  );
}