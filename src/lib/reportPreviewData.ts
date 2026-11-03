import type { FeedbackCardData, ReportResponseData } from "@/types/report";
import type { ReportFeedbackContent, ReportViewDetails } from "@/types/reportView";

const presentation: ReportFeedbackContent = {
  shortTitle: "생성형 AI 상담 도입 방안과 리스크",
  topicScore: 76,
  question: "생성형 AI를 은행 상담 업무에 도입하는 방안과 리스크를 발표하시오",
  answer: "단순 문의부터 AI 상담을 도입하고, 중요한 판단이 필요한 상담은 상담원에게 넘기는 방안을 제안합니다. 답변에 사용하는 자료를 제한하고 개인정보 접근 권한을 분리하겠습니다. 먼저 일부 업무에서 검증한 뒤 정확도와 고객 만족도를 확인하며 확대하겠습니다.",
  good: "결론을 먼저 말하고, 도입 범위와 리스크를 함께 설명했어요. 단계적으로 적용하겠다는 방향도 명확해요.",
  weak: "확인할 지표는 언급했지만 성공 기준과 문제가 생겼을 때의 대응 순서가 구체적이지 않았어요.",
  next: "각 단계마다 확인할 지표와 중단 기준을 하나씩 정리해 보세요. 마지막에는 제안의 핵심을 한 문장으로 다시 말해 주세요.",
  weakAxis: "EVIDENCE",
  improvedAnswer: {
    before: "일부 업무에서 먼저 도입하고 정확도를 확인한 뒤 확대하겠습니다.",
    after: "결론 → 단순 문의부터 적용하는 이유 → 답변 정확도와 상담원 전환율로 검증 → 오류 발생 시 상담원에게 연결 → 검증 후 적용 범위 확대 순서로 발표합니다.",
  },
  tails: [],
};

const ptQuestions: FeedbackCardData[] = [
  {
    questionId: 1, num: 1, shortTitle: "잘못된 답변에 대한 대응", topicScore: 80,
    question: "AI가 잘못된 상품 정보를 안내했다면, 어떤 순서로 대응하시겠어요?",
    answer: "해당 답변이 더 노출되지 않도록 하고 상담원에게 연결하겠습니다. 이후 참조 자료와 답변 기록을 확인해 원인을 찾고 재발을 막겠습니다.",
    good: "고객 보호를 먼저 고려하고, 노출 차단과 원인 확인을 순서대로 설명했어요.",
    weak: "누가 어떤 기준으로 답변을 재개할지까지는 설명하지 않았어요.",
    next: "대응 담당자와 재개 기준을 함께 말해 보세요.", weakAxis: "DEPTH",
    improvedAnswer: { before: "원인을 찾고 재발을 막겠습니다.", after: "오류 응답의 노출을 중단하고 상담원에게 연결한 뒤, 담당자가 자료와 답변을 검토합니다. 정해진 검증 항목을 통과한 후에만 해당 범위의 응답을 재개하겠습니다." },
    tails: [{ strategy: "WHAT_IF", question: "같은 오류가 반복된다면 어떻게 하시겠어요?", answer: "해당 유형의 자동 응답을 중단하고 사람이 확인하도록 바꾸겠습니다.", good: "자동화 범위를 조정하겠다는 판단이 명확해요.", weak: "반복 오류를 판단하는 기준이 없었어요.", next: "오류율이나 반복 횟수처럼 판단 기준을 덧붙여 주세요.", weakAxis: "EVIDENCE", improvedAfter: "반복 오류의 빈도를 기준으로 자동 응답 범위를 줄이고, 원인이 해결될 때까지 사람이 검토하도록 하겠습니다." }],
  },
  {
    questionId: 2, num: 2, shortTitle: "도입 효과를 확인하는 기준", topicScore: 79,
    question: "단계적인 도입이 효과적이었는지는 무엇으로 확인하시겠어요?",
    answer: "답변 정확도, 상담 대기 시간과 상담원 전환율을 같이 보겠습니다. 빠르게 응답해도 정확하지 않다면 범위를 늘리지 않겠습니다.",
    good: "속도와 정확도를 함께 보겠다는 기준이 균형 잡혀 있어요.",
    weak: "도입 전후를 비교하는 방법이 빠졌어요.", next: "같은 유형의 문의를 기준으로 도입 전후를 비교하는 방식을 설명해 보세요.", weakAxis: "EVIDENCE",
    improvedAnswer: { before: "상담 대기 시간이 줄었는지 확인하겠습니다.", after: "동일한 문의 유형의 도입 전후 대기 시간과 답변 정확도를 비교하고, 상담원 전환율과 고객 피드백을 함께 확인하겠습니다." }, tails: [],
  },
];

const repoQuestions: FeedbackCardData[] = [
  {
    questionId: 11, num: 1, shortTitle: "주문 조회 캐시와 데이터 일관성", topicScore: 82,
    question: "주문 조회에 캐시를 적용하셨는데, 주문 상태가 바뀔 때 캐시와 데이터베이스의 일관성은 어떻게 유지하시나요?",
    answer: "읽기 요청에는 캐시를 사용하고 주문이 변경되면 관련 캐시를 삭제합니다. 변경 트랜잭션이 완료된 후에 삭제되도록 처리하고, 만료 시간도 함께 설정했습니다.",
    good: "갱신 이후의 캐시 삭제 시점과 만료 시간을 함께 설명했어요.",
    weak: "변경 직후 동시 조회가 들어오는 경우와 캐시 삭제 실패 상황은 설명하지 않았어요.",
    next: "동시 요청과 캐시 장애 상황을 하나씩 가정해 처리 방식을 덧붙여 보세요.", weakAxis: "TECH_CHOICE",
    improvedAnswer: { before: "주문이 변경되면 캐시를 삭제합니다.", after: "변경 트랜잭션이 커밋된 이후에 관련 캐시를 무효화합니다. 실패 시 재시도와 TTL로 오래된 데이터의 유지 시간을 제한하고, 일관성이 중요한 조회는 데이터베이스에서 직접 처리합니다." },
    tails: [{ strategy: "WHY", question: "캐시를 갱신하는 대신 삭제하는 방식을 고른 이유는 무엇인가요?", answer: "실제로 다시 조회되는 데이터만 캐시에 넣어 갱신 경합을 줄이기 위해서입니다.", good: "선택 이유를 조회 패턴과 연결했어요.", weak: "삭제 후 첫 조회의 비용도 고려하면 더 좋아요.", next: "조회 지연과 캐시 적중률 사이의 선택을 함께 말해 주세요.", weakAxis: "TECH_CHOICE", improvedAfter: "삭제 후 첫 조회의 비용은 감수하되, 불필요한 갱신을 줄이고 여러 쓰기 요청이 캐시를 덮어쓰는 경합을 피하기 위해 선택했습니다." }],
  },
  {
    questionId: 12, num: 2, shortTitle: "프로젝트의 성능 개선 결과", topicScore: 74,
    question: "캐시를 적용한 뒤 성능이 개선됐는지는 어떻게 확인했나요?",
    answer: "동일한 요청을 반복하는 부하 테스트를 통해 응답 시간과 데이터베이스 조회 수를 비교했습니다.",
    good: "개선 전후를 같은 조건에서 비교했어요.", weak: "측정 조건과 실제 수치를 제시하지 않았어요.", next: "동시 사용자 수와 응답 시간의 전후 수치를 한 문장에 넣어 보세요.", weakAxis: "IMPACT",
    improvedAnswer: { before: "응답 속도가 빨라졌습니다.", after: "동시 사용자 수와 요청 비율을 고정한 테스트에서 캐시 적용 전후의 p95 응답 시간과 DB 조회 수를 비교해 효과를 확인했습니다." }, tails: [],
  },
];

export function createReportPreview(kind: "PT" | "REPO", missingDetails: boolean): { data: ReportResponseData; details: ReportViewDetails } {
  const isPT = kind === "PT";
  const data: ReportResponseData = {
    sessionId: isPT ? 900001 : 900002,
    meta: { companyType: isPT ? "FINANCE_IT" : "SERVICE", stage: "TECHNICAL", companyName: "", jobTitle: "백엔드 개발자", createdAt: "2026-11-03T14:30:00+09:00" },
    keyCoaching: isPT
      ? { weakness: "방향은 명확해요. 실행 기준을 더 구체적으로 설명해 보세요.", action: "방안 하나마다 확인할 지표와 문제가 생겼을 때의 대응을 함께 말해 보세요." }
      : { weakness: "기술 선택을 설명할 때, 예외 상황과 개선 수치까지 연결해 보세요.", action: "다음 면접에서는 선택 이유, 실패 상황, 확인한 결과를 한 흐름으로 정리해 보세요." },
    totalScore: 78,
    verdict: isPT ? "발표의 구조와 핵심 주장은 명확해요. 근거와 실행 조건을 구체화하면 설득력이 더 좋아져요." : "코드에 적용한 기술의 목적을 잘 설명했어요. 동시 요청과 장애 상황에 대한 설명을 더해 보세요.",
    radar: {
      type: isPT ? "PT" : "TECHNICAL",
      axes: isPT ? [
        { axis: "STRUCTURE", label: "구조·논리 전개", score: 84 },
        { axis: "EVIDENCE", label: "근거·구체성", score: 65 },
        { axis: "RELEVANCE", label: "주제 적합성", score: 86 },
        { axis: "DEPTH", label: "이해 깊이·실행 가능성", score: 72 },
        { axis: "DELIVERY", label: "전달력·설득력", score: 79 },
        { axis: "CONSISTENCY", label: "일관성", score: 82 },
      ] : [
        { axis: "ACCURACY", label: "정확성", score: 86 },
        { axis: "DEPTH", label: "깊이", score: 74 },
        { axis: "PROBLEM_SOLVING", label: "문제 해결", score: 80 },
        { axis: "TECH_CHOICE", label: "기술 선택 근거", score: 82 },
        { axis: "EXPLANATION", label: "설명력", score: 79 },
        { axis: "IMPACT", label: "결과·임팩트", score: 65 },
      ],
    },
    cards: isPT ? ptQuestions : repoQuestions,
  };
  return {
    data,
    details: isPT ? {
      interviewType: "PT",
      presentation: {
        durationSeconds: missingDetails ? null : 312,
        note: "결론: 단순 문의부터 단계적으로 도입\n근거: 대기 시간 개선, 상담원의 복잡한 업무 집중\n리스크: 잘못된 답변, 개인정보 노출\n대응: 검증 자료 참조, 권한 분리, 상담원 연결",
        feedback: presentation,
      },
    } : {
      interviewType: "QA",
      evidenceByQuestionId: missingDetails ? {} : {
        11: [
          { repositoryName: "example/order-service", path: "src/main/java/com/example/order/application/service/OrderQueryService.java" },
          { repositoryName: "example/order-service", path: "src/main/java/com/example/order/infrastructure/cache/config/RedisCacheConfiguration.java" },
        ],
      },
    },
  };
}
