import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import AdvancedSetting from "@/components/setup/AdvancedSetting";
import SelectionCard from "@/components/setup/SelectionCard";
import InterviewSetupLayout, { InterviewSetupFrame } from "@/components/setup/InterviewSetupLayout";
import { ptApi } from "@/api/ptApi";
import { hasMemberSession, hasUsableGuestToken } from "@/lib/authStorage";
import PTSetupForm from "@/components/setup/PTSetupForm";
import { Button } from "@/components/ui/button";
import LoadingState, { LoadingIndicator } from "@/components/common/LoadingState";
import { InterviewSetupSkeleton } from "@/components/common/PageLoading";
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
} from "@/types/setup";

import { parseInterviewSetup, saveInterviewSetup } from '@/lib/interviewSetup';

export default function Setup() {
  const location = useLocation();
  return <SetupForm key={location.key} initialSetup={parseInterviewSetup(location.state?.retrySetup)} />;
}

function SetupForm({ initialSetup }: { initialSetup: InterviewSetup | null }) {
  const qaSetup = initialSetup?.interviewType === "PT" ? null : initialSetup;
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
    errorMessage,
    startInterview,
    completePreparation,
  } = useSetup();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  useEffect(() => {
    if (!hasMemberSession() && !hasUsableGuestToken()) return;
    const controller = new AbortController();
    void ptApi.getOptions(controller.signal).catch(() => { /* The PT form provides retry if selected. */ });
    return () => controller.abort();
  }, [isLoggedIn]);

  const {
    documents,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
  } = useDocuments(isLoggedIn);

  const [companyType, setCompanyType] = useState<CompanyType | null>(
    qaSetup?.companyType || null
  );

  const [interviewStage, setInterviewStage] = useState<InterviewStage | null>(
    qaSetup?.interviewStage || null
  );

  const [interviewType, setInterviewType] = useState<InterviewType>(
    initialSetup?.interviewType ?? "QA"
  );

  const [jobRole, setJobRole] = useState(qaSetup?.jobRole || "");
  const [companyName, setCompanyName] = useState(qaSetup?.companyName || "");
  const [jobDescription, setJobDescription] = useState(
    qaSetup?.jobDescription || ""
  );
  const [githubUrl, setGithubUrl] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(qaSetup?.docId ?? null);

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
          interviewType: "QA",
          companyName: companyName.trim() || undefined,
          jobRole: jobRole.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
        },
        isLoggedIn ? documentFile : null,
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
          interviewType: "QA",
          companyName: companyName.trim(),
          jobRole: jobRole.trim(),
          jobDescription: jobDescription.trim(),
          docId: prepared.docId,
        }, sessionId, auth.isLoggedIn ? auth.user?.id ?? null : null);
      }

      sessionStorage.setItem("interviewSessionId", String(sessionId));

      sessionStorage.removeItem("ptPreparationSessionId");
      navigate("/interview", { state: { sessionId } });
    } catch (error) {
      if (!mountedRef.current || (error instanceof DOMException && error.name === "AbortError")) return;
      console.error("모의면접 시작 실패:", error);
      showAlert(error instanceof Error && !isAxiosError(error) ? error.message : "면접 준비 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      startRequestedRef.current = false;
    }
  };

  const companyDetails: Record<string, string> = { BIG_TECH_SW: "인성, 직무 PT, 임원 면접", SERVICE: "기술 심화, 라이브 코딩, 컬처핏", FINANCE_IT: "기술, 금융 도메인, 보안과 규제" };
  const stageDescriptions: Record<string, string> = { TECHNICAL: "CS 기초, 프로젝트, 기술 선택 이유", PERSONALITY: "경험, 협업, 지원 동기" };
  return <InterviewSetupFrame type={interviewType}>
    {interviewType === 'PT' ? <PTSetupForm withinPage initialSetup={initialSetup?.interviewType === 'PT' ? initialSetup : null} onSelectQA={() => setInterviewType('QA')} /> : <InterviewSetupLayout withinPage type="QA" locked={isStarting} loading={isOptionsLoading} onTypeChange={setInterviewType} footer={<div className="submitbar">
    <button type="button" className="btn ink" onClick={() => { void handleStart(); }} disabled={!canStart || isOptionsLoading || !options}>{isStarting ? <><LoadingIndicator size="sm" />면접 준비 중</> : "면접 시작하기"}</button>
    <span className="hint pt-submit-hint">기업 유형과 면접 단계를 고르면 시작할 수 있어요</span>
  </div>}>
    {isOptionsLoading ? <InterviewSetupSkeleton /> : !options ? <div role="alert" className="pt-err">면접 설정을 불러오지 못했습니다.<Button type="button" variant="outline" className="mt-4" onClick={() => setInterviewType("PT")}>PT 면접 설정</Button></div> : <div className="su-sub">
      <div className="field"><div className="fl"><span className="req">필수</span>기업 유형</div><div className="opts c3">{options.companyTypes?.map((item) => <SelectionCard reference key={item.code} title={item.label} description={item.example} detail={companyDetails[item.code]} selected={companyType === item.code} onClick={() => setCompanyType(item.code)} />)}</div></div>
      <div className="field"><div className="fl"><span className="req">필수</span>면접 단계</div><div className="opts c2">{options.stages?.map((item) => <SelectionCard reference key={item.code} title={item.label} description={stageDescriptions[item.code]} selected={interviewStage === item.code} onClick={() => setInterviewStage(item.code)} />)}</div></div>
      <AdvancedSetting canUseDocuments={isLoggedIn} jobRole={jobRole} jobRoleOptions={options.jobRoleChips} companyName={companyName} jobDescription={jobDescription} githubUrl={githubUrl} documentFile={documentFile} onJobRoleChange={setJobRole} onCompanyNameChange={setCompanyName} onJobDescriptionChange={setJobDescription} onGithubUrlChange={setGithubUrl} onDocumentFileChange={setDocumentFile} documents={documents} selectedDocId={availableDocId} initiallyOpen={!!qaSetup && !!(qaSetup.jobRole || qaSetup.companyName || qaSetup.jobDescription || qaSetup.docId)} onSelectedDocIdChange={setSelectedDocId} />
      {isRestoringDocument && <LoadingState inline title="이전 설정의 서류를 확인하고 있어요" />}
      {isPreviousDocumentUnavailable && <p className="hint pt-danger" role="status">이전 설정의 서류를 사용할 수 없습니다. 서류를 다시 선택하거나 서류 없이 시작해 주세요.</p>}
    </div>}
    {isError && options && <div className="pt-err" role="alert">{errorMessage || "요청 처리 중 문제가 발생했습니다."}</div>}
  </InterviewSetupLayout>}
  </InterviewSetupFrame>;
}
