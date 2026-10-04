import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import JobRoleChips from "./JobRoleChips";
import PdfDropzone from "./PdfDropzone";

interface AdvancedSettingProps {
  jobRole: string;
  jobRoleOptions: string[];
  companyName: string;
  jobDescription: string;
  documentFile: File | null;
  onJobRoleChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onDocumentFileChange: (file: File | null) => void;
  documents?: { docId: number; fileName: string; createdAt: string }[];
  selectedDocId: number | null;
  onSelectedDocIdChange: (id: number | null) => void;
}

export default function AdvancedSetting({
  jobRole,
  jobRoleOptions,
  companyName,
  jobDescription,
  documentFile,
  onJobRoleChange,
  onCompanyNameChange,
  onJobDescriptionChange,
  onDocumentFileChange,
  documents = [],
  selectedDocId,
  onSelectedDocIdChange,
}: AdvancedSettingProps) {
  const [open, setOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelectSavedDocument = (docId: number) => {
    onSelectedDocIdChange(docId);
    onDocumentFileChange(null);
    setIsDropdownOpen(false);
  };

  const handleNewFileChange = (file: File | null) => {
    onDocumentFileChange(file);
    if (file) {
      onSelectedDocIdChange(null);
      setIsDropdownOpen(false);
    }
  };

  const selectedDocument = documents.find((doc) => doc.docId === selectedDocId);

  return (
    <section className="border-t border-border pt-6">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div>
          <p className="text-[14px] font-semibold text-foreground">
            맞춤 설정 추가
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            직무, 회사, 채용공고와 지원 서류를 추가하면 질문이 더 정교해져요.
          </p>
        </div>

        <span
          aria-hidden="true"
          className={[
            "text-lg text-muted-foreground transition-transform duration-200",
            open ? "rotate-45" : "",
          ].join(" ")}
        >
          +
        </span>
      </button>

      <div
        className={[
          "grid transition-all duration-200 ease-out",
          open
            ? "mt-6 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 pb-1">
            <div>
              <label
                htmlFor="job-role"
                className="mb-2 block text-[13.5px] font-semibold"
              >
                지원 직무
              </label>

              <Input
                id="job-role"
                value={jobRole}
                onChange={(event) => onJobRoleChange(event.target.value)}
                placeholder="예: 백엔드 개발자"
              />

              <div className="mt-2.5">
                <JobRoleChips
                  value={jobRole}
                  options={jobRoleOptions}
                  onChange={onJobRoleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="mb-2 block text-[13.5px] font-semibold"
              >
                회사명
              </label>

              <Input
                id="company-name"
                value={companyName}
                onChange={(event) => onCompanyNameChange(event.target.value)}
                placeholder="예: 카카오"
              />
            </div>

            <div>
              <label
                htmlFor="job-description"
                className="mb-2 block text-[13.5px] font-semibold"
              >
                채용공고 (JD)
              </label>

              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) =>
                  onJobDescriptionChange(event.target.value)
                }
                placeholder="공고 내용을 복사해 붙여넣으세요."
                rows={4}
                className="resize-y"
              />
            </div>

            <div>
              <div className="mb-2">
                <p className="text-[13.5px] font-semibold">지원 서류</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  이력서나 자기소개서 PDF를 추가할 수 있어요.
                </p>
              </div>

              {selectedDocument ? (
                <div className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-4 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Check className="h-4 w-4 shrink-0" />
                    <span className="truncate text-[14px] font-medium">
                      {selectedDocument.fileName} 사용 중
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectedDocIdChange(null)}
                    className="ml-4 shrink-0 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents && documents.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-border bg-background">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between p-4 text-[14px] font-medium"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span>
                          저장된 서류에서 선택{" "}
                          <span className="ml-1 text-muted-foreground">
                            {documents.length}개
                          </span>
                        </span>
                        {isDropdownOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {isDropdownOpen && (
                        <div className="max-h-60 overflow-y-auto border-t border-border px-2 pb-2 pt-1">
                          {documents.map((doc) => (
                            <div
                              key={doc.docId}
                              onClick={() => handleSelectSavedDocument(doc.docId)}
                              className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                            >
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1 overflow-hidden">
                                <p className="truncate text-[14px] font-medium text-foreground">
                                  {doc.fileName}
                                </p>
                                <p className="text-[12px] text-muted-foreground">
                                  PDF ·{" "}
                                  {new Date(doc.createdAt).toLocaleDateString(
                                    "ko-KR",
                                    {
                                      month: "numeric",
                                      day: "numeric",
                                    }
                                  )}{" "}
                                  업로드
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <PdfDropzone
                      file={documentFile}
                      onChange={handleNewFileChange}
                    />
                  </div>
                </div>
              )}

              <p className="mt-3 text-[12.5px] text-muted-foreground">
                올린 지원 서류는 자동 저장돼요. 마이페이지에서 언제든 삭제할 수
                있어요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}