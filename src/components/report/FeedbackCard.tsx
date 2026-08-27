import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FeedbackCardData, TailQuestion } from '@/types/report';

interface FeedbackCardProps {
  data: FeedbackCardData;
  index: number;
}

export default function FeedbackCard({ data, index }: FeedbackCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeepOpen, setIsDeepOpen] = useState(false);

  return (
    <div className="border border-[#F0EFED] rounded-[16px] overflow-hidden bg-white mb-[10px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-[22px] py-[18px] hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-[14px]">
          <span className="text-[12px] text-[#A8A29E] font-semibold whitespace-nowrap">
            질문 {index + 1}
          </span>
          <span className="text-[14.5px] font-medium text-[#1C1917] text-left">
            {data.shortTitle}
          </span>
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="text-[16px] font-semibold text-[#15803D]">
            {data.topicScore}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#A8A29E]" /> : <ChevronDown className="w-4 h-4 text-[#A8A29E]" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-[22px] pb-[24px] pt-1 animate-in fade-in slide-in-from-top-2">
          {/* 메인 질문 */}
          <h4 className="text-[18px] leading-[1.45] font-medium text-[#0A0A0A] mb-[16px]">
            {data.question}
          </h4>
          
          <div className="bg-[#FAFAF9] rounded-[12px] p-[16px] mb-[18px]">
            <div className="text-[11.5px] font-semibold text-[#A8A29E] mb-[6px]">내 답변</div>
            <p className="text-[13.5px] leading-[1.6] text-[#44403C]">
              {data.answer}
            </p>
          </div>

          {/* 메인 피드백 3단 */}
          <div className="flex flex-col gap-[10px] mb-[6px]">
            <FeedbackRow label="잘한 점" colorClass="text-[#15803D] bg-[#F0FDF4]" text={data.good} />
            <FeedbackRow label="아쉬운 점" colorClass="text-[#9A3412] bg-[#FFF7ED]" text={data.weak} />
            <FeedbackRow label="다음엔" colorClass="text-white bg-[#0A0A0A]" text={data.next} />
          </div>

          <button 
            onClick={() => setIsDeepOpen(!isDeepOpen)}
            className="mt-4 text-[12.5px] text-[#78716C] underline underline-offset-4 hover:text-[#0A0A0A] transition-colors"
          >
            {isDeepOpen ? '심화 닫기' : '심화 보기 — 개선된 답변 · 꼬리 질문'}
          </button>

          {/* 심화 영역 (약한 축, 예시, 꼬리질문) */}
          {isDeepOpen && (
            <div className="mt-[20px] border-t border-[#F0EFED] pt-[20px] animate-in fade-in">
              
              <div className="mb-[24px]">
                <div className="text-[12.5px] font-semibold text-[#57534E] mb-[8px]">약한 축</div>
                <div className="text-[13.5px] leading-[1.55] text-[#78716C]">
                  {data.weakAxis}
                </div>
              </div>

              {/* 개선된 답변 예시 */}
              <div className="mb-[32px]">
                <div className="text-[12.5px] font-semibold text-[#57534E] mb-[12px]">개선된 답변 예시</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                   <div className="bg-[#FAFAF9] border border-[#F0EFED] rounded-[11px] p-[16px]">
                      <div className="text-[11px] font-semibold text-[#9A3412] mb-[8px]">Before · 내 답변</div>
                      <p className="text-[13px] leading-[1.6] text-[#78716C]">{data.improvedAnswer?.before}</p>
                   </div>
                   <div className="bg-[#0A0A0A] rounded-[11px] p-[16px]">
                      <div className="text-[11px] font-semibold text-[#15803D] mb-[8px]">After · 이렇게</div>
                      <p className="text-[13px] leading-[1.6] text-[#E7E5E4]">{data.improvedAnswer?.after}</p>
                   </div>
                </div>
              </div>

              {/* 꼬리 질문 리스트 */}
              {data.tails && data.tails.length > 0 && (
                <div>
                  <div className="text-[12.5px] font-semibold text-[#57534E] mb-[16px]">이 주제의 꼬리 질문</div>
                  <div className="flex flex-col gap-[20px]">
                    {data.tails.map((tail, idx) => (
                      <TailQuestionBlock key={idx} tail={tail} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TailQuestionBlock({ tail }: { tail: TailQuestion }) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="border-l-[2px] border-[#E7E5E4] pl-[16px] mb-[24px]">
      <div className="flex items-center gap-[8px] mb-[12px]">
        <span className="text-[10.5px] font-semibold text-white bg-[#78716C] px-[8px] py-[2.5px] rounded-[5px] uppercase tracking-wide">
          {tail.strategy}
        </span>
        <span className="text-[13.5px] font-medium text-[#1C1917]">{tail.question}</span>
      </div>
      
      <div className="bg-[#FAFAF9] rounded-[10px] p-[14px] mb-[16px]">
        <div className="text-[10.5px] font-semibold text-[#A8A29E] mb-[6px]">내 답변</div>
        <p className="text-[12.5px] leading-[1.6] text-[#44403C]">{tail.answer}</p>
      </div>

      {/* 기본 3단 피드백 */}
      <div className="flex flex-col gap-[10px] mb-[16px]">
        <FeedbackRow label="잘한 점" colorClass="text-[#15803D] bg-[#F0FDF4]" text={tail.good} />
        <FeedbackRow label="아쉬운 점" colorClass="text-[#9A3412] bg-[#FFF7ED]" text={tail.weak} />
        <FeedbackRow label="다음엔" colorClass="text-white bg-[#0A0A0A]" text={tail.next} />
      </div>

      {(tail.weakAxis || tail.improvedAfter) && (
        <button 
          onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
          className="text-[12.5px] text-[#A8A29E] underline underline-offset-4 hover:text-[#57534E] transition-colors mb-[14px]"
        >
          {isFeedbackOpen ? '피드백 닫기' : '피드백 보기'}
        </button>
      )}

      {/* ✨ 수정: 심화 피드백 영역 API 구조 일치 */}
      {isFeedbackOpen && tail.weakAxis && tail.improvedAfter && (
        <div className="border-t border-[#F0EFED] pt-[16px] animate-in fade-in slide-in-from-top-1">
          <div className="mb-[20px]">
            <div className="text-[12px] font-semibold text-[#57534E] mb-[6px]">약한 축</div>
            <div className="text-[13px] leading-[1.55] text-[#78716C]">
              {tail.weakAxis}
            </div>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-[#57534E] mb-[10px]">개선된 답변 예시</div>
            
            {/* After만 표시 (꼬리질문은 before가 본문 answer이므로 생략) */}
            <div className="bg-[#0A0A0A] rounded-[11px] p-[14px]">
              <div className="text-[11px] font-semibold text-[#15803D] mb-[6px]">After · 개선된 답변</div>
              <p className="text-[12.5px] leading-[1.6] text-[#E7E5E4]">{tail.improvedAfter}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 공통 피드백 행 컴포넌트
function FeedbackRow({ label, colorClass, text }: { label: string, colorClass: string, text: string }) {
  return (
    <div className="flex items-start gap-[10px]">
      <span className={`text-[11px] font-semibold px-[8px] py-[3.5px] rounded-[6px] whitespace-nowrap mt-[2px] ${colorClass}`}>
        {label}
      </span>
      <span className="text-[13.5px] leading-[1.55] text-[#1C1917] flex-1">
        {text}
      </span>
    </div>
  );
}