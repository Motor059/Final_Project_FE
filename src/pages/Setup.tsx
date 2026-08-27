import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdvancedSetting from "@/components/setup/AdvancedSetting";
import SelectionCard from "@/components/setup/SelectionCard";
import { Button } from "@/components/ui/button";
import Header from "@/components/common/Header";
import { useInterviewStore } from "@/store/useInterviewStore";

import useSetup from "@/hooks/useSetup";

import type {
  CompanyType,
  InterviewStage,
} from "@/types/setup";

export default function Setup() {
  const navigate = useNavigate();
  const { resetInterview } = useInterviewStore();

  const {
    options,
    isOptionsLoading,
    isStarting,
    isError,
    startInterview,
  } = useSetup();

  const [companyType, setCompanyType] =
    useState<CompanyType | null>(null);

  const [interviewStage, setInterviewStage] =
    useState<InterviewStage | null>(null);

  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [documentFile, setDocumentFile] =
    useState<File | null>(null);

  const canStart = useMemo(
    () =>
      companyType !== null &&
      interviewStage !== null &&
      !isStarting,
    [companyType, interviewStage, isStarting],
  );

  const handleStart = async () => {
    if (
      !canStart ||
      companyType === null ||
      interviewStage === null
    ) {
      return;
    }

    try {
      const sessionId = await startInterview({
        companyType,
        interviewStage,
        companyName: companyName.trim() || undefined,
        jobRole: jobRole.trim() || undefined,
        jobDescription:
          jobDescription.trim() || undefined,
      });

      sessionStorage.setItem(
        "interviewSetup",
        JSON.stringify({
          companyType,
          interviewStage,
          jobRole: jobRole.trim(),
          companyName: companyName.trim(),
          jobDescription: jobDescription.trim(),
          documentName: documentFile?.name ?? null,
          sessionId,
        }),
      );

      sessionStorage.setItem(
        "interviewSessionId",
        String(sessionId),
      );

      navigate("/interview");
    } catch (error) {
      console.error("모의면접 시작 실패:", error);

      window.alert(
        "면접 준비 중 문제가 발생했습니다.",
      );
    }
  };

  if (isOptionsLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-[760px] px-5 py-12 sm:px-10 sm:py-14">
          <p className="text-[14px] text-muted-foreground">
            면접 설정을 불러오는 중입니다.
          </p>
        </div>
      </main>
    );
  }

  if (!options) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-[760px] px-5 py-12 sm:px-10 sm:py-14">
          <p className="text-[14px] text-muted-foreground">
            면접 설정을 불러오지 못했습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[760px] px-5 pb-28 pt-12 sm:px-10 sm:pt-14">
        <header className="mb-11">
          <p className="mb-2.5 text-[13px] font-medium text-muted-foreground">
            모의면접 설정
          </p>

          <h1 className="text-[34px] font-medium leading-[1.08] tracking-[-0.02em] text-foreground sm:text-[40px]">
            어떤 면접을 연습할까요?
          </h1>

          <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
            기업 유형과 면접 단계를 선택하면 질문과 평가 기준을 맞춰드려요.
          </p>
        </header>

        <div className="space-y-10">
          <section>
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-foreground">
                기업 유형
              </h2>

              <p className="mt-1 text-[12.5px] text-muted-foreground">
                지원하려는 기업과 가장 가까운 유형을 선택해 주세요.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {options.companyTypes.map((item) => (
                <SelectionCard
                  key={item.code}
                  title={item.label}
                  description={item.example}
                  selected={companyType === item.code}
                  onClick={() =>
                    setCompanyType(item.code)
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-foreground">
                면접 단계
              </h2>

              <p className="mt-1 text-[12.5px] text-muted-foreground">
                준비하고 싶은 면접 단계를 선택해 주세요.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {options.stages.map((item) => (
                <SelectionCard
                  key={item.code}
                  title={item.label}
                  selected={
                    interviewStage === item.code
                  }
                  onClick={() =>
                    setInterviewStage(item.code)
                  }
                />
              ))}
            </div>
          </section>

          <AdvancedSetting
            jobRole={jobRole}
            jobRoleOptions={options.jobRoleChips}
            companyName={companyName}
            jobDescription={jobDescription}
            documentFile={documentFile}
            onJobRoleChange={setJobRole}
            onCompanyNameChange={setCompanyName}
            onJobDescriptionChange={
              setJobDescription
            }
            onDocumentFileChange={setDocumentFile}
          />
        </div>

        {isError && (
          <p className="mt-5 text-center text-[12.5px] text-destructive">
            요청 처리 중 문제가 발생했습니다.
          </p>
        )}

        <div className="sticky bottom-0 mt-9 bg-gradient-to-t from-background via-background to-transparent pb-1 pt-6">
          <Button
            type="button"
            onClick={handleStart}
            disabled={!canStart}
            className="h-12 w-full rounded-xl text-[15px] font-semibold"
          >
            {isStarting
              ? "면접 준비 중..."
              : "모의면접 시작"}
          </Button>

          {!canStart && !isStarting && (
            <p className="mt-2.5 text-center text-[12.5px] text-muted-foreground">
              기업 유형과 면접 단계를 선택하면 시작할 수 있어요.
            </p>
          </header>

          <div className="space-y-10">
            <section>
              <div className="mb-4">
                <h2 className="text-[14px] font-semibold text-foreground">
                  기업 유형
                </h2>

                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  지원하려는 기업과 가장 가까운 유형을 선택해 주세요.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {COMPANY_TYPES.map((item) => (
                  <SelectionCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    detail={item.detail}
                    selected={companyType === item.id}
                    onClick={() => setCompanyType(item.id)}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-[14px] font-semibold text-foreground">
                  면접 단계
                </h2>

                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  준비하고 싶은 면접 단계를 선택해 주세요.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {INTERVIEW_STAGES.map((item) => (
                  <SelectionCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    selected={interviewStage === item.id}
                    onClick={() => setInterviewStage(item.id)}
                  />
                ))}
              </div>
            </section>

            <AdvancedSetting
              jobRole={jobRole}
              companyName={companyName}
              jobDescription={jobDescription}
              documentFile={documentFile}
              onJobRoleChange={setJobRole}
              onCompanyNameChange={setCompanyName}
              onJobDescriptionChange={setJobDescription}
              onDocumentFileChange={setDocumentFile}
            />
          </div>

          <div className="sticky bottom-0 mt-9 bg-gradient-to-t from-background via-background to-transparent pb-1 pt-6">
            <Button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="h-12 w-full rounded-xl text-[15px] font-semibold"
            >
              모의면접 시작
            </Button>

            {!canStart && (
              <p className="mt-2.5 text-center text-[12.5px] text-muted-foreground">
                기업 유형과 면접 단계를 선택하면 시작할 수 있어요.
              </p>
            )}
          </div>
        </div>
      </main>
    </> 
  );
}