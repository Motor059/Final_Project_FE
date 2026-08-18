interface ReportHeroProps {
  title: string;
  suggestion: string;
}

export default function ReportHero({ title, suggestion }: ReportHeroProps) {
  return (
    <section 
      className="relative overflow-hidden rounded-[22px] px-8 py-[34px] pb-8 mb-4 text-white shadow-[0_18px_50px_rgba(10,10,10,0.22)]"
      style={{
        background: 'linear-gradient(150deg, #2b2740 0%, #0a0a0a 56%, #16242a 100%)'
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(60% 80% at 88% -10%, rgba(150,140,255,0.20), transparent 64%)'
        }}
      />

      <div className="relative z-10 flex flex-col">
        <div className="inline-flex items-center gap-[7px] text-[12px] font-semibold text-[#D6D3D1] tracking-[0.04em] uppercase mb-[18px]">
          이번 면접의 핵심 코칭
        </div>

        <h2 className="text-[27px] leading-[1.34] font-medium tracking-[-0.01em] mb-[22px] text-balance">
          {title}
        </h2>

        <div className="flex gap-[12px] items-start pt-[22px] border-t border-white/12">
          <span 
            className="text-[11px] font-semibold text-[#1C1917] px-[9px] py-[4px] rounded-[7px] whitespace-nowrap mt-[2px]"
            style={{
              background: `
                radial-gradient(circle at 25% 35%, rgba(170,100,255,0.62) 0%, transparent 88%), 
                radial-gradient(circle at 78% 28%, rgba(255,160,90,0.56) 0%, transparent 85%), 
                radial-gradient(circle at 50% 90%, rgba(80,210,155,0.50) 0%, transparent 80%), 
                #faf9f5
              `
            }}
          >
            다음 면접
          </span>
          <p className="text-[15.5px] leading-[1.55] text-[#E7E5E4]">
            {suggestion}
          </p>
        </div>
      </div>
    </section>
  );
}