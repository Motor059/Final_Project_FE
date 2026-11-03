import type { FeedbackCardData } from "@/types/report";

export type ReportFeedbackContent = Omit<FeedbackCardData, "questionId" | "num">;

export interface RepositoryEvidenceFile {
  path: string;
  repositoryName?: string;
}

export interface ReportViewDetails {
  interviewType?: "QA" | "PT";
  presentation?: {
    durationSeconds: number | null;
    note?: string;
    feedback?: ReportFeedbackContent;
  };
  evidenceByQuestionId?: Record<number, readonly RepositoryEvidenceFile[]>;
}
