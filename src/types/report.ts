import type { PTTrack } from '@/types/pt';

export interface ReportMeta {
  format?: 'QA' | 'PT';
  companyType: string;
  stage: string;
  companyName: string | null;
  jobTitle: string | null;
  createdAt: string;
}

export interface KeyCoaching {
  weakness: string;
  action: string;
}

export interface RadarAxis {
  axis: string;
  label: string;
  score: number | null;
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
  answer: string | null;
  good: string | null;
  weak: string | null;
  next: string | null;
  weakAxis: string | null;
  improvedAfter: string | null;
  skipped?: boolean;
}

export interface PresentationRequirement {
  requirement: string;
  status: 'COVERED' | 'PARTIAL' | 'MISSING';
  evidence: string | null;
}

export interface ImprovedOutline {
  before: string[];
  after: string[];
}

export interface ScoreBreakdown {
  presentation: number | null;
  qaAverage: number | null;
  presentationWeight: number;
  qaWeight: number;
}

export interface FeedbackCardData {
  cardType?: 'PRESENTATION' | 'QA';
  status?: 'SCORING' | 'COMPLETED' | 'FAILED';
  questionId: number | null;
  num: number;
  shortTitle: string | null;
  topicScore: number | null;
  question: string;
  answer: string | null;
  good: string | null;
  weak: string | null;
  next: string | null;
  weakAxis: string | null;
  improvedAnswer: ImprovedAnswer | null;
  tails: TailQuestion[];
  skipped?: boolean;
  durationSeconds?: number | null;
  track?: PTTrack | null;
  requirements?: PresentationRequirement[];
  improvedOutline?: ImprovedOutline | null;
}

export interface ReportResponseData {
  sessionId: number;
  status?: 'SCORING' | 'COMPLETED';
  meta: ReportMeta;
  keyCoaching: KeyCoaching | null;
  totalScore: number | null;
  scoreBreakdown?: ScoreBreakdown | null;
  verdict: string | null;
  radar: RadarData | null;
  cards: FeedbackCardData[];
}
