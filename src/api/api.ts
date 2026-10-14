export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 세션 조회 응답 데이터 타입 (GET /api/v1/sessions/{id})
export interface SessionData {
  sessionId: number;
  status: 'READY' | 'IN_PROGRESS' | 'COMPLETED';
  companyType: string;
  interviewStage: string;
  companyName: string;
  jobRole: string;
  mainProgress: {
    current: number;
    total: number;
  };
}

// 현재 질문 조회 응답 데이터 타입 (GET /api/v1/sessions/{id}/current-question)
export interface CurrentQuestionData {
  questionId: number;
  type: 'MAIN' | 'FOLLOW_UP';
  followUpType: 'WHY' | 'WHAT_IF' | 'DEEP' | 'ACTION' | 'RESULT' | 'REFLECTION' | null;
  content: string;
  seq?: number;
  mainOrder: number;
  followUpOrder: number | null;
  label: string;
  mainProgress: {
    current: number;
    total: number;
  };
}

export type NextActionType = 'FOLLOW_UP' | 'NEXT_MAIN' | 'FINISH' | 'RETRY_INPUT';

export interface NextAction<T extends NextActionType = NextActionType> {
  type: T;
  nextQuestionId?: number;
  message?: string;
}

export interface TextAnswerRequest {
  questionId: number;
  transcript: string;
}

// 답변 제출 응답 (POST /api/v1/sessions/{id}/answers/audio, text)
export interface AnswerSubmitData {
  answer: {
    answerId: number;
    questionId: number;
    inputType: 'AUDIO' | 'TEXT';
    transcript: string;
    durationSeconds: number | null;
    sttStatus: 'SUCCESS' | 'PARTIAL' | null;
  };
  nextAction: NextAction;
}

// 질문 건너뛰기 응답 (POST /api/v1/questions/{qid}/skip?sessionId={sessionId})
export interface SkipTopicData {
  answer: {
    answerId: number;
    questionId: number;
    inputType: 'SKIP';
    transcript: null;
    durationSeconds: null;
    sttStatus: null;
  };
  nextAction: NextAction<'FOLLOW_UP' | 'NEXT_MAIN' | 'FINISH'>;
}

// 채점 시작 요청 응답 타입 (POST /api/v1/sessions/{id}/feedback)
export interface StartScoringData {
  sessionId: number;
  statusUrl: string;
}

// 채점 상태 폴링 응답 타입 (GET /api/v1/sessions/{id}/feedback/status)
export interface PollingStatusData {
  sessionId: number;
  status: 'SCORING' | 'COMPLETED' | 'FAILED';
}

// 면접 시작 응답 데이터 타입 (POST /api/v1/sessions/{id}/start)
export interface StartInterviewData {
  sessionId: number;
  status: string;
  firstQuestion: {
    questionId: number;
    seq: number;
    content: string;
  };
}

// 채점 요청 응답 데이터 타입 (POST /api/v1/sessions/{id}/analyze)
export interface AnalyzeSessionData {
  sessionId: number;
  status: string;
}
