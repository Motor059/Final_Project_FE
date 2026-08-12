const Step1Mockup = () => (
  <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-[18px] p-[28px] shadow-sm relative overflow-hidden">
    {/* 우하단 오로라 */}
    <div 
      className="absolute right-[-40px] top-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none opacity-40 blur-[20px]"
      style={{ background: 'radial-gradient(circle, rgba(170,100,255,0.4), transparent)' }}
    />
    
    <div className="text-[11px] font-medium text-[#A8A29E] mb-[6px]">모의면접 설정</div>
    <div className="text-[19px] font-semibold tracking-[-0.02em] mb-[22px] text-[#0A0A0A]">
      어떤 면접을 연습할까요?
    </div>

    <div className="text-[11px] font-semibold text-[#A8A29E] tracking-[0.06em] uppercase mb-[9px]">
      기업 유형
    </div>
    <div className="grid grid-cols-3 gap-[8px] mb-[24px]">
      <div className="bg-[#0A0A0A] rounded-[11px] p-[14px_12px] text-white">
        <div className="text-[12.5px] font-semibold mb-[4px]">서비스 기업</div>
        <div className="text-[10px] text-[rgba(255,255,255,0.5)] leading-[1.4]">네이버·카카오·쿠팡</div>
      </div>
      <div className="bg-white border border-[#E7E5E4] rounded-[11px] p-[14px_12px]">
        <div className="text-[12.5px] font-semibold text-[#1C1917] mb-[4px]">대기업 SW</div>
        <div className="text-[10px] text-[#A8A29E] leading-[1.4]">삼성·SK·LG</div>
      </div>
      <div className="bg-white border border-[#E7E5E4] rounded-[11px] p-[14px_12px]">
        <div className="text-[12.5px] font-semibold text-[#1C1917] mb-[4px]">금융 IT</div>
        <div className="text-[10px] text-[#A8A29E] leading-[1.4]">토스·카뱅·NH</div>
      </div>
    </div>

    <div className="text-[11px] font-semibold text-[#A8A29E] tracking-[0.06em] uppercase mb-[9px]">
      면접 단계
    </div>
    <div className="grid grid-cols-2 gap-[8px]">
      <div className="bg-[#0A0A0A] rounded-[11px] p-[14px_16px] text-white">
        <div className="text-[12.5px] font-semibold mb-[4px]">1차 기술</div>
        <div className="text-[10px] text-[rgba(255,255,255,0.45)] leading-[1.4]">알고리즘·CS·프로젝트</div>
      </div>
      <div className="bg-white border border-[#E7E5E4] rounded-[11px] p-[14px_16px]">
        <div className="text-[12.5px] font-semibold text-[#1C1917] mb-[4px]">2차 인성·임원</div>
        <div className="text-[10px] text-[#A8A29E] leading-[1.4]">가치관·협업·리더십</div>
      </div>
    </div>
  </div>
);

const Step2Mockup = () => (
  <div className="bg-white border border-[#E7E5E4] rounded-[18px] shadow-sm p-[20px_22px] overflow-hidden">
    <div className="flex items-center justify-between mb-[9px]">
      <span className="text-[10px] font-semibold bg-[#0A0A0A] text-white p-[3px_8px] rounded-[6px] tracking-[0.02em]">
        메인 질문
      </span>
      <span className="text-[11px] text-[#78716C] font-medium">메인 질문 1 / 5</span>
    </div>
    
    {/* 프로그레스 바 */}
    <div className="flex gap-[4px] mb-[24px]">
      <div className="h-[3px] flex-1 rounded-[2px] bg-[#0A0A0A]" />
      <div className="h-[3px] flex-1 rounded-[2px] bg-[#E7E5E4]" />
      <div className="h-[3px] flex-1 rounded-[2px] bg-[#E7E5E4]" />
      <div className="h-[3px] flex-1 rounded-[2px] bg-[#E7E5E4]" />
      <div className="h-[3px] flex-1 rounded-[2px] bg-[#E7E5E4]" />
    </div>

    <div className="flex flex-col items-center gap-[12px]">
      <div 
        className="w-[96px] h-[96px] rounded-full"
        style={{
          background: 'radial-gradient(at 60% 30%, rgba(170,100,255,0.4), transparent 55%), radial-gradient(at 30% 30%, rgba(255,160,90,0.34), transparent 55%), radial-gradient(at 50% 75%, rgba(80,210,155,0.28), transparent 55%)'
        }}
      />
      <div className="text-[11px] text-[#A8A29E] font-medium">면접관이 질문하고 있어요</div>
      <p className="text-[14.5px] leading-[1.5] text-center text-[#1C1917] font-medium m-0 px-[18px]">
        최근 진행한 프로젝트에서 동시성 문제를 마주쳤던 경험과, 그걸 어떻게 해결했는지 설명해주세요.
      </p>
    </div>

    <div className="flex flex-col items-center gap-[9px] pt-[14px] mt-[14px] border-t border-[#E7E5E4]">
      <div className="flex items-center gap-[4px] h-[36px]">
        {[4, 10, 18, 26, 32, 36, 28, 20, 12, 6].map((h, i) => (
          <span key={i} className="block w-[5px] bg-[#0A0A0A] rounded-[99px]" style={{ height: `${h}px` }} />
        ))}
      </div>
      <div className="text-[11px] text-[#57534E] font-semibold tracking-[0.02em]">답변을 듣고 있어요</div>
      
      <div className="flex items-center gap-[8px] mt-[2px]">
        <div className="flex items-center gap-[6px]">
          <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#DC2626]" />
          <span className="text-[12px] font-semibold text-[#0A0A0A]">0:32</span>
        </div>
        <button className="text-[12px] font-semibold text-white bg-[#0A0A0A] rounded-[99px] p-[7px_18px] ml-[6px]">
          답변 완료
        </button>
      </div>
    </div>
  </div>
);

const Step3Mockup = () => (
  <div className="bg-white border border-[#E7E5E4] rounded-[18px] shadow-sm overflow-hidden">    
    <div 
      className="relative p-[22px_20px]"
      style={{ background: 'linear-gradient(150deg, rgb(43, 39, 64) 0%, rgb(10, 10, 10) 56%, rgb(22, 36, 42) 100%)' }}
    >
      <div className="text-[10px] font-semibold text-[#D6D3D1] tracking-[0.04em] uppercase mb-[12px]">이번 면접의 핵심 코칭</div>
      <div className="text-[13.5px] leading-[1.45] font-medium text-white mb-[14px]">
        5개 답변 중 3개에서 결과를 수치로 제시하지 않았어요. 문제는 잘 풀었는데, 그게 얼마나 좋아졌는지를 증명하지 못하고 있습니다.
      </div>
      <div className="flex items-start gap-[8px] pt-[14px] border-t border-[rgba(255,255,255,0.1)]">
        <span 
          className="text-[10px] font-semibold text-[#1C1917] rounded-[5px] p-[3px_7px] whitespace-nowrap"
          style={{
            background: 'radial-gradient(circle at 25% 35%, rgba(170, 100, 255, 0.62) 0%, transparent 85%), radial-gradient(circle at 78% 28%, rgba(255, 160, 90, 0.56) 0%, transparent 85%), radial-gradient(circle at 50% 90%, rgba(80, 210, 155, 0.5) 0%, transparent 80%), rgb(250, 249, 245)'
          }}
        >
          다음 면접
        </span>
        <div className="text-[11.5px] leading-[1.5] text-[#D6D3D1]">
          다음 면접에선 모든 답변을 "그래서 ~가 ~% 개선됐다"로 끝내보세요.
        </div>
      </div>
    </div>

    {/* 중간 점수 및 레이더 차트 영역 */}
    <div className="grid grid-cols-[1fr_1.2fr] gap-0 border-b border-[#E0DEDA] mx-[20px] pb-[18px] pt-[18px]">
      <div className="pr-[20px] border-r border-[#E0DEDA]">
        <div className="text-[11px] font-semibold text-[#A8A29E] mb-[4px]">종합 점수</div>
        <div className="flex items-baseline gap-[4px] mb-[8px]">
          <span className="text-[48px] font-semibold tracking-[-0.04em] text-[#0A0A0A] leading-[0.9]">78</span>
          <span className="text-[18px] font-medium text-[#A8A29E]">점</span>
        </div>
        <p className="text-[11.5px] leading-[1.45] text-[#44403C] m-0">
          구조는 좋은데 구체성이<br/>부족해요.
        </p>
      </div>
      
      <div className="pl-[20px] pt-[14px] flex flex-col items-center justify-center">
        <div className="text-[10.5px] font-semibold text-[#A8A29E] mb-[4px]">항목별 분석 · 기술 면접</div>
        <svg viewBox="0 0 350 300" className="w-full h-auto block">
          <polygon points="175.0,57.0 251.2,101.0 251.2,189.0 175.0,233.0 98.8,189.0 98.8,101.0" fill="none" stroke="#E7E5E4" strokeWidth="1" />
          <polygon points="175.0,92.2 220.7,118.6 220.7,171.4 175.0,197.8 129.3,171.4 129.3,118.6" fill="none" stroke="#F0EFED" strokeWidth="1" />
          <line x1="175" y1="145" x2="175.0" y2="57.0" stroke="#F0EFED" strokeWidth="1" />
          <line x1="175" y1="145" x2="251.2" y2="101.0" stroke="#F0EFED" strokeWidth="1" />
          <line x1="175" y1="145" x2="251.2" y2="189.0" stroke="#F0EFED" strokeWidth="1" />
          <line x1="175" y1="145" x2="175.0" y2="233.0" stroke="#F0EFED" strokeWidth="1" />
          <line x1="175" y1="145" x2="98.8" y2="189.0" stroke="#F0EFED" strokeWidth="1" />
          <line x1="175" y1="145" x2="98.8" y2="101.0" stroke="#F0EFED" strokeWidth="1" />
          
          <polygon points="175.0,74.6 229.9,113.3 237.5,181.1 175.0,203.1 110.2,182.4 130.8,119.5" fill="rgba(10,10,10,0.08)" stroke="#0A0A0A" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="175.0" cy="74.6" r="2.6" fill="#0A0A0A" />
          <circle cx="229.9" cy="113.3" r="2.6" fill="#0A0A0A" />
          <circle cx="237.5" cy="181.1" r="2.6" fill="#0A0A0A" />
          <circle cx="175.0" cy="203.1" r="2.6" fill="#0A0A0A" />
          <circle cx="110.2" cy="182.4" r="2.6" fill="#0A0A0A" />
          <circle cx="130.8" cy="119.5" r="2.6" fill="#0A0A0A" />

          <text x="175.0" y="32.0" textAnchor="middle" className="font-sans text-[10.5px] font-medium fill-[#78716C]">정확성</text>
          <text x="175.0" y="46.0" textAnchor="middle" className="font-sans text-[12.5px] font-bold fill-[#0A0A0A]">80</text>

          <text x="270.3" y="87.0" textAnchor="start" className="font-sans text-[10.5px] font-medium fill-[#78716C]">깊이</text>
          <text x="270.3" y="101.0" textAnchor="start" className="font-sans text-[12.5px] font-bold fill-[#0A0A0A]">72</text>

          <text x="270.3" y="201.0" textAnchor="start" className="font-sans text-[10.5px] font-medium fill-[#78716C]">문제 해결</text>
          <text x="270.3" y="215.0" textAnchor="start" className="font-sans text-[12.5px] font-bold fill-[#0A0A0A]">82</text>

          <text x="175.0" y="256.0" textAnchor="middle" className="font-sans text-[10.5px] font-medium fill-[#78716C]">기술 선택 근거</text>
          <text x="175.0" y="270.0" textAnchor="middle" className="font-sans text-[12.5px] font-bold fill-[#0A0A0A]">66</text>

          <text x="79.7" y="201.0" textAnchor="end" className="font-sans text-[10.5px] font-medium fill-[#78716C]">설명력</text>
          <text x="79.7" y="215.0" textAnchor="end" className="font-sans text-[12.5px] font-bold fill-[#0A0A0A]">85</text>

          <text x="79.7" y="87.0" textAnchor="end" className="font-sans text-[10.5px] font-medium fill-[#78716C]">결과·임팩트</text>
          <text x="79.7" y="101.0" textAnchor="end" className="font-sans text-[12.5px] font-bold fill-[#0A0A0A]">58</text>
        </svg>
      </div>
    </div>

    {/* 하단 질문별 피드백 리스트 */}
    <div className="p-[14px_20px]">
      <div className="text-[11px] font-semibold text-[#78716C] mb-[8px]">질문별 피드백</div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center justify-between p-[9px_12px] border border-[#F0EFED] rounded-[10px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[10.5px] font-semibold text-[#A8A29E]">질문 1</span>
            <span className="text-[12px] font-medium text-[#1C1917]">동시성 문제 해결 경험</span>
          </div>
          <span className="text-[13.5px] font-semibold text-[#22C55E]">82</span>
        </div>
        <div className="flex items-center justify-between p-[9px_12px] border border-[#F0EFED] rounded-[10px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[10.5px] font-semibold text-[#A8A29E]">질문 2</span>
            <span className="text-[12px] font-medium text-[#1C1917]">캐시 설계 경험</span>
          </div>
          <span className="text-[13.5px] font-semibold text-[#A8A29E]">71</span>
        </div>
      </div>
    </div>
  </div>
);

export default function TutorialSection() {
  return (
    <section className="py-[80px] px-[50px]">
      {/* 헤더 */}
      <div className="text-center mb-[64px]">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#A8A29E] mb-[14px]">
          How it works
        </div>
        <h2 className="text-[42px] font-medium tracking-[-0.02em] leading-[1.1] m-0 text-[#0A0A0A]">
          처음이세요? 이렇게 진행돼요
        </h2>
      </div>

      {/* Step 01 */}
      <div className="grid grid-cols-[1fr_1.1fr] gap-[60px] items-center py-[64px] border-t border-[#F0EFED]">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.1em] text-[#0A0A0A] mb-[14px]">STEP 01</div>
          <h3 className="text-[26px] font-semibold tracking-[-0.02em] leading-[1.2] mb-[14px]">
            면접의 틀과 재료를 고릅니다
          </h3>
          <p className="text-[15.5px] leading-[1.65] text-[#57534E] m-0">
            기업 유형과 면접 단계만 고르면 바로 시작. 직무·회사·채용공고·지원 서류(PDF)를 더하면 질문이 훨씬 정교해집니다.
          </p>
        </div>
        <Step1Mockup />
      </div>

      {/* Step 02 */}
      <div className="grid grid-cols-[1.1fr_1fr] gap-[60px] items-center py-[64px] border-t border-[#F0EFED]">
        <Step2Mockup />
        <div>
          <div className="text-[12px] font-semibold tracking-[0.1em] text-[#0A0A0A] mb-[14px]">STEP 02</div>
          <h3 className="text-[26px] font-semibold tracking-[-0.02em] leading-[1.2] mb-[14px]">
            면접관과 음성으로 대화합니다
          </h3>
          <p className="text-[15.5px] leading-[1.65] text-[#57534E] m-0">
            면접관이 음성으로 묻고, 질문이 끝나면 바로 녹음이 시작됩니다. 답변에 반응해 "왜 그렇게 했나요?" 같은 꼬리 질문이 실시간으로 이어져요.
          </p>
        </div>
      </div>

      {/* Step 03 */}
      <div className="grid grid-cols-[1fr_1.1fr] gap-[60px] items-center pt-[64px] pb-[24px] border-t border-[#F0EFED]">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.1em] text-[#0A0A0A] mb-[14px]">STEP 03</div>
          <h3 className="text-[26px] font-semibold tracking-[-0.02em] leading-[1.2] mb-[14px]">
            다음 면접을 바꾸는 코칭을 받습니다
          </h3>
          <p className="text-[15.5px] leading-[1.65] text-[#57534E] m-0">
            반복된 약점 한 가지와 구체적인 행동 지시, 항목별 점수와 "이렇게 답하면 좋았어요" 첨삭까지. 점수가 아니라 다음에 무엇을 고칠지를 들고 나갑니다.
          </p>
        </div>
        <Step3Mockup />
      </div>
      
      {/* 튜토리얼 하단 시작하기 버튼 (비로그인 상태에서만 렌더링됨) */}
      <div className="text-center pt-[24px]">
        <button 
          className="text-[16px] font-semibold text-white px-[34px] py-[16px] rounded-[14px] shadow-[0_10px_30px_rgba(10,10,10,0.18)]"
          style={{ background: 'linear-gradient(135deg, rgb(42, 37, 64) 0%, rgb(10, 10, 10) 62%)' }}
        >
          지금 바로 시작하기
        </button>
      </div>
    </section>
  );
}