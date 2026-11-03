import type { ArchiveCompany, ArchiveRecord } from "@/types/archive";

const seed: { companies: ArchiveCompany[]; records: ArchiveRecord[] } = {
  "companies": [
    {
      "id": "1",
      "name": "카카오",
      "display": "카카오",
      "listed": true,
      "aliases": [
        "kakao"
      ]
    },
    {
      "id": "2",
      "name": "비바리퍼블리카",
      "display": "토스",
      "listed": false,
      "aliases": [
        "toss",
        "토스"
      ]
    },
    {
      "id": "3",
      "name": "삼성전자",
      "display": "삼성전자",
      "listed": true,
      "aliases": [
        "samsung",
        "삼성"
      ]
    },
    {
      "id": "4",
      "name": "신한은행",
      "display": "신한은행",
      "listed": false,
      "aliases": [
        "shinhan"
      ]
    },
    {
      "id": "5",
      "name": "네이버",
      "display": "네이버",
      "listed": true,
      "aliases": [
        "naver"
      ]
    },
    {
      "id": "6",
      "name": "한국카카오은행",
      "display": "카카오뱅크",
      "listed": true,
      "aliases": [
        "kakaobank",
        "카뱅"
      ]
    },
    {
      "id": "7",
      "name": "엘지씨엔에스",
      "display": "LG CNS",
      "listed": true,
      "aliases": [
        "lgcns",
        "lg cns"
      ]
    },
    {
      "id": "8",
      "name": "쿠팡",
      "display": "쿠팡",
      "listed": false,
      "aliases": [
        "coupang"
      ]
    },
    {
      "id": "9",
      "name": "에스케이하이닉스",
      "display": "SK하이닉스",
      "listed": true,
      "aliases": [
        "skhynix",
        "하이닉스"
      ]
    },
    {
      "id": "10",
      "name": "국민은행",
      "display": "KB국민은행",
      "listed": false,
      "aliases": [
        "kb",
        "국민은행"
      ]
    },
    {
      "id": "11",
      "name": "우아한형제들",
      "display": "배달의민족",
      "listed": false,
      "aliases": [
        "배민",
        "baemin",
        "woowahan"
      ]
    },
    {
      "id": "12",
      "name": "카카오페이",
      "display": "카카오페이",
      "listed": true,
      "aliases": [
        "kakaopay"
      ]
    }
  ],
  "records": [
    {
      "id": "k1",
      "companyId": "1",
      "companyType": "service",
      "format": "qa",
      "stage": "tech",
      "period": "2026-06",
      "role": "백엔드",
      "tip": "자소서 기반으로 꼬리 질문이 3~4단계까지 이어졌어요. 화이트보드 없이 말로만 진행했어요.",
      "mine": false,
      "reported": false,
      "order": 19,
      "questions": [
        {
          "id": "seed-question-0",
          "text": "Kafka를 쓰셨다고 했는데, 컨슈머가 같은 메시지를 두 번 받으면 어떻게 처리하나요?",
          "likes": 41
        },
        {
          "id": "seed-question-1",
          "text": "컨슈머 랙이 계속 쌓이면 어디부터 확인하시겠어요?",
          "likes": 12
        },
        {
          "id": "seed-question-2",
          "text": "파티션 수를 늘리면 메시지 순서는 어떻게 되나요?",
          "likes": 9
        }
      ]
    },
    {
      "id": "t1",
      "companyId": "2",
      "companyType": "fintech",
      "format": "qa",
      "stage": "tech",
      "period": "2026-06",
      "role": "백엔드",
      "tip": "라이브 코딩 직후 이어진 질문이에요. 설계 이유를 계속 물어봤어요.",
      "mine": false,
      "reported": false,
      "order": 16,
      "questions": [
        {
          "id": "seed-question-3",
          "text": "송금 API에서 멱등성을 어떻게 보장하시겠어요? 네트워크가 끊겨 클라이언트가 재요청하는 상황을 가정해 주세요.",
          "likes": 63
        },
        {
          "id": "seed-question-4",
          "text": "멱등 키는 어디에 얼마나 오래 저장하시겠어요?",
          "likes": 15
        }
      ]
    },
    {
      "id": "s5",
      "companyId": "4",
      "companyType": "fintech",
      "format": "pt",
      "stage": "tech",
      "period": "2026-05",
      "role": "IT 개발",
      "tip": "준비 20분, 발표 5분 뒤 질문이 두세 개 이어졌어요.",
      "mine": false,
      "reported": false,
      "order": 14,
      "questions": [
        {
          "id": "seed-question-5",
          "text": "생성형 AI를 은행 상담 업무에 도입하는 방안과 리스크를 발표하시오.",
          "likes": 27
        }
      ]
    },
    {
      "id": "s6",
      "companyId": "1",
      "companyType": "service",
      "format": "qa",
      "stage": "exec",
      "period": "2026-05",
      "role": "백엔드",
      "tip": "컬처핏 면접이었어요. 분위기는 편했지만 답변마다 이유를 두세 번 물어요.",
      "mine": false,
      "reported": false,
      "order": 13,
      "questions": [
        {
          "id": "seed-question-6",
          "text": "팀원과 의견이 갈렸을 때 본인 주장을 끝까지 밀어붙인 적이 있나요? 결과는 어땠나요?",
          "likes": 22
        }
      ]
    },
    {
      "id": "s7",
      "companyId": "3",
      "companyType": "large",
      "format": "qa",
      "stage": "tech",
      "period": "2026-05",
      "role": "백엔드",
      "tip": "직무 PT 뒤에 기술 질문이 몇 개 이어졌어요. 기본 CS 위주였어요.",
      "mine": false,
      "reported": false,
      "order": 12,
      "questions": [
        {
          "id": "seed-question-7",
          "text": "프로세스와 스레드의 차이를 설명하고, 본인 프로젝트에서 멀티스레드를 쓴 경험을 말해 주세요.",
          "likes": 58
        }
      ]
    },
    {
      "id": "s8",
      "companyId": "3",
      "companyType": "large",
      "format": "pt",
      "stage": "tech",
      "period": "2026-04",
      "role": "백엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 11,
      "questions": [
        {
          "id": "seed-question-8",
          "text": "트랜잭션 격리 수준을 설명하고, 서비스에 어떤 수준을 적용할지 근거와 함께 발표하시오.",
          "likes": 33
        }
      ]
    },
    {
      "id": "s9",
      "companyId": "5",
      "companyType": "service",
      "format": "qa",
      "stage": "tech",
      "period": "2026-04",
      "role": "프론트엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 10,
      "questions": [
        {
          "id": "seed-question-9",
          "text": "브라우저 렌더링 과정을 설명하고, 리플로우를 줄이려고 해본 것을 말해 주세요.",
          "likes": 36
        }
      ]
    },
    {
      "id": "s10",
      "companyId": "6",
      "companyType": "fintech",
      "format": "qa",
      "stage": "tech",
      "period": "2026-04",
      "role": "백엔드",
      "tip": "사전 과제 코드를 화면에 띄워놓고 질문이 시작됐어요.",
      "mine": false,
      "reported": false,
      "order": 9,
      "questions": [
        {
          "id": "seed-question-10",
          "text": "분산 트랜잭션 없이 계좌 이체의 정합성을 맞추려면 어떻게 설계하시겠어요?",
          "likes": 45
        }
      ]
    },
    {
      "id": "s11",
      "companyId": "7",
      "companyType": "large",
      "format": "qa",
      "stage": "exec",
      "period": "2026-04",
      "role": "백엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 8,
      "questions": [
        {
          "id": "seed-question-11",
          "text": "입사 후 5년 뒤 어떤 개발자가 되어 있을 것 같나요? 그걸 위해 지금 하고 있는 건 무엇인가요?",
          "likes": 11
        }
      ]
    },
    {
      "id": "s12",
      "companyId": "1",
      "companyType": "service",
      "format": "qa",
      "stage": "tech",
      "period": "2026-03",
      "role": "백엔드",
      "tip": "기술 면접 2:1이었어요. 제 프로젝트 README를 미리 읽고 오신 것 같았어요.",
      "mine": true,
      "reported": false,
      "order": 7,
      "questions": [
        {
          "id": "seed-question-12",
          "text": "Redis를 캐시로 쓰다가 장애가 나면 서비스는 어떻게 되나요? 대비책이 있었나요?",
          "likes": 21
        }
      ]
    },
    {
      "id": "s13",
      "companyId": "8",
      "companyType": "service",
      "format": "qa",
      "stage": "tech",
      "period": "2026-03",
      "role": "백엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 6,
      "questions": [
        {
          "id": "seed-question-13",
          "text": "주문이 몰리는 상황에서 재고 차감을 어떻게 설계하시겠어요?",
          "likes": 30
        }
      ]
    },
    {
      "id": "s14",
      "companyId": "9",
      "companyType": "large",
      "format": "qa",
      "stage": "tech",
      "period": "2026-02",
      "role": "데이터",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 5,
      "questions": [
        {
          "id": "seed-question-14",
          "text": "인덱스를 걸었는데도 느린 쿼리가 있었다면 원인을 어떻게 찾으시겠어요?",
          "likes": 14
        }
      ]
    },
    {
      "id": "s15",
      "companyId": "10",
      "companyType": "fintech",
      "format": "qa",
      "stage": "exec",
      "period": "2026-02",
      "role": "IT 개발",
      "tip": "임원 면접이었어요. 지원 동기를 꽤 깊게 파고들었어요.",
      "mine": false,
      "reported": false,
      "order": 4,
      "questions": [
        {
          "id": "seed-question-15",
          "text": "은행 IT와 핀테크 기업 IT는 무엇이 다르다고 생각하나요? 왜 은행을 선택했나요?",
          "likes": 19
        }
      ]
    },
    {
      "id": "s16",
      "companyId": "11",
      "companyType": "service",
      "format": "qa",
      "stage": "tech",
      "period": "2026-01",
      "role": "백엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 3,
      "questions": [
        {
          "id": "seed-question-16",
          "text": "서비스 장애가 났을 때 가장 먼저 무엇을 확인하나요?",
          "likes": 24
        }
      ]
    },
    {
      "id": "s17",
      "companyId": "1",
      "companyType": "service",
      "format": "qa",
      "stage": "tech",
      "period": "2025-12",
      "role": "백엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 2,
      "questions": [
        {
          "id": "seed-question-17",
          "text": "JPA에서 N+1 문제가 생기는 이유와, 본인이 해결한 방법을 설명해 주세요.",
          "likes": 38
        }
      ]
    },
    {
      "id": "s18",
      "companyId": "12",
      "companyType": "fintech",
      "format": "qa",
      "stage": "tech",
      "period": "2025-11",
      "role": "백엔드",
      "tip": "",
      "mine": false,
      "reported": false,
      "order": 1,
      "questions": [
        {
          "id": "seed-question-18",
          "text": "결제 승인과 취소가 거의 동시에 들어오면 상태를 어떻게 관리하시겠어요?",
          "likes": 17
        }
      ]
    }
  ]
};

export function createArchivePreviewData() { return structuredClone(seed); }
