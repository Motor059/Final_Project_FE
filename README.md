# devoir

### 면접을 연습하고, 피드백으로 배우고, 다음 면접에서 성장하세요.

**devoir는 기술·인성 면접과 PT 면접을 연습하고, AI 피드백을 바탕으로 답변을 개선하는 모의면접 서비스입니다.**

지원하는 기업 유형과 직무에 맞춰 질문을 받고, 답변에 이어지는 꼬리 질문을 경험할 수 있습니다. 면접이 끝나면 질문별 피드백과 개선된 답변 예시를 확인하고, 지난 기록을 복습하며 다음 연습을 준비합니다.

- 서비스 주소: https://devoir-seven.vercel.app/
- 졸업 전시 시연 영상: https://www.youtube.com/watch?v=c7Wc_bbYdFs
- 백엔드 깃허브 주소: https://github.com/chanmin01/DEVOIR_SERVER
- 개발 기간: 6월 ~ 11월 (대략 6개월)

---

## 팀원

| 이름 | 역할 | 담당 내용 | GitHub |
| --- | --- | --- | --- |
| 김순호 | Frontend | 서비스 UI/UX, 마이페이지 화면, 일반·PT 면접 진행 화면, 음성 기능 및 API 연동, 결과 리포트 화면| https://github.com/Motor059 |
| 이지호 | Frontend | 일반·PT 면접 설정 화면, 히스토리 화면, 기출 질문 화면 | https://github.com/kimsruler123-blip |
| 전찬민 | Backend | 로그인·인증, 홈·마이페이지, 결과 리포트 및 히스토리 API | https://github.com/chanmin01 |
| 김태기 | Backend | 일반·PT 면접 설정 및 진행, 맞춤 질문·꼬리 질문 생성, 답변 분석 API | https://github.com/ktg3891 |

---

## 프로젝트 소개

혼자 면접을 준비할 때는 예상 질문에 답하는 연습뿐 아니라, 자신의 답변에서 무엇을 개선해야 하는지 확인하는 과정도 필요합니다.

devoir는 다음과 같은 학습 흐름을 제공합니다.

**면접 설정 → 실전 연습 → AI 피드백 → 기록 복습 → 재연습**

- **상황에 맞는 연습**: 기업 유형, 면접 단계, 직무와 지원 자료를 반영합니다.
- **답변에 이어지는 질문**: 메인 질문과 꼬리 질문으로 생각을 구체화합니다.
- **다음 연습을 위한 피드백**: 강점, 보완점, 행동 지침과 답변 예시를 제공합니다.
- **기록을 통한 복습**: 지난 면접과 리포트를 다시 확인할 수 있습니다.

---

## 주요 기능

### 1. 일반 모의면접

기술 면접과 인성 면접을 선택해 질문과 답변 형식으로 연습합니다.

- 대기업 SW, 서비스 기업, 금융 IT 등 기업 유형 선택
- 기술·인성 면접 단계 선택
- 직무, 회사명, 채용공고를 활용한 맞춤 설정
- PDF 지원 서류 및 공개 GitHub 저장소 URL 추가
- 메인 질문과 답변에 따른 꼬리 질문
- 음성 답변 및 텍스트 답변
- 질문별 제한 시간과 건너뛰기

### 2. PT 모의면접

과제를 확인하고 준비한 뒤, 발표와 질의응답까지 이어지는 과정을 연습합니다.

- 기업별 과제 설정에 따른 화면 구성
- 서비스 개선형·직무 문제 해결형 과제 지원
- 과제별 준비 시간과 발표 시간 반영
- 필요한 과제에서만 발표 분야 선택
- 개인 메모와 메모 틀 제공
- 음성 또는 텍스트로 발표 제출
- 발표 이후 메인·꼬리 질문에 답변

### 3. AI 결과 리포트

면접 결과를 확인하고 다음 연습에서 개선할 부분을 찾습니다.

- 종합 점수와 평가 항목별 차트
- 핵심 약점과 실천할 행동을 제안하는 코칭
- 질문별 강점·보완점·다음 행동
- 기존 답변과 개선된 답변 예시
- 꼬리 질문에 대한 피드백
- PT 발표 피드백과 발표 구성 개선안

### 4. 히스토리

지난 면접을 다시 살펴보고 학습을 이어갑니다.

- 총 연습 횟수와 이번 주 연습 횟수
- 일반 면접·PT 면접 구분
- 일반 면접의 기술·인성 필터
- 지난 면접 리포트 다시 보기
- 조회된 기록의 채점 진행 상태 표시

### 5. 기출 질문

지원자들이 경험한 질문을 찾아보고 자신의 질문을 공유하는 화면입니다.

- 회사명 검색과 기업별 질문 보기
- 기업 유형, 면접 형식, 단계, 직무 필터
- 최신순·인기순 정렬
- 질문 하트 저장
- 면접 경험과 여러 질문을 한 번에 등록
- 마이페이지에서 내가 등록한 질문 확인

> 현재 전시 버전은 시연용 Mock 데이터를 사용합니다.

### 6. 마이페이지 및 로그인

- 카카오 로그인
- 로그인 없이 게스트로 모의면접 체험
- 닉네임 변경
- PDF 지원 서류 업로드·이름 수정·삭제
- 내가 등록한 질문 확인
- 질문 음성 듣기 ON/OFF 설정

---

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 언어 | TypeScript |
| UI | React 19 |
| 빌드 도구 | Vite 8 |
| 라우팅 | React Router |
| 상태 관리 | Zustand |
| API 통신 | Axios |
| 스타일링 | Tailwind CSS, CSS |
| UI 컴포넌트 | shadcn/ui, Base UI |
| 아이콘 | Lucide React |
| 차트 | Recharts |
| 음성 처리 | MediaRecorder, MediaDevices, Web Speech API |
| 시각 효과 | Canvas, CSS Animation |
| 코드 품질 | ESLint, TypeScript |

---

## 프론트엔드 구현 내용

### 면접 단계에 따른 상태 관리

질문 안내, 답변, 제출, 다음 질문으로 이어지는 상태를 관리합니다.

- 질문 안내가 끝난 뒤 답변 시작
- 음성·텍스트 답변 전환
- 종료 확인창을 열었을 때 일시정지
- 질문 전환과 화면 이탈 시 진행 중인 작업 정리

### 질문 음성 API 연동

일반 면접과 PT 질의응답에서 같은 질문 음성 API를 사용합니다.

- 인증된 요청으로 MP3 바이너리 수신
- 메인 질문과 꼬리 질문 재생
- 일시정지·재개 및 재생 자원 정리
- 음성 생성·재생 실패 시 화면의 질문으로 계속 진행

### 비동기 결과 처리

질문 생성과 리포트 분석처럼 시간이 필요한 작업의 상태를 조회하고 화면에 반영합니다.

### 공통 UI와 반응형 화면

공통 헤더, 제목 애니메이션, 질문 표시, 로딩 상태와 모달을 사용해 화면 간 일관성을 유지합니다.

---

## 프로젝트 구조

```text
Final_Project_FE/
├── .github/
│   ├── ISSUE_TEMPLATE/                 # 기능·버그·리팩터링 등 이슈 템플릿
│   └── pull_request_template.md        # PR 작성 템플릿
│
├── public/                             # 정적 리소스
│
├── src/
│   ├── api/                            # 백엔드 API 통신
│   │   ├── axios.ts                    # Axios 인스턴스, 인증 헤더와 토큰 갱신
│   │   ├── api.ts                      # 공통 응답 및 일반 면접 관련 타입
│   │   ├── authApi.ts                  # 로그인·게스트 인증
│   │   ├── userApi.ts                  # 사용자 정보 조회·수정
│   │   ├── setupApi.ts                 # 일반 면접 설정과 세션 생성
│   │   ├── interviewApi.ts             # 질문 조회, 답변 제출, 건너뛰기
│   │   ├── ptApi.ts                    # PT 설정·준비·발표·질의응답
│   │   ├── questionAudioApi.ts         # 질문 음성 MP3 조회
│   │   ├── reportApi.ts                # 면접 결과 리포트 조회
│   │   ├── historyApi.ts               # 지난 면접 기록 조회
│   │   └── documentApi.ts              # 지원 서류 업로드·조회·수정·삭제
│   │
│   ├── components/                     # 공통 UI와 기능별 컴포넌트
│   │   ├── common/
│   │   │   ├── Header.tsx              # 공통 헤더와 내비게이션
│   │   │   ├── Footer.tsx              # 공통 푸터
│   │   │   ├── AuthSessionSync.tsx      # 인증 세션 변경 동기화
│   │   │   ├── GlobalAlertModal.tsx     # 공통 알림·확인 모달
│   │   │   ├── MemberPageHero.tsx       # 회원 페이지 상단 소개 영역
│   │   │   ├── InterviewQuestionText.tsx # 일반·PT 공통 질문 표시
│   │   │   ├── PageMotion.tsx          # 페이지 전환 효과
│   │   │   ├── TitleWords.tsx          # 제목 애니메이션
│   │   │   └── LoadingState.tsx        # 공통 로딩 표시
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSection.tsx         # 홈 상단 소개와 면접 시작
│   │   │   ├── FeatureSection.tsx      # 주요 기능 소개
│   │   │   ├── InterviewPreview.tsx    # 일반 면접 시연
│   │   │   ├── PTPreparationPreview.tsx # PT 준비 화면 시연
│   │   │   └── CompanyMarquee.tsx      # 기업 로고 띠 애니메이션
│   │   │
│   │   ├── setup/
│   │   │   ├── InterviewSetupLayout.tsx # 면접 설정 공통 레이아웃
│   │   │   ├── SelectionCard.tsx       # 설정 선택 카드
│   │   │   ├── AdvancedSetting.tsx     # 직무·JD·서류·GitHub 맞춤 설정
│   │   │   ├── PTSetupForm.tsx         # 기업별 PT 면접 설정
│   │   │   └── PdfDropzone.tsx         # PDF 파일 선택·드래그 업로드
│   │   │
│   │   ├── interview/
│   │   │   ├── QuestionOrb.tsx         # 일반 면접 질문과 오브 표시
│   │   │   ├── AudioWaveform.tsx       # 답변 음성 파형
│   │   │   ├── ActionController.tsx    # 답변 완료·입력 방식 전환
│   │   │   └── ExitConfirmModal.tsx    # 면접 종료 확인
│   │   │
│   │   ├── presentation/
│   │   │   ├── PTWorkspace.tsx         # PT 공통 작업 화면과 참고 자료
│   │   │   ├── PTQuestionOrb.tsx       # PT 질문 오브 표시
│   │   │   ├── PTAudioWaveform.tsx     # PT 녹음 음성 파형
│   │   │   ├── PTStartDialog.tsx       # PT 시작 전 확인
│   │   │   └── PTExitDialog.tsx        # PT 종료 확인
│   │   │
│   │   ├── report/
│   │   │   ├── ReportContent.tsx       # 결과 리포트 구성
│   │   │   ├── ReportHero.tsx          # 핵심 코칭
│   │   │   ├── ReportScoreBoard.tsx    # 종합 점수와 평가 요약
│   │   │   ├── ScoreChart.tsx          # 평가 항목별 차트
│   │   │   ├── FeedbackCard.tsx        # 질문·발표별 상세 피드백
│   │   │   ├── RepositoryEvidence.tsx  # 피드백에 연결된 코드 근거 표시
│   │   │   └── ReportAnalysisManager.tsx # 백그라운드 분석 상태 관리
│   │   │
│   │   ├── history/
│   │   │   ├── HistorySummary.tsx      # 총 연습 횟수와 주간 통계
│   │   │   └── HistoryList.tsx         # 면접 기록과 채점 상태
│   │   │
│   │   ├── archive/
│   │   │   ├── ArchiveCard.tsx         # 기출 질문 카드
│   │   │   ├── ArchiveForm.tsx         # 면접 경험·질문 등록
│   │   │   ├── ArchiveDatePicker.tsx   # 면접 시기 선택 캘린더
│   │   │   ├── CompanySearch.tsx       # 회사명 검색과 선택
│   │   │   └── ArchivePreviewSessionSync.tsx # 시연 데이터 세션 동기화
│   │   │
│   │   ├── mypage/
│   │   │   ├── AccountSection.tsx      # 계정 관리
│   │   │   ├── DocumentList.tsx        # 지원 서류 목록
│   │   │   └── MyQuestionsSection.tsx  # 내가 등록한 질문 목록
│   │   │
│   │   └── ui/                         # 버튼·다이얼로그·배지 등 기본 UI
│   │
│   ├── hooks/                          # 화면별 상태와 비동기 처리
│   │   ├── useSetup.ts                 # 일반 면접 설정과 시작
│   │   ├── useInterviewTimer.ts        # 일반 면접 답변 제한 시간
│   │   ├── useSpeechRecognition.ts     # 브라우저 음성 인식
│   │   ├── useQuestionSpeech.ts        # 일반 면접 질문 음성 재생
│   │   ├── usePTSetup.ts               # PT 기업·시간 설정
│   │   ├── usePTSession.ts             # PT 세션 조회와 진행 상태
│   │   ├── usePTPage.ts                # PT 페이지 공통 진행 제어
│   │   ├── usePTMemo.ts                # PT 개인 메모 관리
│   │   ├── usePTRecorder.ts            # PT 녹음과 마이크 제어
│   │   ├── usePTPresentation.ts        # PT 발표 제출
│   │   ├── usePTQuestions.ts           # PT 질문 조회
│   │   ├── usePTQuestionPresentation.ts # PT 질문 표시와 음성 재생
│   │   ├── usePTAnswer.ts              # PT 답변 입력과 제출
│   │   ├── useReportPolling.ts         # 리포트 분석 상태 주기적 조회
│   │   ├── useHistory.ts               # 면접 기록 조회와 필터
│   │   ├── useMyPage.ts                # 마이페이지 데이터 관리
│   │   ├── useDocuments.ts             # 지원 서류 관리
│   │   └── useArchivePreview.ts        # 기출 질문 시연 데이터 연결
│   │
│   ├── lib/                            # 재사용 가능한 공통 로직
│   │   ├── authStorage.ts              # 인증 정보 저장과 세션 식별
│   │   ├── authRedirect.ts             # 카카오 로그인과 복귀 처리
│   │   ├── guestAuth.ts                # 게스트 인증 처리
│   │   ├── sessionSnapshot.ts          # 인증 세션별 데이터 캐시
│   │   ├── interviewSetup.ts           # 면접 설정 저장과 복원
│   │   ├── interviewTimer.ts           # 답변 시간 저장과 복원
│   │   ├── questionAudio.ts            # MP3 재생·일시정지·취소·자원 해제
│   │   ├── ptSession.ts                # PT 세션 공통 처리
│   │   ├── ptTaskSettings.ts           # 과제별 분야·시간·직무 설정
│   │   ├── ptTaskView.ts               # PT 과제 표시 데이터 구성
│   │   ├── ptPresentation.ts           # PT 발표 관련 공통 처리
│   │   ├── ptAnswerDraft.ts            # PT 답변 임시 데이터 관리
│   │   ├── reportAnalysis.ts           # 리포트 분석 상태 처리
│   │   ├── reportDisplay.ts            # 리포트 점수와 표시 문구
│   │   ├── reportNavigation.ts         # 리포트 이동과 데이터 복원
│   │   ├── archiveDisplay.ts           # 기출 질문 표시와 회사명 정규화
│   │   ├── archivePreviewData.ts       # 기출 질문 Mock 데이터
│   │   ├── OrbEngine.ts                # Canvas 기반 오브 시각 효과
│   │   └── utils.ts                    # 공통 유틸리티
│   │
│   ├── pages/                          # 라우트별 화면
│   │   ├── Home.tsx                    # 홈
│   │   ├── Setup.tsx                   # 일반·PT 면접 설정
│   │   ├── Interview.tsx               # 일반 면접 진행
│   │   ├── PTPreparation.tsx           # PT 과제 확인과 준비
│   │   ├── PTPresentation.tsx          # PT 발표
│   │   ├── PTInterview.tsx             # PT 질의응답
│   │   ├── Report.tsx                  # 결과 리포트
│   │   ├── History.tsx                 # 지난 면접 기록
│   │   ├── Archive.tsx                 # 기출 질문 탐색·등록
│   │   ├── MyPage.tsx                  # 프로필·서류·설정 관리
│   │   └── KakaoCallback.tsx           # 카카오 로그인 콜백
│   │
│   ├── store/                          # Zustand 공유 상태
│   │   ├── authStore.ts                # 로그인과 사용자 정보
│   │   ├── useInterviewStore.ts        # 일반 면접 진행 상태와 답변
│   │   ├── useReportAnalysisStore.ts    # 리포트 분석 작업 상태
│   │   ├── useArchivePreviewStore.ts   # 기출 질문 Mock 데이터와 사용자 동작
│   │   └── useAlertStore.ts            # 공통 알림·확인 상태
│   │
│   ├── types/                          # API 응답과 도메인 타입
│   │   ├── setup.ts                    # 일반 면접 설정
│   │   ├── pt.ts                       # PT 과제·세션·질문·답변
│   │   ├── report.ts                   # 점수와 피드백
│   │   ├── reportView.ts               # 리포트 추가 표시 정보
│   │   ├── history.ts                  # 면접 기록
│   │   ├── archive.ts                  # 기출 질문과 등록 데이터
│   │   ├── document.ts                 # 지원 서류
│   │   └── user.ts                     # 사용자 정보
│   │
│   ├── App.tsx                        # 라우팅과 공통 레이아웃
│   ├── main.tsx                       # React 애플리케이션 진입점
│   └── index.css                      # 전역 스타일
│
├── index.html                         # HTML 진입점
├── package.json                       # 의존성과 실행 스크립트
├── package-lock.json                  # 의존성 버전 고정
├── vite.config.ts                     # Vite, 경로 별칭, 개발 API 프록시
├── tailwind.config.js                 # Tailwind 테마 설정
├── postcss.config.js                  # CSS 처리 설정
├── tsconfig.json                      # TypeScript 프로젝트 구성
├── tsconfig.app.json                  # 애플리케이션 TypeScript 설정
├── tsconfig.node.json                 # 설정 파일용 TypeScript 설정
├── eslint.config.js                   # 코드 검사 규칙
├── components.json                    # shadcn/ui 설정
├── vercel.json                        # Vercel 배포 설정
└── README.md                          # 프로젝트 소개와 실행 안내
```

---

## 향후 개선 방향

- 기출 질문 API 및 실제 DB 연동
- 히스토리 검색과 즐겨찾기를 통한 복습 기능 강화
- 브라우저별 음성 기능과 화면 호환성 개선
- 다양한 기업·직무의 PT 연습 과제 확장