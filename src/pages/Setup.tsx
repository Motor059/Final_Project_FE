import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Check,
  ChevronRight,
  Code2,
  FileText,
  LoaderCircle,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CompanyType = "service" | "enterprise" | "startup" | "custom";
type InterviewFocus = "technical" | "behavioral" | "balanced";
type InterviewLevel = "junior" | "mid" | "senior";

interface SetupForm {
  companyName: string;
  position: string;
  jobDescription: string;
  companyType: CompanyType | null;
  focus: InterviewFocus;
  level: InterviewLevel;
}

const companyTypes: Array<{
  value: CompanyType;
  title: string;
  description: string;
  detail: string;
  icon: typeof Building2;
}> = [
  {
    value: "service",
    title: "서비스 기업",
    description: "네이버·카카오·쿠팡·배민",
    detail: "기술 심화, 문제 해결, 라이브 코딩 중심",
    icon: Code2,
  },
  {
    value: "enterprise",
    title: "대기업 SW",
    description: "삼성·LG·SK·현대",
    detail: "직무 역량, 인성, 조직 적합성 중심",
    icon: Building2,
  },
  {
    value: "startup",
    title: "스타트업",
    description: "빠른 실행과 높은 오너십",
    detail: "실무 경험, 주도성, 협업 방식 중심",
    icon: Sparkles,
  },
  {
    value: "custom",
    title: "직접 설정",
    description: "특정 기업 유형에 속하지 않는 경우",
    detail: "입력한 회사와 채용공고를 중심으로 구성",
    icon: Users,
  },
];

const focusOptions: Array<{
  value: InterviewFocus;
  label: string;
  description: string;
}> = [
  {
    value: "technical",
    label: "기술 중심",
    description: "CS·직무 지식·프로젝트 경험을 깊게 확인해요.",
  },
  {
    value: "balanced",
    label: "균형형",
    description: "기술 질문과 인성 질문을 고르게 구성해요.",
  },
  {
    value: "behavioral",
    label: "인성 중심",
    description: "협업·갈등 해결·지원 동기를 중심으로 확인해요.",
  },
];

const levelOptions: Array<{
  value: InterviewLevel;
  label: string;
  description: string;
}> = [
  {
    value: "junior",
    label: "신입",
    description: "기초 개념과 성장 가능성 중심",
  },
  {
    value: "mid",
    label: "경력",
    description: "실무 경험과 문제 해결 과정 중심",
  },
  {
    value: "senior",
    label: "시니어",
    description: "설계 판단과 리딩 경험 중심",
  },
];

export default function Setup() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [form, setForm] = useState<SetupForm>({
    companyName: "",
    position: "",
    jobDescription: "",
    companyType: null,
    focus: "balanced",
    level: "junior",
  });

  const errors = useMemo(
    () => ({
      companyName:
        form.companyName.trim().length === 0 ? "회사명을 입력해 주세요." : "",
      position:
        form.position.trim().length === 0 ? "지원 직무를 입력해 주세요." : "",
      companyType:
        form.companyType === null ? "기업 유형을 선택해 주세요." : "",
    }),
    [form.companyName, form.companyType, form.position],
  );

  const isValid = Object.values(errors).every((error) => error.length === 0);

  const updateField = <K extends keyof SetupForm>(
    key: K,
    value: SetupForm[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleStart = async () => {
    setShowErrors(true);

    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      sessionStorage.setItem("interviewSetup", JSON.stringify(form));
      navigate("/interview", { state: form });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-10 space-y-3">
          <Badge variant="secondary" className="rounded-md px-2.5 py-1">
            AI 모의면접
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              면접 정보를 설정해 주세요
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              지원 기업과 직무 정보를 바탕으로 실제 면접에 가까운 질문을
              구성합니다.
            </p>
          </div>
        </header>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5" aria-hidden="true" />
                    기본 정보
                  </CardTitle>
                  <CardDescription>
                    지원할 회사와 직무를 입력해 주세요.
                  </CardDescription>
                </div>
                <Badge variant="default" className="rounded-md">
                  필수
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="company-name" className="text-sm font-medium">
                  회사명
                </label>
                <Input
                  id="company-name"
                  value={form.companyName}
                  onChange={(event) =>
                    updateField("companyName", event.target.value)
                  }
                  placeholder="예: 카카오, 토스, 네이버"
                  aria-invalid={showErrors && Boolean(errors.companyName)}
                  aria-describedby={
                    showErrors && errors.companyName
                      ? "company-name-error"
                      : undefined
                  }
                />
                {showErrors && errors.companyName && (
                  <p
                    id="company-name-error"
                    className="text-sm text-destructive"
                  >
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium">
                  지원 직무
                </label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(event) =>
                    updateField("position", event.target.value)
                  }
                  placeholder="예: 프론트엔드 개발자"
                  aria-invalid={showErrors && Boolean(errors.position)}
                  aria-describedby={
                    showErrors && errors.position
                      ? "position-error"
                      : undefined
                  }
                />
                {showErrors && errors.position && (
                  <p id="position-error" className="text-sm text-destructive">
                    {errors.position}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="job-description"
                    className="text-sm font-medium"
                  >
                    채용공고
                  </label>
                  <Badge variant="secondary" className="rounded-md">
                    선택
                  </Badge>
                </div>
                <Textarea
                  id="job-description"
                  value={form.jobDescription}
                  onChange={(event) =>
                    updateField("jobDescription", event.target.value)
                  }
                  placeholder="채용공고의 주요 업무와 자격 요건을 붙여넣으세요. 질문이 더 정교해집니다."
                  className="min-h-36 resize-y"
                />
                <p className="text-sm text-muted-foreground">
                  개인정보나 연락처는 제외하고 입력해 주세요.
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4" aria-labelledby="company-type-title">
            <div className="space-y-1">
              <h2
                id="company-type-title"
                className="text-xl font-semibold tracking-tight"
              >
                기업 유형
              </h2>
              <p className="text-sm text-muted-foreground">
                기업 유형에 맞춰 질문의 성격과 비중을 조정합니다.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {companyTypes.map((option) => {
                const selected = form.companyType === option.value;
                const Icon = option.icon;

                return (
                  <Card
                    key={option.value}
                    role="radio"
                    tabIndex={0}
                    aria-checked={selected}
                    onClick={() => updateField("companyType", option.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        updateField("companyType", option.value);
                      }
                    }}
                    className={[
                      "cursor-pointer transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "hover:border-foreground/30 hover:shadow-sm",
                    ].join(" ")}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={[
                            "flex size-10 items-center justify-center rounded-lg border",
                            selected
                              ? "border-primary-foreground/20 bg-primary-foreground/10"
                              : "bg-muted",
                          ].join(" ")}
                        >
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        {selected && (
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground text-primary">
                            <Check className="size-4" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <CardTitle
                        className={selected ? "text-primary-foreground" : ""}
                      >
                        {option.title}
                      </CardTitle>
                      <CardDescription
                        className={
                          selected
                            ? "text-primary-foreground/70"
                            : undefined
                        }
                      >
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent
                      className={[
                        "text-sm",
                        selected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {option.detail}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {showErrors && errors.companyType && (
              <p className="text-sm text-destructive">{errors.companyType}</p>
            )}
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4" aria-labelledby="focus-title">
              <div className="space-y-1">
                <h2
                  id="focus-title"
                  className="text-xl font-semibold tracking-tight"
                >
                  면접 구성
                </h2>
                <p className="text-sm text-muted-foreground">
                  연습하고 싶은 질문의 비중을 선택하세요.
                </p>
              </div>

              <Card>
                <CardContent className="space-y-3 p-5">
                  {focusOptions.map((option) => {
                    const selected = form.focus === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("focus", option.value)}
                        className={[
                          "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          selected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input",
                          ].join(" ")}
                        >
                          {selected && (
                            <Check className="size-3.5" aria-hidden="true" />
                          )}
                        </span>
                        <span className="space-y-1">
                          <span className="block text-sm font-medium">
                            {option.label}
                          </span>
                          <span className="block text-sm leading-6 text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4" aria-labelledby="level-title">
              <div className="space-y-1">
                <h2
                  id="level-title"
                  className="text-xl font-semibold tracking-tight"
                >
                  지원 경력
                </h2>
                <p className="text-sm text-muted-foreground">
                  질문 깊이를 지원 경력에 맞게 조정합니다.
                </p>
              </div>

              <Card>
                <CardContent className="space-y-3 p-5">
                  {levelOptions.map((option) => {
                    const selected = form.level === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("level", option.value)}
                        className={[
                          "flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          selected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50",
                        ].join(" ")}
                      >
                        <span className="space-y-1">
                          <span className="block text-sm font-medium">
                            {option.label}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={[
                            "flex size-6 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input",
                          ].join(" ")}
                        >
                          {selected && (
                            <Check className="size-4" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </section>
          </div>

          <Card className="sticky bottom-4 border-border/80 shadow-lg backdrop-blur">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">설정을 모두 확인하셨나요?</p>
                <p className="text-sm text-muted-foreground">
                  시작 후에도 면접 종료 뒤 새로운 설정으로 다시 연습할 수 있어요.
                </p>
              </div>
              <Button
                type="button"
                size="cta"
                onClick={handleStart}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-52"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    준비 중
                  </>
                ) : (
                  <>
                    모의면접 시작
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
