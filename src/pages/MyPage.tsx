import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/common/Header";
import MemberPageHero from "@/components/common/MemberPageHero";
import LoadingState from "@/components/common/LoadingState";
import MemberPageBody from "@/components/common/MemberPageBody";
import AccountSection from "@/components/mypage/AccountSection";
import DocumentList, {
  type SupportDocument,
} from "@/components/mypage/DocumentList";
import useMyPage from "@/hooks/useMyPage";
import MyQuestionsSection from "@/components/mypage/MyQuestionsSection";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useInterviewStore } from "@/store/useInterviewStore";
import { isAxiosError } from "axios";

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const questionAudioEnabled = useInterviewStore((state) => state.questionAudioEnabled);
  const setQuestionAudioEnabled = useInterviewStore((state) => state.setQuestionAudioEnabled);
  const { showAlert, showConfirm } = useAlertStore();
  
  const {
    user,
    documents,
    documentsError,
    documentsLoading,
    retryDocuments,
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

  if (!isLoggedIn) return <Navigate to="/" replace />;

  return (
    <div className="member-page">
      <Header hideBackButton />

      {isWithdrawing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-white px-8 py-6 shadow-xl text-center">
            <LoadingState title="회원 탈퇴를 처리하고 있어요" description="잠시만 기다려 주세요." />
          </div>
        </div>
      )}

      <div inert={isWithdrawing} aria-busy={isWithdrawing}>
      {isLoading && <p role="status" className="sr-only">내 정보와 서류를 불러오고 있어요</p>}
      <MemberPageHero eyebrow="마이페이지" title="내 정보와 지원 서류" />
      <MemberPageBody layout="profile" loading={false} pending={isLoading}>
      {isError ? <>
        <p role="alert" className="text-[14px] text-muted-foreground">마이페이지 정보를 불러오지 못했습니다.</p>
        <div className="mt-8"><MyQuestionsSection /><AccountSection onLogout={handleLogout} onWithdraw={handleWithdraw} /></div>
      </> : <>

        <section className="member-profile-section">
          <h2 className="member-section-eyebrow">
            프로필
          </h2>
          {isEditingNickname ? (
            <div className="member-profile-card">
              <div className="member-profile-person">
                <div className="member-profile-avatar">
                  {avatarText}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="member-field-caption">
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
                    aria-label="새 닉네임" className="member-nickname-input"
                    autoFocus
                  />
                </div>
              </div>
              <div className="member-profile-actions">
                <button
                  onClick={handleEditNicknameCancel}
                  className="member-button"
                >
                  취소
                </button>
                <button
                  onClick={handleEditNicknameSave}
                  className="member-button member-button--primary"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div className="member-profile-card">
              <div className="member-profile-person">
                <div className="member-profile-avatar">
                  {avatarText}
                </div>
                <div>
                  <p className="member-field-caption">
                    닉네임
                  </p>
                  <p className="member-profile-name">
                    {user ? `${user.nickname}님` : "닉네임을 확인하고 있어요"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEditNicknameStart}
                disabled={!user}
                className="member-button"
              >
                닉네임 변경
              </button>
            </div>
          )}
        </section>

        <section>
          <DocumentList
            documents={supportDocuments}
            loading={documentsLoading}
            error={documentsError}
            onRetry={retryDocuments}
            onRename={handleRename}
            onDelete={handleDelete}
            onUpload={handleUploadClick}
          />
        </section>

        <MyQuestionsSection />

        <div className="my-12 h-px bg-border" />

        <section className="mb-12" aria-labelledby="interview-settings-title">
          <h2 id="interview-settings-title" className="member-section-eyebrow">
            면접 설정
          </h2>
          <div className="member-setting-card">
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
      </>}
      </MemberPageBody>
      </div>
    </div>
  );
}
