import { useState } from "react";
import { FileText, Plus } from "lucide-react";

export interface SupportDocument { id: number; name: string; meta: string; }
interface DocumentListProps {
  documents: SupportDocument[];
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onUpload: () => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export default function DocumentList({ documents, onRename, onDelete, onUpload, loading = false, error = false, onRetry }: DocumentListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const startEditing = (document: SupportDocument) => { setEditingId(document.id); setDraftName(document.name); };
  const cancelEditing = () => { setEditingId(null); setDraftName(""); };
  const saveEditing = (id: number) => {
    const trimmedName = draftName.trim();
    if (!trimmedName) return;
    onRename(id, trimmedName);
    cancelEditing();
  };

  return <section className="member-documents" aria-labelledby="support-documents-title">
    <div className="member-documents-heading">
      <div className="member-documents-title-row">
        <h2 id="support-documents-title" className="member-documents-title">내 지원 서류 {!loading && !error && <span>{documents.length}개</span>}</h2>
        {documents.length > 0 && <button type="button" onClick={onUpload} className="member-button member-button--upload"><Plus size={18} aria-hidden="true" />서류 올리기</button>}
      </div>
      <p className="member-documents-description">올린 서류는 면접 설정 화면에서도 그대로 골라 쓸 수 있어요. PDF만 올릴 수 있어요.</p>
    </div>
    {loading ? <p role="status" className="member-documents-description devoir-loading-enter">지원 서류를 확인하고 있어요.</p> : error ? <div role="alert" className="member-notice">지원 서류를 불러오지 못했어요. {onRetry && <button type="button" className="member-text-button" onClick={onRetry}>다시 불러오기</button>}</div> : documents.length === 0 ? <div className="member-empty-state">
      <p>아직 올린 지원 서류가 없어요.</p>
      <button type="button" onClick={onUpload} className="member-button member-button--upload mt-5"><Plus size={18} aria-hidden="true" />지원 서류 올리기 (PDF)</button>
    </div> : <div className="member-document-list">
      {documents.map((document) => <div key={document.id} className="member-document-card">
        <div className="member-document-main">
          <FileText className="member-document-icon" strokeWidth={1.7} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            {editingId === document.id ? <input aria-label="서류 이름" value={draftName} onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") saveEditing(document.id); if (event.key === "Escape") cancelEditing(); }}
              autoFocus className="member-document-name-input" /> : <p className="member-document-name">{document.name}</p>}
            <p className="member-document-meta">{document.meta}</p>
          </div>
        </div>
        <div className="member-document-actions">
          {editingId === document.id ? <>
            <button type="button" onClick={cancelEditing} className="member-text-button">취소</button>
            <button type="button" onClick={() => saveEditing(document.id)} className="member-button member-button--primary">저장</button>
          </> : <>
            <button type="button" onClick={() => startEditing(document)} className="member-text-button" aria-label={`${document.name} 이름 수정`}>이름 수정</button>
            <button type="button" onClick={() => onDelete(document.id)} className="member-text-button is-danger" aria-label={`${document.name} 삭제`}>삭제</button>
          </>}
        </div>
      </div>)}
    </div>}
  </section>;
}
