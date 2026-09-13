import { useAlertStore } from "@/store/useAlertStore";

export default function GlobalAlertModal() {
  const { isOpen, mode, message, closeAlert, onConfirm } = useAlertStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    closeAlert();
    if (onConfirm) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-6 w-[320px] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        <h2 className="text-[20px] font-bold text-[#111111] mb-2 tracking-tight">
          알림
        </h2>
        <p className="text-[#767676] text-[15px] leading-relaxed mb-8 tracking-tight whitespace-pre-wrap">
          {message}
        </p>

        {mode === 'confirm' ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-[#111111] hover:bg-black text-white text-[16px] font-semibold rounded-[14px] transition-colors"
            >
              확인
            </button>
            <button
              onClick={closeAlert}
              className="w-full py-4 bg-white hover:bg-gray-50 text-[#111111] border border-[#E5E5E5] text-[16px] font-semibold rounded-[14px] transition-colors"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-[#111111] hover:bg-black text-white text-[16px] font-semibold rounded-[14px] transition-colors"
          >
            확인
          </button>
        )}
      </div>
    </div>
  );
}