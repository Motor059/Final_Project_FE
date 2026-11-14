import { scoreText, scoreValue } from "@/lib/reportDisplay";

export interface InterviewHistoryItem {
  id: number; interviewType?: "QA" | "PT"; date: string; company: string;
  role: string; stage: string; totalScore: number | null;
}
interface HistoryListProps { items: InterviewHistoryItem[]; onSelect: (id: number) => void; emptyMessage?: string; }

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
        <div className="member-history-score"><p>종합 점수</p><strong>{scoreText(item.totalScore)}</strong>{scoreValue(item.totalScore) !== null && <small>점</small>}</div>
        <span className="member-history-arrow" aria-hidden="true">→</span>
      </div>
    </button>)}
  </div>;
}
