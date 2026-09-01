export type CompanyType =
  | "BIG_TECH_SW"
  | "SERVICE"
  | "FINANCE_IT";

export type InterviewStage =
  | "TECHNICAL"
  | "PERSONALITY";

export type SessionStatus =
  | "GENERATING"
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export interface SessionItem {
  sessionId: number;
  companyType: CompanyType;
  interviewStage: InterviewStage;
  companyName: string | null;
  jobRole: string | null;
  status: SessionStatus;
  createdAt: string;
  totalScore?: number;
}

export interface HistoryResponse {
  totalCount: number;
  weekCount: number;
  sessions: SessionItem[];
}