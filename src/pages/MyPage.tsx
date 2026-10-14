import { useRef, useState } from "react";

import Header from "@/components/common/Header";
import LoadingState from "@/components/common/LoadingState";
import PageLoading from "@/components/common/PageLoading";
import AccountSection from "@/components/mypage/AccountSection";
import DocumentList, {
  type SupportDocument,
} from "@/components/mypage/DocumentList";
import useMyPage from "@/hooks/useMyPage";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useInterviewStore } from "@/store/useInterviewStore";
import { isAxiosError } from "axios";

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const questionAudioEnabled = useInterviewStore((state) => state.questionAudioEnabled);
  const setQuestionAudioEnabled = useInterviewStore((state) => state.setQuestionAudioEnabled);
  const { showAlert, showConfirm } = useAlertStore();
  
  const {
    user,
    documents,
    isLoading,
    isError,
    addDocument,
    changeDocumentName,
    removeDocument,
    removeAccount,
    isWithdrawing,
    changeNickname,
  } = useMyPage();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [draftNickname, setDraftNickname] = useState("");

  const supportDocuments: SupportDocument[] = (documents || []).map(
    (document) => ({
      id: document.docId,
      name: document.fileName,
      meta: `PDF · ${new Date(document.createdAt).toLocaleDateString("ko-KR", { month: 'numeric', day: 'numeric' })} 업로드`,
    })
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      showAlert("PDF 파일만 업로드할 수 있어요.");
      event.target.value = "";
      return;
    }

    try {
      await addDocument(file);
    } catch (error) {
      console.error("서류 업로드 실패:", error);
      showAlert("서류 업로드에 실패했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRename = async (id: number, name: string) => {
    try {
      await changeDocumentName(id, name);
    } catch (error) {
      console.error("서류 이름 변경 실패:", error);
      showAlert("서류 이름 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeDocument(id);
    } catch (error) {
      console.error("서류 삭제 실패:", error);
      showAlert("서류 삭제에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    showConfirm("로그아웃 하시겠습니까?", async () => {
      await logout();
    });
  };

  const handleWithdraw = () => {
    if (useAuthStore.getState().isWithdrawing) return;
    showConfirm("회원 탈퇴를 진행하시겠습니까?", async () => {
      try {
        await removeAccount();
      } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
        showAlert(message || "회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  const handleEditNicknameStart = () => {
    setDraftNickname(user?.nickname || "");
    setIsEditingNickname(true);
  };

  const handleEditNicknameCancel = () => {
    setIsEditingNickname(false);
    setDraftNickname("");
  };

  const handleEditNicknameSave = async () => {
    const trimmed = draftNickname.trim();
    
    if (!trimmed || trimmed.length < 1 || trimmed.length > 50) {
      showAlert("닉네임은 1~50자 사이로 입력해주세요. (공백만 입력 불가)");
      return;
    }

    try {
      await changeNickname(trimmed);
      setIsEditingNickname(false);
    } catch (error: unknown) {
      console.error("닉네임 변경 실패:", error);
      const errorMessage = (isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined) || "닉네임 변경에 실패했습니다.";
      showAlert(errorMessage);
    }
  };

  const avatarText = user?.nickname ? user.nickname.charAt(0) : "유";

  if (isLoading) {
    return <PageLoading layout="profile" title="내 정보와 서류를 불러오고 있어요" />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background pt-[68px]">
        <Header />
        <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-8">
          <p className="text-[14px] text-muted-foreground">
            마이페이지 정보를 불러오지 못했습니다.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[68px]">
      <Header />

      {isWithdrawing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-white px-8 py-6 shadow-xl text-center">
            <LoadingState title="회원 탈퇴를 처리하고 있어요" description="잠시만 기다려 주세요." />
          </div>
        </div>
      )}

      <main inert={isWithdrawing} aria-busy={isWithdrawing} className="mx-auto w-full max-w-[760px] px-5 py-10 md:px-8 md:py-16">
        
        <div className="mb-12">
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-foreground md:text-[36px]">
            내 정보와 지원 서류
          </h1>
        </div>

        <section className="mb-14">
          <h2 className="mb-3 text-[14px] font-bold text-muted-foreground">
            프로필
          </h2>
          {isEditingNickname ? (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-1 items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-[20px] font-bold text-white sm:h-16 sm:w-16 sm:text-[22px]">
                  {avatarText}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-muted-foreground sm:text-[14px]">
                    닉네임
                  </p>
                  <input
                    value={draftNickname}
                    onChange={(e) => setDraftNickname(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditNicknameSave();
                      if (e.key === 'Escape') handleEditNicknameCancel();
                    }}
                    placeholder="새 닉네임 입력"
                    className="mt-1.5 w-full max-w-[220px] rounded-lg border border-foreground/30 bg-background px-3 py-1.5 text-[15px] font-bold text-foreground outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleEditNicknameCancel}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted sm:text-[14px]"
                >
                  취소
                </button>
                <button
                  onClick={handleEditNicknameSave}
                  className="rounded-lg bg-black px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 sm:text-[14px]"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-[20px] font-bold text-white sm:h-16 sm:w-16 sm:text-[22px]">
                  {avatarText}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-muted-foreground sm:text-[14px]">
                    닉네임
                  </p>
                  <p className="mt-0.5 text-[18px] font-bold text-foreground sm:text-[20px]">
                    {user?.nickname || "카카오사용자"}님
                  </p>
                </div>
              </div>
              <button
                onClick={handleEditNicknameStart}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted sm:px-5 sm:text-[14px]"
              >
                닉네임 변경
              </button>
            </div>
          )}
        </section>

        <section>
          <DocumentList
            documents={supportDocuments}
            onRename={handleRename}
            onDelete={handleDelete}
            onUpload={handleUploadClick}
          />
        </section>

        <div className="my-12 h-px bg-border" />

        <section className="mb-12" aria-labelledby="interview-settings-title">
          <h2 id="interview-settings-title" className="mb-3 text-[14px] font-bold text-muted-foreground">
            면접 설정
          </h2>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <p id="question-audio-title" className="text-[15px] font-semibold text-foreground">
                질문 음성 듣기
              </p>
              <p id="question-audio-description" className="mt-1 text-[13px] text-muted-foreground">
                면접 질문을 음성으로 읽어드려요.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[13px] font-medium text-muted-foreground" aria-hidden="true">
                {questionAudioEnabled ? "켜짐" : "꺼짐"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={questionAudioEnabled}
                aria-labelledby="question-audio-title"
                aria-describedby="question-audio-description"
                disabled={isWithdrawing}
                onClick={() => setQuestionAudioEnabled(!questionAudioEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:opacity-50 ${questionAudioEnabled ? "bg-black" : "bg-zinc-300"}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${questionAudioEnabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </section>

        <AccountSection
          onLogout={handleLogout}
          onWithdraw={handleWithdraw}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </main>
    </div>
  );
}
