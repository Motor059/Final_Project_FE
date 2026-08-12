import { useRef, useState } from "react";

import Header from "@/components/common/Header";
import AccountSection from "@/components/mypage/AccountSection";
import DocumentList, {
  type SupportDocument,
} from "@/components/mypage/DocumentList";

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<SupportDocument[]>([]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (
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

    const fileName = file.name.replace(/\.pdf$/i, "");

    const today = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const newDocument: SupportDocument = {
      id: Date.now(),
      name: fileName,
      meta: `PDF · ${today}`,
    };

    setDocuments((currentDocuments) => [
      ...currentDocuments,
      newDocument,
    ]);

    event.target.value = "";
  };

  const handleRename = (id: number, name: string) => {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === id
          ? {
              ...document,
              name,
            }
          : document,
      ),
    );
  };

  const handleDelete = (id: number) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== id),
    );
  };

  const handleLogout = () => {
    window.alert("로그아웃 기능은 API 연결 후 동작하도록 구현할 예정입니다.");
  };

  return (
    <div className="min-h-screen bg-background">
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
            지원 서류와 계정 정보를 관리할 수 있어요.
          </p>
        </div>

        <div className="mt-12">
          <DocumentList
            documents={documents}
            onRename={handleRename}
            onDelete={handleDelete}
            onUpload={handleUploadClick}
          />
        </div>

        <div className="my-12 h-px bg-border" />

        <AccountSection onLogout={handleLogout} />

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