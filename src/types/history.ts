import type { CompanyType, InterviewStage } from "@/types/setup";
export type { CompanyType, InterviewStage } from "@/types/setup";

export type InterviewFormat = "QA" | "PT";

export type SessionStatus =
  | "GENERATING"
  | "READY"
  | "IN_PROGRESS"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED";

export interface SessionItem {
  sessionId: number;
  format: InterviewFormat | null;
  companyType: CompanyType;
  interviewStage: InterviewStage;
  companyName: string | null;
  jobRole: string | null;
  status: SessionStatus;
  createdAt: string;
  totalScore?: number | null;
}

export interface HistoryResponse {
  totalCount: number;
  weekCount: number;
  sessions: SessionItem[];
}
