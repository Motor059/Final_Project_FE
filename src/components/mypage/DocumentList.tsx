import { useState } from "react";

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

    if (!trimmedName) {
      return;
    }

    onRename(id, trimmedName);
    cancelEditing();
  };

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground">
            지원 서류
          </p>

          <p className="mt-1 text-[12px] text-muted-foreground">
            이력서와 자기소개서 PDF를 관리할 수 있어요.
          </p>
        </div>

        {documents.length > 0 && (
          <button
            type="button"
            onClick={onUpload}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            PDF 올리기
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            아직 올린 지원 서류가 없어요.
          </p>

          <button
            type="button"
            onClick={onUpload}
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            지원 서류 올리기 (PDF)
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {documents.map((document, index) => {
            const isEditing = editingId === document.id;

            return (
              <div
                key={document.id}
                className={[
                  "flex items-center justify-between gap-4 px-5 py-4",
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
                        if (event.key === "Enter") {
                          saveEditing(document.id);
                        }

                        if (event.key === "Escape") {
                          cancelEditing();
                        }
                      }}
                      autoFocus
                      className="w-full rounded-lg border border-primary bg-background px-3 py-2 text-[14px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    <>
                      <p className="truncate text-[14px] font-medium text-foreground">
                        {document.name}
                      </p>

                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {document.meta}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-lg border border-border px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted"
                      >
                        취소
                      </button>

                      <button
                        type="button"
                        onClick={() => saveEditing(document.id)}
                        className="rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        저장
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(document)}
                        className="rounded-lg px-2.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        이름 수정
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(document.id)}
                        className="rounded-lg px-2.5 py-2 text-[12.5px] text-destructive transition-colors hover:bg-muted"
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