export default function FeatureSection() {
  const features = [
    { label: "음성 면접", title: "AI 면접관과 음성으로", desc: "질문을 음성으로 듣고 답하면, 답변에 반응해 실시간으로 꼬리 질문이 이어집니다." },
    { label: "유형 특화", title: "기업 유형별 특화", desc: "대기업 SW · 서비스 기업 · 금융 IT. 유형마다 다른 질문과 평가 기준을 적용합니다." },
    { label: "Deep Dive", title: "한 주제를 끝까지", desc: "\"왜 그 기술을 골랐나요?\" 한 주제를 끝까지 파고들어 실전처럼 압박합니다." }
  ];

  return (
    <section className="py-[70px] px-[40px]">
      <h2 className="text-[14px] font-semibold text-[#78716C] mb-[28px] tracking-[-0.01em]">
        Devoir로 이렇게 연습해요
      </h2>
      
      <div className="grid grid-cols-3 gap-[36px]">
        {features.map((feature, idx) => (
          <div key={idx} className="pt-[24px] px-[4px] border-t border-[#E0DEDA]">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#A8A29E] mb-[14px]">
              {feature.label}
            </div>
            <h3 className="text-[19px] font-semibold mb-[10px] tracking-[-0.01em]">
              {feature.title}
            </h3>
            <p className="text-[14px] leading-[1.6] text-[#78716C] m-0">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}