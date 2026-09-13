import { useInterviewStore } from "@/store/useInterviewStore";
import { useNavigate } from "react-router-dom";

export default function ExitConfirmModal() {
  const { 
    isExitModalOpen, 
    setExitModalOpen, 
    exitTargetPath, 
    cancelCurrentSession 
  } = useInterviewStore();
  const navigate = useNavigate();

  if (!isExitModalOpen) return null;

  const handleExit = async () => {
    await cancelCurrentSession();
    setExitModalOpen(false);
    navigate(exitTargetPath || '/home');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-6 w-[320px] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        
        <h2 className="text-[20px] font-bold text-[#111111] mb-2 tracking-tight">
          면접을 종료하시겠어요?
        </h2>
        <p className="text-[#767676] text-[15px] leading-relaxed mb-8 tracking-tight">
          지금 나가면 진행 중인 면접 내용이<br />
          저장되지 않아요.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleExit}
            className="w-full py-4 bg-[#111111] hover:bg-black text-white text-[16px] font-semibold rounded-[14px] transition-colors"
          >
            나가기
          </button>
          <button
            onClick={() => setExitModalOpen(false)}
            className="w-full py-4 bg-white hover:bg-gray-50 text-[#111111] border border-[#E5E5E5] text-[16px] font-semibold rounded-[14px] transition-colors"
          >
            계속 면접하기
          </button>
        </div>
        
      </div>
    </div>
  );
}