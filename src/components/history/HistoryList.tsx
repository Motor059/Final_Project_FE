import { scoreText, scoreValue } from "@/lib/reportDisplay";
import { LoadingIndicator } from "@/components/common/LoadingState";
import type { AnalysisState } from "@/store/useReportAnalysisStore";

export interface InterviewHistoryItem {
  id: number; interviewType?: "QA" | "PT"; date: string; company: string;
  role: string; stage: string; totalScore: number | null;
  resultState: AnalysisState | "INCOMPLETE";
}
interface HistoryListProps { items: InterviewHistoryItem[]; onSelect: (id: number) => void; emptyMessage?: string; }

const resultLabels: Record<Exclude<InterviewHistoryItem["resultState"], "COMPLETED">, string> = {
  CHECKING: "채점 중",
  SCORING: "채점 중",
  FAILED: "채점 실패",
  ERROR: "상태 확인 필요",
  INCOMPLETE: "면접 미완료",
};

export default function HistoryList({ items, onSelect, emptyMessage }: HistoryListProps) {
  if (!items.length) return <div className="member-empty-state">
    <p>{emptyMessage ?? "아직 저장된 면접 기록이 없어요."}</p>
    <p className="member-empty-caption">모의면접을 완료하면 이곳에서 다시 확인할 수 있어요.</p>
  </div>;

  return <div className="member-history-list">
    {items.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item.id)} className="member-history-card">
      <div className="member-history-details">
        <div className="member-history-meta">
          <span>{item.date}</span>
          <span className={`member-type-badge${item.interviewType === "PT" ? " is-pt" : ""}`}>{item.interviewType === "PT" ? "PT 면접" : "일반면접"}</span>
        </div>
        <p className="member-history-company">{item.company} · {item.role}</p>
        <p className="member-history-stage">{item.stage}</p>
      </div>
      <div className="member-history-result">
        <div className="member-history-score" role="status" aria-live="polite" aria-atomic="true">
          <p>종합 점수</p>
          {item.resultState === "COMPLETED" ? <><strong>{scoreText(item.totalScore)}</strong>{scoreValue(item.totalScore) !== null && <small>점</small>}</>
            : <span className="member-history-status">{(item.resultState === "CHECKING" || item.resultState === "SCORING") && <LoadingIndicator size="sm" />}{resultLabels[item.resultState]}</span>}
        </div>
        <span className="member-history-arrow" aria-hidden="true">→</span>
      </div>
    </button>)}
  </div>;
}
