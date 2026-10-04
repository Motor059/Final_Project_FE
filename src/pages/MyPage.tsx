import { useRef, useState } from "react";

import Header from "@/components/common/Header";
import AccountSection from "@/components/mypage/AccountSection";
import DocumentList, {
  type SupportDocument,
} from "@/components/mypage/DocumentList";
import useMyPage from "@/hooks/useMyPage";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/useAlertStore";

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((state) => state.logout);
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
    showConfirm("회원 탈퇴를 진행하시겠습니까?", async () => {
      try {
        await removeAccount();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        showAlert("회원 탈퇴에 실패했습니다.");
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
      showAlert("호칭은 1~50자 사이로 입력해주세요. (공백만 입력 불가)");
      return;
    }

    try {
      await changeNickname(trimmed);
      setIsEditingNickname(false);
    } catch (error: any) {
      console.error("호칭 변경 실패:", error);
      const errorMessage = error.response?.data?.message || "호칭 변경에 실패했습니다.";
      showAlert(errorMessage);
    }
  };

  const avatarText = user?.nickname ? user.nickname.charAt(0) : "유";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-[68px]">
        <Header />
        <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-8">
          <p className="text-[14px] text-muted-foreground">
            마이페이지 정보를 불러오는 중입니다.
          </p>
        </main>
      </div>
    );
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

      <main className="mx-auto w-full max-w-[760px] px-5 py-10 md:px-8 md:py-16">
        
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
                    호칭
                  </p>
                  <input
                    value={draftNickname}
                    onChange={(e) => setDraftNickname(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditNicknameSave();
                      if (e.key === 'Escape') handleEditNicknameCancel();
                    }}
                    placeholder="새 호칭 입력"
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
                    호칭
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
                호칭 변경
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