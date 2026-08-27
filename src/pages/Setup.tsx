import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdvancedSetting from "@/components/setup/AdvancedSetting";
import SelectionCard from "@/components/setup/SelectionCard";
import { Button } from "@/components/ui/button";
import Header from "@/components/common/Header";
import { useInterviewStore } from "@/store/useInterviewStore";

type CompanyType = "large" | "service" | "fintech";
type InterviewStage = "tech" | "exec";

const COMPANY_TYPES: Array<{
  id: CompanyType;
  title: string;
  description: string;
  detail: string;
}> = [
  {
    id: "large",
    title: "대기업 SW",
    description: "삼성 · SK하이닉스 · LG CNS",
    detail: "인성 + 직무 PT + 임원 면접",
  },
  {
    id: "service",
    title: "서비스 기업",
    description: "네이버 · 카카오 · 쿠팡 · 배민",
    detail: "기술 심화 + 라이브 코딩 + 컬처핏",
  },
  {
    id: "fintech",
    title: "금융 IT",
    description: "토스 · 카카오뱅크 · 증권/은행 IT",
    detail: "기술 + 금융 도메인 + 보안/규제",
  },
];

const INTERVIEW_STAGES: Array<{
  id: InterviewStage;
  title: string;
  description: string;
}> = [
  {
    id: "tech",
    title: "1차 기술",
    description: "기술 질문 위주 — 설계·구현·문제해결",
  },
  {
    id: "exec",
    title: "2차 인성·임원",
    description: "인성·경험·가치관 행동 기반 질문",
  },
];

export default function Setup() {
  const navigate = useNavigate();
  const { resetInterview } = useInterviewStore();

  const [companyType, setCompanyType] = useState<CompanyType | null>(null);
  const [interviewStage, setInterviewStage] =
    useState<InterviewStage | null>(null);

  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const canStart = useMemo(
    () => companyType !== null && interviewStage !== null,
    [companyType, interviewStage],
  );

  const handleStart = () => {
    if (!canStart) {
      return;
    }

    const setupData = {
      companyType,
      interviewStage,
      jobRole: jobRole.trim(),
      companyName: companyName.trim(),
      jobDescription: jobDescription.trim(),
      documentName: documentFile?.name ?? null,
    };

    sessionStorage.setItem(
      "interviewSetup",
      JSON.stringify(setupData),
    );

    resetInterview();
    navigate("/interview", { state: { sessionId: 101 } }); // 임시 세션 ID, 실제로는 서버에서 발급받아야 함
  };

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