export interface ReportMeta {
  companyType: string;
  stage: string;
  companyName: string;
  jobTitle: string;
  createdAt: string;
}

export interface KeyCoaching {
  weakness: string;
  action: string;
}

export interface RadarAxis {
  axis: string;
  label: string;
  score: number;
}

export interface RadarData {
  type: string;
  axes: RadarAxis[];
}

export interface ImprovedAnswer {
  before: string;
  after: string;
}

export interface TailQuestion {
  strategy: string;
  question: string;
  answer: string;
  good: string;
  weak: string;
  next: string;
  weakAxis: string;
  improvedAfter: string;
}

export interface FeedbackCardData {
  questionId: number;
  num: number;
  shortTitle: string;
  topicScore: number;
  question: string;
  answer: string;
  good: string;
  weak: string;
  next: string;
  weakAxis: string;
  improvedAnswer: ImprovedAnswer;
  tails: TailQuestion[];
}

export interface DeliveryInfo {
  speechSpeed: string | null;
  speechSpeedNote: string | null;
  fillerWordCount: number | null;
  fillerWordNote: string | null;
}

export interface ReportResponseData {
  sessionId: number;
  meta: ReportMeta;
  keyCoaching: KeyCoaching;
  totalScore: number;
  verdict: string;
  radar: RadarData;
  cards: FeedbackCardData[];
  delivery: DeliveryInfo;
}