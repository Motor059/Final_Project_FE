export type PTTrack = "SECURITY" | "UI_UX" | "AI" | "DATA";

export type PTTaskType = "SERVICE_IMPROVEMENT" | "JOB_PROBLEM_SOLVING";

export interface PTTaskSettings {
  taskType: PTTaskType;
  targetJobRole: string | null;
  trackSelectionRequired: boolean;
  allowedTracks: PTTrack[];
  preparationMinutes: number[];
  presentationSeconds: number;
  practiceNotice: string;
}

export type PTPhase =
  | "PREPARING"
  | "PRESENTING"
  | "GENERATING"
  | "QUESTIONING"
  | "COMPLETED"
  | "CANCELLED";

export type PTNextAction =
  | "SELECT_TRACK"
  | "START_PRESENTATION"
  | "SUBMIT_PRESENTATION"
  | "GENERATE_QUESTION"
  | "ANSWER"
  | "FINISH"
  | "NONE";

export interface PTOptions {
  companies: { companyId: number; companyName: string; settings?: PTTaskSettings | null }[];
  tracks: { code: PTTrack; label: string }[];
  preparationMinutes: number[];
  presentationSeconds: number;
  mainQuestionCount: number;
  followUpQuestionCountPerMain: number;
  totalQuestionCount: number;
}

export interface PTTaskContent {
  title: string;
  serviceDescription: string;
  currentFlow: string[];
  problemSituation: string;
  availableData: string[];
  constraints: string[];
  exerciseAssumptions: string[];
  trackGuidance: Partial<Record<PTTrack, string>>;
  presentationRequirements: string[];
}

export interface PTProgress {
  sessionId: number;
  status: string;
  phase: PTPhase;
  preparationDeadline: string;
  serverTime: string;
  track?: PTTrack | null;
  presentationStartedAt?: string | null;
  presentationDeadline?: string | null;
  presentation?: {
    transcript: string;
    inputType: "TEXT" | "AUDIO";
    submittedAt: string;
  } | null;
  nextAction: PTNextAction;
}

export interface PTSession extends PTProgress {
  format: "PT";
  jobRole?: string | null;
  task: {
    taskId: number;
    version: number;
    companyId: number;
    companyName: string;
    settings?: PTTaskSettings | null;
    content: PTTaskContent;
  };
  preparationMinutes: number;
  preparationStartedAt: string;
  expiresAt?: string | null;
}

export interface PTCreateSessionInput {
  companyId: number;
  preparationMinutes: number;
  jobRole?: string;
}

export interface PTCreateSessionRequest extends PTCreateSessionInput {
  requestId: string;
}

export interface PTTextPresentationRequest {
  requestId: string;
  transcript: string;
}

export interface PTAudioPresentationRequest {
  requestId: string;
  audio: Blob;
  durationSec: number;
}

export type PTPresentationRequest =
  | { inputType: "TEXT"; request: PTTextPresentationRequest }
  | { inputType: "AUDIO"; request: PTAudioPresentationRequest };

export interface PTQuestion {
  questionId: number;
  ordinal: number;
  mainNumber: number;
  followUpNumber: number;
  type: "MAIN" | "FOLLOW_UP";
  content: string;
}

export interface PTQuestionProgress {
  sessionId: number;
  status: string;
  phase: PTPhase;
  answeredCount: number;
  totalQuestionCount: number;
  processing: boolean;
  question?: PTQuestion | null;
  nextAction: PTNextAction;
}

export type PTTextAnswerRequest = PTTextPresentationRequest;
export type PTAudioAnswerRequest = PTAudioPresentationRequest;
export type PTAnswerRequest =
  | { inputType: "TEXT"; request: PTTextAnswerRequest }
  | { inputType: "AUDIO"; request: PTAudioAnswerRequest };

export interface PTAnswerResult {
  answerId: number;
  questionId: number;
  inputType: "TEXT" | "AUDIO";
  transcript: string;
  durationSec?: number | null;
  progress: PTQuestionProgress;
}
