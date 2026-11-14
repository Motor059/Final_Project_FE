import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import PdfDropzone from "./PdfDropzone";
interface AdvancedSettingProps {
  canUseDocuments?: boolean;
  initiallyOpen?: boolean;
  jobRole: string;
  jobRoleOptions: string[];
  companyName: string;
  jobDescription: string;
  githubUrl: string;
  documentFile: File | null;
  onJobRoleChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onGithubUrlChange: (value: string) => void;
  onDocumentFileChange: (file: File | null) => void;
  documents?: { docId: number; fileName: string; createdAt: string }[];
  selectedDocId: number | null;
  onSelectedDocIdChange: (id: number | null) => void;
}

export default function AdvancedSetting({ canUseDocuments = false, initiallyOpen = false, jobRole, jobRoleOptions, companyName, jobDescription, githubUrl, documentFile, onJobRoleChange, onCompanyNameChange, onJobDescriptionChange, onGithubUrlChange, onDocumentFileChange, documents = [], selectedDocId, onSelectedDocIdChange }: AdvancedSettingProps) {
  const [open, setOpen] = useState(initiallyOpen);
  return <section className="panel pt-advanced-panel">
    <button type="button" className="acc" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="qa-custom-settings"><span><span className="t">맞춤 설정 추가</span> <span className="opt">선택</span><span className="d">직무, 회사명, 채용공고, 지원 서류, GitHub 레포. 넣을수록 질문이 정교해져요.</span></span><ChevronDown size={18} aria-hidden="true" /></button>
    <div id="qa-custom-settings" hidden={!open} className="pt-custom-fields">
      <div className="field"><label className="fl" htmlFor="job-role">직무</label><input id="job-role" className="inp" value={jobRole} onChange={(event) => onJobRoleChange(event.target.value)} placeholder="예: Spring 백엔드 개발자" /><div className="frow">{(jobRoleOptions ?? []).map((role) => <button type="button" key={role} className="chip" onClick={() => onJobRoleChange(role)}>{role}</button>)}</div></div>
      <div className="field"><label className="fl" htmlFor="company-name">회사명</label><input id="company-name" className="inp" value={companyName} onChange={(event) => onCompanyNameChange(event.target.value)} placeholder="예: 카카오" /><span className="hint">질문을 만들 때 힌트로 써요. 회사별 질문 DB가 있는 건 아니에요.</span></div>
      <div className="field"><label className="fl" htmlFor="job-description">채용공고 (JD)</label><textarea id="job-description" className="inp" rows={3} value={jobDescription} onChange={(event) => onJobDescriptionChange(event.target.value)} placeholder="공고 내용을 복사해 붙여넣으세요." /></div>
      <div className="field"><div className="fl">지원 서류 <span className="opt">이력서, 자소서 PDF</span></div>
        {canUseDocuments ? <><div className="docpick">{documents.map((doc) => <button type="button" className={`docrow${selectedDocId === doc.docId ? " on" : ""}`} key={doc.docId} aria-pressed={selectedDocId === doc.docId} onClick={() => { onSelectedDocIdChange(selectedDocId === doc.docId ? null : doc.docId); onDocumentFileChange(null); }}><span className="fi">PDF</span><span className="pt-file-name"><span className="t">{doc.fileName}</span><span className="d">{new Date(doc.createdAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} 업로드</span></span>{selectedDocId === doc.docId && <Check size={16} aria-hidden="true" />}</button>)}</div><PdfDropzone compact file={documentFile} onChange={(file) => { onDocumentFileChange(file); if (file) onSelectedDocIdChange(null); }} /><span className="hint">올린 서류는 자동 저장돼요. 마이페이지에서 언제든 삭제할 수 있어요.</span></> : <div className="note">지원 서류는 로그인 후 추가할 수 있어요. 서류 없이도 모의면접을 체험할 수 있어요.</div>}
      </div>
      <div className="field"><label className="fl" htmlFor="github-url">GitHub 레포 <span className="opt">공개 레포 URL</span></label><input id="github-url" className="inp" type="url" value={githubUrl} onChange={(event) => onGithubUrlChange(event.target.value)} placeholder="https://github.com/사용자/레포" /><span className="hint">공개 프로젝트 저장소 주소를 입력해 주세요.</span></div>
    </div>
  </section>;
}
