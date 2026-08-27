import { create } from 'zustand';

export interface Question {
  type: 'main' | 'deep';
  main: number;
  tag?: 'Why' | 'What-if' | 'Action' | 'Deep';
  q: string;
}

interface InterviewState {
  script: Question[];       
  qIndex: number;           
  
  phase: 'PREPARING' | 'ASKING' | 'RECORDING' | 'THINKING'; 
  inputMode: 'AUDIO' | 'TEXT';                              
  answerText: string;                                       
  timeLeft: number;       
  isFinished: boolean; // 면접 종료 상태 추가                                  

  setPhase: (phase: InterviewState['phase']) => void;
  setInputMode: (mode: InterviewState['inputMode']) => void;
  setAnswerText: (text: string) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  nextQuestion: () => void;
  proceedToNextQuestion: () => void;
  resetInterview: () => void;
  skipToNextMain: () => void;
}

// 임시 질문 스크립트와 상태를 관리하는 Zustand 스토어 생성
export const useInterviewStore = create<InterviewState>((set) => ({
  script: [
    { type: 'main', main: 1, q: '최근 진행한 프로젝트에서 동시성 문제를 마주쳤던 경험과, 그걸 어떻게 해결했는지 설명해주세요.' },
    { type: 'deep', main: 1, tag: 'Why', q: '왜 DB 락이 아니라 그 방식을 선택하셨나요? 다른 대안은 없었나요?' },
    { type: 'deep', main: 1, tag: 'What-if', q: '트래픽이 지금의 10배로 늘어난다면 그 방식은 여전히 유효할까요?' },
    { type: 'main', main: 2, q: '대용량 트래픽을 견디기 위해 캐시를 어떻게 설계하셨는지 말씀해주세요.' },
    { type: 'deep', main: 2, tag: 'Why', q: '대용량 트래픽을 견디기 위해 캐시를 어떻게 설계하셨는지 말씀해주세요.' },
    { type: 'main', main: 3, q: '세번째 메인 질문' },
    { type: 'deep', main: 3, tag: 'Why', q: '세번째 메인 질문의 꼬리 질문' },
    { type: 'main', main: 4, q: '네번째 메인 질문' },
    { type: 'deep', main: 4, tag: 'Why', q: '네번째 메인 질문의 꼬리 질문' },
    { type: 'main', main: 5, q: '다섯번째 메인 질문' },
    { type: 'deep', main: 5, tag: 'Why', q: '다섯번째 메인 질문의 꼬리 질문' }
  ],
  qIndex: 0,
  phase: 'PREPARING',
  inputMode: 'AUDIO',
  answerText: '',
  timeLeft: 180,
  isFinished: false, // 초기 면접 종료 상태는 false

  setPhase: (phase) => set({ phase }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setAnswerText: (text) => set({ answerText: text }),
  setTimeLeft: (time) => set((state) => ({ 
    timeLeft: typeof time === 'function' ? time(state.timeLeft) : time 
  })),
  
  nextQuestion: () => set({ phase: 'THINKING' }),
  
  proceedToNextQuestion: () => set((state) => {
    const nextIdx = state.qIndex + 1;
    if (nextIdx < state.script.length) {
      return { 
        qIndex: nextIdx, 
        phase: 'ASKING',    
        answerText: '',     
        timeLeft: 180       
      };
    }
    return { isFinished: true }; // 모든 질문을 완료하면 면접 종료 상태를 true로 설정
  }),

  resetInterview: () => set({
    qIndex: 0,
    phase: 'PREPARING',
    inputMode: 'AUDIO',
    answerText: '',
    timeLeft: 180,
    isFinished: false // 면접 재시작 시 종료 상태를 false로 초기화
  }),

  // 현재 메인 주제를 탈출하여 다음 메인 질문으로 정확히 점프하는 함수
  skipToNextMain: () => set((state) => {
    const currentQ = state.script[state.qIndex];
    const currentMainId = currentQ?.main;

    // 현재 내 위치(state.qIndex) 이후부터 탐색하여 메인 번호가 바뀌는 첫 번째 인덱스를 찾음
    const nextMainIdx = state.script.findIndex(
      (item, idx) => idx > state.qIndex && item.main !== currentMainId
    );

    // 다음 메인 질문이 존재한다면 정확히 그곳으로 점프
    if (nextMainIdx !== -1) {
      return {
        qIndex: nextMainIdx,
        phase: 'ASKING', // 로딩 없이 곧바로 다음 메인 질문의 ASKING 단계로 진입
        answerText: '',
        timeLeft: 180
      };
    }
    
    // 더 이상 다음 메인 질문이 없다면(마지막 질문인 경우) 면접 종료 상태로 변경
    return {isFinished: true};
  }),
}));