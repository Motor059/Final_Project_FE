import type { CompanyType, InterviewStage } from "@/types/setup";
export type { CompanyType, InterviewStage } from "@/types/setup";

export type SessionStatus =
  | "GENERATING"
  | "READY"
  | "IN_PROGRESS"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED";

export interface SessionItem {
  sessionId: number;
  interviewType?: "QA" | "PT";
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