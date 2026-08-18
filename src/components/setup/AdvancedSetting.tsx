import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import JobRoleChips from "./JobRoleChips";
import PdfDropzone from "./PdfDropzone";

interface AdvancedSettingProps {
  jobRole: string;
  companyName: string;
  jobDescription: string;
  documentFile: File | null;
  onJobRoleChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onDocumentFileChange: (file: File | null) => void;
}

export default function AdvancedSetting({
  jobRole,
  companyName,
  jobDescription,
  documentFile,
  onJobRoleChange,
  onCompanyNameChange,
  onJobDescriptionChange,
  onDocumentFileChange,
}: AdvancedSettingProps) {
  const [open, setOpen] = useState(false);

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

              <PdfDropzone
                file={documentFile}
                onChange={onDocumentFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}