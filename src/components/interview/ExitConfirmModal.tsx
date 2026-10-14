import { useState } from 'react';
import { LoadingIndicator } from '@/components/common/LoadingState';
import { useInterviewStore } from '@/store/useInterviewStore';
import { useNavigate, type Blocker } from 'react-router-dom';

export default function ExitConfirmModal({ blocker }: { blocker: Blocker }) {
  const { isExitModalOpen, setExitModalOpen, exitTargetPath, cancelCurrentSession } = useInterviewStore();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBlocked = blocker.state === 'blocked';
  if (!isExitModalOpen && !isBlocked) return null;

  const handleExit = async () => {
    if (isExiting) return;
    useInterviewStore.getState().setPaused(true);
    setIsExiting(true);
    setError(null);
    try {
      await cancelCurrentSession();
      setExitModalOpen(false);
      if (blocker.state === 'blocked') blocker.proceed();
      else navigate(exitTargetPath || '/', { replace: true });
    } catch (failure) {
      console.error('면접 종료 실패:', failure);
      setError('면접 종료 요청에 실패했습니다. 다시 시도하거나 계속 면접해 주세요.');
    } finally {
      setIsExiting(false);
    }
  };

  const handleContinue = () => {
    if (isExiting) return;
    setError(null);
    setExitModalOpen(false);
    if (blocker.state === 'blocked') blocker.reset();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-6 w-[320px] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        <h2 className="text-[20px] font-bold text-[#111111] mb-2 tracking-tight">면접을 종료하시겠어요?</h2>
        <p className="text-[#767676] text-[15px] leading-relaxed mb-8 tracking-tight">
          지금 나가면 진행 중인 면접 내용이<br />저장되지 않아요.
        </p>
        {error && <p className="text-sm text-red-600 mb-4" role="alert">{error}</p>}
        <div className="flex flex-col gap-2">
          <button onClick={() => { void handleExit(); }} disabled={isExiting} className="w-full py-4 bg-[#111111] hover:bg-black text-white text-[16px] font-semibold rounded-[14px] transition-colors disabled:opacity-50">
            {isExiting ? <span className="inline-flex items-center justify-center gap-2"><LoadingIndicator size="sm" />종료 중</span> : '나가기'}
          </button>
          <button onClick={handleContinue} disabled={isExiting} className="w-full py-4 bg-white hover:bg-gray-50 text-[#111111] border border-[#E5E5E5] text-[16px] font-semibold rounded-[14px] transition-colors disabled:opacity-50">
            계속 면접하기
          </button>
        </div>
      </div>
    </div>
  );
}
