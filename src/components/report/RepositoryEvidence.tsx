import { FileCode2, FolderGit2 } from "lucide-react";
import type { RepositoryEvidenceFile } from "@/types/reportView";

export default function RepositoryEvidence({ files }: { files: readonly RepositoryEvidenceFile[] }) {
  const evidence = files.filter((file) => file.path.trim().length > 0);
  if (evidence.length === 0) return null;

  return (
    <section aria-label="질문의 근거 파일" className="mb-[18px] min-w-0 rounded-[12px] border border-[#E8E5EF] bg-[#FAF9FC] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#746680]">
        <FolderGit2 size={15} aria-hidden="true" /><h5>질문의 근거 파일</h5><span className="font-normal text-[#A8A29E]">{evidence.length}개</span>
      </div>
      <ul className="space-y-3">
        {evidence.map((file, index) => (
          <li key={`${file.path}-${index}`} className="flex min-w-0 items-start gap-2.5">
            <FileCode2 size={15} className="mt-0.5 shrink-0 text-[#A8A29E]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {file.repositoryName && <p className="mb-1 text-[11px] text-[#A8A29E] break-words">{file.repositoryName}</p>}
              <code className="block whitespace-pre-wrap break-all text-[12px] leading-6 text-[#57534E]">{file.path}</code>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
