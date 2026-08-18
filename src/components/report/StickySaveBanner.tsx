export default function StickySaveBanner() {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-30 bg-white/90 backdrop-blur-md border-t border-[#EBEAE7] py-[16px] px-[40px] animate-in slide-in-from-bottom-4">
      <div className="max-w-[780px] mx-auto flex items-center justify-between gap-[20px] flex-wrap">
        <span className="text-[14.5px] text-[#1C1917] font-medium">
          로그인하면 이 결과가 저장돼서 나중에 다시 볼 수 있어요.
        </span>
        <button className="px-[22px] py-[11px] bg-[#FEE500] text-[#1C1917] font-semibold text-[14px] rounded-[11px] whitespace-nowrap hover:bg-[#F4DC00] transition-colors">
          카카오로 로그인하고 저장하기
        </button>
      </div>
    </div>
  );
}