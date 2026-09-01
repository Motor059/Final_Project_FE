export default function Footer() {
  return (
    <footer className="flex items-center justify-between gap-[16px] pt-[40px] pb-[56px] mt-auto border-t border-[#F0EFED] flex-wrap">
      <div className="flex items-baseline gap-[10px]">
        <span className="font-serif text-[18px] font-semibold text-[#0A0A0A]">
          Devoir.
        </span>
        <span className="text-[13px] text-[#A8A29E]">
          Team Devoir · 한국 개발 취업 모의면접
        </span>
      </div>
      <span className="text-[13px] text-[#A8A29E]">
        문의: hello@devoir.kr
      </span>
    </footer>
  );
}