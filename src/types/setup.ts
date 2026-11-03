export type CompanyType =
  | "BIG_TECH_SW"
  | "SERVICE"
  | "FINANCE_IT";

export type InterviewStage =
  | "TECHNICAL"
  | "PERSONALITY";

export interface CompanyTypeOption {
  code: CompanyType;
  label: string;
  example: string;
}

export interface InterviewStageOption {
  code: InterviewStage;
  label: string;
}

export interface InterviewOptionsData {
  companyTypes: CompanyTypeOption[];
  stages: InterviewStageOption[];
  jobRoleChips: string[];
}

export interface CreateSessionRequest {
  companyType: CompanyType;
  interviewStage: InterviewStage;
  interviewType?: InterviewType;
  prepMinutes?: PrepMinutes;
  companyName?: string;
  jobRole?: string;
  jobDescription?: string;
  docId?: number;
}

export interface CreateSessionData {
  sessionId: number;
  status: "GENERATING";
  generationStatusUrl: string;
}

export type GenerationStatus =
  | "GENERATING"
  | "READY"
  | "FAILED";

export interface GenerationStatusData {
  status: GenerationStatus;
}
export interface InterviewSetup {
  companyType: CompanyType;
  interviewStage: InterviewStage;
  interviewType?: InterviewType;
  prepMinutes?: PrepMinutes;
  companyName: string;
  jobRole: string;
  jobDescription: string;
  docId: number | null;
}
export interface PreparedInterview {
  sessionId: number;
  docId: number | null;
}

export interface LastInterviewSetting {
  setup: InterviewSetup;
  sessionId: number;
  createdAt: string;
}

export interface SavedInterviewSetup extends InterviewSetup {
  userId: number | null;
  sessionId: number;
  savedAt: number;
}

export type InterviewType = "QA" | "PT";

export type PrepMinutes = 10 | 20 | 30;