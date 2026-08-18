// src/data/mockReportData.ts
import type { ReportResponseData } from '@/types/report';

export const mockReportData: ReportResponseData = {
  sessionId: 12,
  meta: {
    companyType: "SERVICE",
    stage: "TECHNICAL",
    companyName: "카카오",
    jobTitle: "백엔드",
    createdAt: "2026-07-06T14:30:00+09:00"
  },
  keyCoaching: {
    weakness: "5개 답변 중 3개에서 결과를 수치로 제시하지 않았어요. 문제는 잘 풀었는데, 그게 얼마나 좋아졌는지를 증명하지 못하고 있습니다.",
    action: "다음엔 모든 답변을 '그래서 ~가 ~% 개선됐다'로 끝내보세요. 면접관은 기술을 아는지보다, 그 기술로 결과를 냈는지를 봅니다."
  },
  totalScore: 78,
  verdict: "구조는 좋은데 구체성이 부족해요.",
  radar: {
    type: "TECHNICAL",
    axes: [
      { axis: "ACCURACY", label: "정확성", score: 80 },
      { axis: "DEPTH", label: "깊이", score: 72 },
      { axis: "PROBLEM_SOLVING", label: "문제 해결", score: 82 },
      { axis: "TECH_RATIONALE", label: "기술 선택 근거", score: 66 },
      { axis: "EXPLANATION", label: "설명력", score: 85 },
      { axis: "RESULT_IMPACT", label: "결과·임팩트", score: 58 }
    ]
  },
  cards: [
    {
      questionId: 101,
      num: 1,
      shortTitle: "동시성 문제 해결 경험",
      topicScore: 82,
      question: "최근 프로젝트에서 동시성 문제를 어떻게 해결했나요?",
      answer: "Redis 분산 락으로 해결했습니다...",
      good: "문제 상황을 명확히 짚었어요.",
      weak: "왜 Redis였는지 근거가 빠졌어요.",
      next: "DB 락 대비 선택 이유를 한 문장 붙여보세요.",
      weakAxis: ["TECH_RATIONALE", "RESULT_IMPACT"],
      improvedAnswer: {
        before: "동시성 문제를 Redis 분산 락으로 해결했습니다.",
        after: "초당 1000건에서 race condition이 발생했고, Redis 분산 락 적용 후 중복 처리가 0건이 되었습니다."
      },
      tails: [
        {
          strategy: "Why",
          question: "왜 DB 락이 아니라 Redis 분산 락을 선택하셨나요?",
          answer: "DB 락은 커넥션을 오래 잡아 부하가 커질 때 병목이 될 것 같았습니다.",
          good: "비교 대상(DB 락)을 명시해 선택 근거를 구조화했어요.",
          weak: "\"클 것 같다\"는 추측으로만 끝나 수치 근거가 빠졌어요.",
          next: "\"부하 테스트에서 DB 락은 200ms, Redis는 5ms\"처럼 수치로 근거를 완성하세요.",
          weakAxisText: "기술 선택 근거 축이 약했어요. 비교 대상은 짚었지만 수치 근거 없이 추측으로 끝났습니다.",
          improvedAnswer: {
            before: "DB 락은 커넥션을 오래 잡아 부하가 커질 때 병목이 될 것 같았습니다.",
            after: "DB 락은 커넥션을 오래 점유해 초당 1,000건 부하 테스트 시 200ms 지연이 발생했고, Redis 락은 5ms여서 선택했습니다."
          }
        },
        {
          strategy: "What-if",
          question: "트래픽이 지금보다 10배로 늘어난다면 어떻게 대응하시겠어요?",
          answer: "락 경합이 늘 것 같은데 부하 테스트는 안 해봤습니다.",
          good: "한계를 솔직히 인정해 신뢰감을 줬어요.",
          weak: "대안 없이 열린 문장으로 끝나 아쉬웠어요.",
          next: "\"이후 Redis 클러스터 샤딩으로 전환을 고려하겠다\"처럼 한 줄 대안으로 닫으세요.",
          weakAxisText: "미래 상황에 대한 설계 고민이 부족했습니다.",
          improvedAnswer: {
            before: "락 경합이 늘 것 같은데 부하 테스트는 안 해봤습니다.",
            after: "현재 단일 Redis로 처리 중이나, 트래픽 10배 증가 시 Redis 클러스터로 전환해 샤딩을 적용하겠습니다."
          }
        }
      ]
    }
  ],
  delivery: {
    speechSpeed: "적절",
    speechSpeedNote: "분당 음절 수가 안정적이에요.",
    fillerWordCount: 12,
    fillerWordNote: "'음', '어'가 반복됐어요."
  }
};