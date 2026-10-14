const companyLabels: Record<string, string> = {
  BIG_TECH_SW: '대기업 SW', SERVICE: '서비스 기업', FINANCE_IT: '금융 IT',
};
const stageLabels: Record<string, string> = {
  TECHNICAL: '기술 면접', PERSONALITY: '인성·임원 면접', FINANCE_TECHNICAL: '금융 IT 기술 면접',
};
const strategyLabels: Record<string, string> = {
  WHY: '선택 이유', WHAT_IF: '상황 가정', DEEP: '심층 탐구',
  ACTION: '구체적 행동', RESULT: '결과 확인', REFLECTION: '자기성찰',
};
const axisLabels: Record<string, string> = {
  ACCURACY: '정확성', CORRECTNESS: '정확성', DEPTH: '깊이',
  PROBLEM_SOLVING: '문제 해결', TECH_CHOICE: '기술 선택 근거',
  TECH_CHOICE_REASON: '기술 선택 근거', TECH_SELECTION: '기술 선택 근거',
  TECHNICAL_REASONING: '기술 선택 근거', EXPLANATION: '설명력', CLARITY: '설명력',
  COMMUNICATION: '설명력', IMPACT: '결과·임팩트', RESULT_IMPACT: '결과·임팩트',
  FINANCE_DOMAIN: '금융 도메인 이해', DOMAIN_KNOWLEDGE: '금융 도메인 이해',
  FINANCE_DOMAIN_UNDERSTANDING: '금융 도메인 이해',
  SITUATION: '상황·과제', TASK: '상황·과제', SITUATION_TASK: '상황·과제',
  ACTION: '행동 구체성', ACTION_SPECIFICITY: '행동 구체성',
  CONTRIBUTION: '본인 기여', OWN_CONTRIBUTION: '본인 기여',
  RESULT: '결과 제시', REFLECTION: '자기성찰',
  AUTHENTICITY: '진정성·일관성', CONSISTENCY: '진정성·일관성',
  AUTHENTICITY_CONSISTENCY: '진정성·일관성', JOB_FIT: '직무·조직 적합',
  ORGANIZATION_FIT: '직무·조직 적합', JOB_ORGANIZATION_FIT: '직무·조직 적합',
};
const codeKey = (value?: string | null) => (value || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
const isCode = (value: string) => /^[A-Za-z][A-Za-z0-9_ -]*$/.test(value);

export const companyTypeLabel = (value?: string | null) => companyLabels[codeKey(value)] || '기업 유형 미지정';
export const interviewStageLabel = (value?: string | null) => stageLabels[codeKey(value)] || '면접';
export const followUpLabel = (value?: string | null) => strategyLabels[codeKey(value)] || '꼬리 질문';

export function axisLabel(axis?: string | null, label?: string | null, fallback = '평가 항목') {
  const text = (label || '').trim();
  if (text && !isCode(text)) return text;
  return axisLabels[codeKey(text)] || axisLabels[codeKey(axis)] || fallback;
}

export function weakAxisLabel(value?: string | null) {
  const text = (value || '').trim();
  if (!text) return '평가 정보 없음';
  return isCode(text) ? axisLabel(text) : text;
}

export function scoreValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

export function scoreText(value: unknown) {
  const score = scoreValue(value);
  return score === null ? '-' : String(Math.round(score * 10) / 10);
}

export function scoreColor(value: unknown) {
  const score = scoreValue(value);
  if (score === null) return '#78716C';
  if (score >= 80) return '#15803D';
  if (score >= 60) return '#A16207';
  return '#9A3412';
}
