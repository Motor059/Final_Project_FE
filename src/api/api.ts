// 모든 API 응답의 공통 껍데기 타입
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 세션 조회 응답 데이터 타입 (GET /api/v1/sessions/{id})
export interface SessionData {
  sessionId: number;
  status: 'READY' | 'IN_PROGRESS' | 'COMPLETED'; // 상태값 (수도코드 기반 추론)
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
  followUpType: 'WHY' | 'WHAT_IF' | 'DEEP' | null;
  content: string;
  mainOrder: number;
  followUpOrder: number | null;
  label: string;
  mainProgress: {
    current: number;
    total: number;
  };
}

export type NextActionType = 'FOLLOW_UP' | 'NEXT_MAIN' | 'FINISH' | 'RETRY_INPUT';

// 음성/텍스트 답변 제출 응답 데이터 타입 (POST /api/v1/answers/audio)
export interface AnswerSubmitData {
  answer: {
    answerId: number;
    questionId: number;
    inputType: 'AUDIO' | 'TEXT';
    transcript: string;
    durationSeconds: number | null; // 텍스트 답변 시 null
    sttStatus: 'SUCCESS' | 'PARTIAL' | null; // 텍스트 답변 시 null
  };
  nextAction: {
    type: NextActionType;
    nextQuestionId?: number;
    message?: string;
  };
}

// 주제 건너뛰기 응답 데이터 타입 (POST /api/v1/questions/{qid}/skip)
export interface SkipTopicData {
  nextAction: {
    type: 'NEXT_MAIN' | 'FINISH';
    nextQuestionId?: number;
  };
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