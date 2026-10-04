import { useState } from "react";
import { Plus } from "lucide-react";

export interface SupportDocument {
  id: number;
  name: string;
  meta: string;
}

interface DocumentListProps {
  documents: SupportDocument[];
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onUpload: () => void;
}

export default function DocumentList({
  documents,
  onRename,
  onDelete,
  onUpload,
}: DocumentListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  const startEditing = (document: SupportDocument) => {
    setEditingId(document.id);
    setDraftName(document.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftName("");
  };

  const saveEditing = (id: number) => {
    const trimmedName = draftName.trim();
    if (!trimmedName) return;

    onRename(id, trimmedName);
    cancelEditing();
  };

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-[15px] font-bold text-foreground">
            내 지원 서류 <span className="font-medium text-muted-foreground ml-0.5">{documents.length}개</span>
          </h3>

          {documents.length > 0 && (
            <button
              type="button"
              onClick={onUpload}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              서류 올리기
            </button>
          )}
        </div>
        
        <p className="mt-2.5 text-[13px] text-muted-foreground">
          올린 서류는 면접 설정 화면에서도 그대로 골라 쓸 수 있어요. PDF만 올릴 수 있어요.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
          <p className="text-[14px] text-muted-foreground">
            아직 올린 지원 서류가 없어요.
          </p>

          <button
            type="button"
            onClick={onUpload}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-[14px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            지원 서류 올리기 (PDF)
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {documents.map((document, index) => {
            const isEditing = editingId === document.id;

            return (
              <div
                key={document.id}
                className={[
                  "flex items-center justify-between gap-4 px-5 py-4.5 sm:px-6 sm:py-5",
                  index !== documents.length - 1
                    ? "border-b border-border"
                    : "",
                ].join(" ")}
              >
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveEditing(document.id);
                        if (event.key === "Escape") cancelEditing();
                      }}
                      autoFocus
                      className="w-full max-w-sm rounded-lg border border-primary bg-background px-3 py-2 text-[14px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14.5px] font-medium text-foreground">
                            {document.name}
                          </p>
                          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                            {document.meta}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditing(document.id)}
                        className="rounded-lg bg-black px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                      >
                        저장
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(document)}
                        className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        이름 수정
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(document.id)}
                        className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-muted"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}