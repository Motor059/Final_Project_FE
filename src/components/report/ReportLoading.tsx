import { useState, useEffect } from 'react';

export default function ReportLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1000); // 1초 간격

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* 커스텀 스피너 */}
      <div className="w-[34px] h-[34px] border-[2.5px] border-[#E7E5E4] border-t-[#0A0A0A] rounded-full animate-spin mb-8" />
      
      <h2 className="text-[22px] font-semibold text-[#1C1917] mb-8">
        면접을 분석하고 있어요
      </h2>
      
      <div className="flex flex-col gap-3 text-[14px] font-medium">
        <div className={`flex items-center gap-3 transition-colors duration-500 ${step >= 0 ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
          <span className={`w-3 h-3 rounded-full transition-colors duration-500 ${step >= 0 ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`} />
          답변 분석 중
        </div>
        
        <div className={`flex items-center gap-3 transition-colors duration-500 ${step >= 1 ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
          <span className={`w-3 h-3 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`} />
          STAR 구조 평가 중
        </div>
        
        <div className={`flex items-center gap-3 transition-colors duration-500 ${step >= 2 ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
          <span className={`w-3 h-3 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`} />
          종합 점수 계산 중
        </div>
      </div>
    </div>
  );
}