import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import AdvancedSetting from "@/components/setup/AdvancedSetting";
import SelectionCard from "@/components/setup/SelectionCard";
import { Button } from "@/components/ui/button";
import Header from "@/components/common/Header";
import LoadingState, { LoadingIndicator } from "@/components/common/LoadingState";
import PageLoading from "@/components/common/PageLoading";
import { useInterviewStore } from "@/store/useInterviewStore";
import useSetup from "@/hooks/useSetup";
import useDocuments from "@/hooks/useDocuments";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/useAlertStore";

import type {
  CompanyType,
  InterviewStage,
  InterviewSetup,
  InterviewType,
  PrepMinutes,
} from "@/types/setup";

import { parseInterviewSetup, saveInterviewSetup } from '@/lib/interviewSetup';

export default function Setup() {
  const location = useLocation();
  return <SetupForm key={location.key} initialSetup={parseInterviewSetup(location.state?.retrySetup)} />;
}

function SetupForm({ initialSetup }: { initialSetup: InterviewSetup | null }) {
  const navigate = useNavigate();
  const { resetInterview } = useInterviewStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const mountedRef = useRef(true);
  const startRequestedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const {
    options,
    isOptionsLoading,
    isStarting,
    isError,
    startInterview,
    completePreparation,
  } = useSetup();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const {
    documents,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
  } = useDocuments(isLoggedIn);

  const [companyType, setCompanyType] = useState<CompanyType | null>(
    initialSetup?.companyType || null
  );

  const [interviewStage, setInterviewStage] = useState<InterviewStage | null>(
    initialSetup?.interviewStage || null
  );

  const [interviewType, setInterviewType] = useState<InterviewType>(
    initialSetup?.interviewType ?? "QA"
  );

  const [prepMinutes, setPrepMinutes] = useState<PrepMinutes>(
    initialSetup?.prepMinutes ?? 20
  );

  const [jobRole, setJobRole] = useState(initialSetup?.jobRole || "");
  const [companyName, setCompanyName] = useState(initialSetup?.companyName || "");
  const [jobDescription, setJobDescription] = useState(
    initialSetup?.jobDescription || ""
  );
  const [githubUrl, setGithubUrl] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(initialSetup?.docId ?? null);

  const isRestoringDocument =
    selectedDocId !== null && isLoggedIn && isDocumentsLoading;

  const availableDocId =
    isLoggedIn &&
      !isDocumentsError &&
      documents.some((document) => document.docId === selectedDocId)
      ? selectedDocId
      : null;

  const isPreviousDocumentUnavailable =
    selectedDocId !== null &&
    !isRestoringDocument &&
    availableDocId === null;

  const canStart = useMemo(
    () =>
      companyType !== null &&
      interviewStage !== null &&
      !isStarting &&
      !isRestoringDocument,
    [companyType, interviewStage, isStarting, isRestoringDocument],
  );

  const handleStart = async () => {
    if (
      !canStart || startRequestedRef.current ||
      companyType === null ||
      interviewStage === null
    ) {
      return;
    }

    startRequestedRef.current = true;
    try {
      const prepared = await startInterview(
        {
          companyType,
          interviewStage,
          interviewType,
          ...(interviewType === "PT" ? { prepMinutes } : {}),
          companyName: companyName.trim() || undefined,
          jobRole: jobRole.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
        },
        documentFile,
        availableDocId
      );
      const { sessionId } = prepared;

      if (!mountedRef.current) return;
      completePreparation(sessionId);
      resetInterview();

      const auth = useAuthStore.getState();
      if (!auth.isLoggedIn || auth.user) {
        saveInterviewSetup({
          companyType,
          interviewStage,
          interviewType,
          prepMinutes,
          companyName: companyName.trim(),
          jobRole: jobRole.trim(),
          jobDescription: jobDescription.trim(),
          docId: prepared.docId,
        }, sessionId, auth.isLoggedIn ? auth.user?.id ?? null : null);
      }

      sessionStorage.setItem("interviewSessionId", String(sessionId));

      if (interviewType === "PT") {
        sessionStorage.setItem("ptPreparationSessionId", String(sessionId));
      } else {
        sessionStorage.removeItem("ptPreparationSessionId");
      }

      navigate(
        interviewType === "PT" ? "/pt/preparation" : "/interview",
        { state: { sessionId } },
      );
    } catch (error) {
      if (!mountedRef.current || (error instanceof DOMException && error.name === "AbortError")) return;
      console.error("모의면접 시작 실패:", error);
      showAlert(error instanceof Error && !isAxiosError(error) ? error.message : "면접 준비 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      startRequestedRef.current = false;
    }
  };

  if (isOptionsLoading) {
    return <PageLoading layout="setup" title="면접 설정을 불러오고 있어요" />;
  }

  if (!options) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-[68px]">
          <div className="mx-auto w-full max-w-[760px] px-5 py-12 sm:px-10 sm:py-14">
            <p className="text-[14px] text-muted-foreground">
              면접 설정을 불러오지 못했습니다.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-[68px]">
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

          <fieldset
            disabled={isStarting}
            inert={isStarting}
            aria-busy={isStarting}
            className={`space-y-10 min-w-0 border-0 p-0 ${isStarting ? "opacity-60" : ""}`}
          >
            <section>
              <div className="mb-4">
                <h2 className="text-[14px] font-semibold text-foreground">
                  면접 유형
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  연습하고 싶은 면접 방식을 선택해 주세요.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SelectionCard
                  title="일반 면접"
                  description="질문에 답변하는 일반적인 모의면접"
                  selected={interviewType === "QA"}
                  onClick={() => setInterviewType("QA")}
                />

                <SelectionCard
                  title="PT 면접"
                  description="주제를 준비하고 발표하는 기술 PT 면접"
                  selected={interviewType === "PT"}
                  onClick={() => {
                    setInterviewType("PT");
                    setInterviewStage("TECHNICAL");
                  }}
                />
              </div>
            </section>
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
                {options.companyTypes?.map((item) => (
                  <SelectionCard
                    key={item.code}
                    title={item.label}
                    description={item.example}
                    selected={companyType === item.code}
                    onClick={() => setCompanyType(item.code)}
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
                {options.stages
                  ?.filter(
                    (item) =>
                      interviewType === "QA" || item.code === "TECHNICAL",
                  )
                  .map((item) => (
                    <SelectionCard
                      key={item.code}
                      title={item.label}
                      selected={interviewStage === item.code}
                      onClick={() => setInterviewStage(item.code)}
                      disabled={interviewType === "PT"}
                    />
                  ))}
              </div>
            </section>

            {interviewType === "PT" && (
              <section>
                <div className="mb-4">
                  <h2 className="text-[14px] font-semibold text-foreground">
                    PT 준비 시간
                  </h2>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    발표 주제를 준비할 시간을 선택해 주세요.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {([10, 20, 30] as const).map((minutes) => (
                    <SelectionCard
                      key={minutes}
                      title={`${minutes}분`}
                      selected={prepMinutes === minutes}
                      onClick={() => setPrepMinutes(minutes)}
                    />
                  ))}
                </div>
              </section>
            )}

            <AdvancedSetting
              jobRole={jobRole}
              jobRoleOptions={options.jobRoleChips}
              companyName={companyName}
              jobDescription={jobDescription}
              githubUrl={githubUrl}
              documentFile={documentFile}
              onJobRoleChange={setJobRole}
              onCompanyNameChange={setCompanyName}
              onJobDescriptionChange={setJobDescription}
              onGithubUrlChange={setGithubUrl}
              onDocumentFileChange={setDocumentFile}
              documents={documents}
              selectedDocId={availableDocId}
              initiallyOpen={!!initialSetup && !!(initialSetup.jobRole || initialSetup.companyName || initialSetup.jobDescription || initialSetup.docId)}
              onSelectedDocIdChange={setSelectedDocId}
            />
            {isRestoringDocument && <LoadingState inline title="이전 설정의 서류를 확인하고 있어요" />}
            {isPreviousDocumentUnavailable && (
              <p className="text-[12.5px] text-destructive" role="status">
                이전 설정의 서류를 사용할 수 없습니다. 서류를 다시 선택하거나 서류 없이 시작해 주세요.
              </p>
            )}
          </fieldset>

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
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <LoadingIndicator size="sm" />
                  면접 준비 중
                </span>
              ) : (
                "모의면접 시작"
              )}
            </Button>

            {!canStart && !isStarting && (
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
