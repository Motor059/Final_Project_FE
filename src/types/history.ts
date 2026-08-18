export interface SessionItem {
  sessionId: number;
  companyType: string;
  interviewStage: string;
  companyName: string | null;
  jobRole: string | null;
  status: string;
  createdAt: string;
}

export interface HistoryResponse {
  totalCount: number;
  weekCount: number;
  sessions: SessionItem[];
}