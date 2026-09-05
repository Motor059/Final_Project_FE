import { useRef } from "react";

import Header from "@/components/common/Header";
import AccountSection from "@/components/mypage/AccountSection";
import DocumentList, {
  type SupportDocument,
} from "@/components/mypage/DocumentList";
import useMyPage from "@/hooks/useMyPage";
import { useAuthStore } from "@/store/authStore";

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((state) => state.logout);

  const {
    user,
    documents,
    isLoading,
    isError,
    addDocument,
    changeDocumentName,
    removeDocument,
    removeAccount,
  } = useMyPage();

  const supportDocuments: SupportDocument[] = (documents || []).map(
    (document) => ({
      id: document.docId,
      name: document.fileName,
      meta: `PDF · ${new Date(document.createdAt).toLocaleDateString("ko-KR")}`,
    }),
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      window.alert("PDF 파일만 업로드할 수 있어요.");
      event.target.value = "";
      return;
    }

    try {
      await addDocument(file);
    } catch (error) {
      console.error("서류 업로드 실패:", error);
      window.alert("서류 업로드에 실패했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRename = async (id: number, name: string) => {
    try {
      await changeDocumentName(id, name);
    } catch (error) {
      console.error("서류 이름 변경 실패:", error);
      window.alert("서류 이름 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeDocument(id);
    } catch (error) {
      console.error("서류 삭제 실패:", error);
      window.alert("서류 삭제에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");

    if (!confirmed) {
      return;
    }

    await logout();
  };

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      "회원 탈퇴를 진행하시겠습니까?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeAccount();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      window.location.href = "/home";
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      window.alert("회원 탈퇴에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-8 md:py-20">
          <p className="text-[14px] text-muted-foreground">
            마이페이지 정보를 불러오는 중입니다.
          </p>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-8 md:py-20">
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

      <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-8 md:py-20">
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground">
            내 정보
          </p>

          <h1 className="mt-2 text-[32px] font-bold tracking-[-0.03em] text-foreground md:text-[36px]">
            마이페이지
          </h1>

          <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
            {user?.nickname
              ? `${user.nickname}님의 지원 서류와 계정 정보를 관리할 수 있어요.`
              : "지원 서류와 계정 정보를 관리할 수 있어요."}
          </p>
        </div>

        <div className="mt-12">
          <DocumentList
            documents={supportDocuments}
            onRename={handleRename}
            onDelete={handleDelete}
            onUpload={handleUploadClick}
          />
        </div>

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