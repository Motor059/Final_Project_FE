import { LoadingIndicator } from '@/components/common/LoadingState';

const analysisItems = [
  { title: '답변 분석', description: '질문과 답변의 내용을 살펴봐요.' },
  { title: 'STAR 구조 평가', description: '상황·과제·행동·결과의 흐름을 확인해요.' },
  { title: '종합 점수 계산', description: '항목별 평가와 질문별 피드백을 정리해요.' },
];

export default function ReportLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9] px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div role="status" aria-live="polite" className="flex flex-col items-center text-center">
          <span className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-[#44403C] shadow-sm">
            <LoadingIndicator size="lg" />
          </span>
          <h1 className="text-[21px] font-semibold tracking-[-0.03em] text-[#1C1917]">면접을 분석하고 있어요</h1>
          <p className="mt-2 break-keep text-[13px] leading-[1.8] text-[#8A847F]">답변을 바탕으로 점수와 피드백을 준비하고 있어요.</p>
        </div>
        <div className="mt-8 rounded-2xl border border-[#EDECE9] bg-white px-6 py-2">
          <p className="pt-4 text-[11px] font-semibold text-[#A8A29E]">분석 항목</p>
          <ul className="divide-y divide-[#F0EFED]">
            {analysisItems.map((item, index) => (
              <li key={item.title} className="flex items-start gap-3 py-4">
                <span aria-hidden="true" className="devoir-report-analysis-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#78716C]" style={{ animationDelay: `${index * 1.2}s` }} />
                <div>
                  <h2 className="text-[13px] font-semibold text-[#57534E]">{item.title}</h2>
                  <p className="mt-1 text-[12px] leading-[1.7] text-[#A8A29E]">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
