import { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";

export default function PTPreparation() {
    const location = useLocation();
    const navigate = useNavigate();
    const storedSessionId = sessionStorage.getItem("ptPreparationSessionId");

    const rawSessionId =
        location.state?.sessionId ?? storedSessionId;

    const parsedSessionId = Number(rawSessionId);

    const sessionId =
        rawSessionId != null &&
            Number.isSafeInteger(parsedSessionId) &&
            parsedSessionId > 0
            ? parsedSessionId
            : undefined;
    const [note, setNote] = useState(() => {
        if (sessionId === undefined) {
            return "";
        }

        return sessionStorage.getItem(`ptPreparationNote:${sessionId}`) ?? "";
    });
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            sessionId !== undefined &&
            currentLocation.pathname !== nextLocation.pathname
    );
    useEffect(() => {
        if (blocker.state !== "blocked") {
            return;
        }

        const shouldLeave = window.confirm(
            "PT 준비 화면에서 나가시겠어요? 작성한 메모는 이 브라우저에 임시 저장됩니다."
        );

        if (shouldLeave) {
            blocker.proceed();
        } else {
            blocker.reset();
        }
    }, [blocker]);
    useEffect(() => {
        if (sessionId === undefined) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [sessionId]);
    useEffect(() => {
        if (sessionId === undefined) {
            return;
        }

        try {
            sessionStorage.setItem(
                `ptPreparationNote:${sessionId}`,
                note
            );
        } catch (error) {
            console.warn("PT 메모 임시 저장 실패:", error);
        }
    }, [sessionId, note]);
    if (sessionId === undefined) {
        return (
            <>
                <Header />

                <main className="flex min-h-screen items-center justify-center bg-background px-5 pt-[68px]">
                    <div className="w-full max-w-[420px] text-center">
                        <h1 className="mb-3 text-[24px] font-semibold">
                            세션 정보를 찾을 수 없습니다
                        </h1>

                        <p className="mb-8 text-[14px] text-muted-foreground">
                            면접 설정 화면으로 돌아가 다시 시작해 주세요.
                        </p>

                        <Button
                            type="button"
                            onClick={() => navigate("/setup", { replace: true })}
                            className="h-12 w-full rounded-xl"
                        >
                            면접 설정으로 돌아가기
                        </Button>
                    </div>
                </main>
            </>
        );
    }
    return (
        <>
            <Header />

            <main className="min-h-screen bg-background pt-[68px]">
                <div className="mx-auto w-full max-w-[960px] px-5 pb-20 pt-12 sm:px-10">
                    <header className="mb-10">
                        <p className="mb-3 text-[13px] font-medium text-muted-foreground">
                            PT 면접 · 발표 준비
                        </p>

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-[32px] font-semibold tracking-tight text-foreground">
                                    발표를 준비해 주세요
                                </h1>

                                <p className="mt-3 text-[14px] text-muted-foreground">
                                    주제를 확인하고 발표 내용을 정리해 보세요.
                                </p>
                            </div>

                            <div className="w-fit min-w-[150px] rounded-2xl bg-[#F6F6F4] px-6 py-4 sm:text-right">
                                <p className="mb-2 text-[12px] font-medium text-muted-foreground">
                                    남은 준비 시간
                                </p>

                                <p className="text-[32px] font-semibold tabular-nums tracking-tight">
                                    --:--
                                </p>
                            </div>
                        </div>
                    </header>

                    <section className="mb-8 rounded-[24px] bg-[#F6F6F4] p-6 sm:p-8">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-[15px] font-semibold">
                                발표 주제
                            </h2>

                            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-muted-foreground">
                                PT 면접
                            </span>
                        </div>

                        <p className="text-[18px] font-medium leading-relaxed">
                            세션 {sessionId}의 발표 주제를 불러올 예정입니다.
                        </p>

                        <div className="mt-6 border-t border-[#E7E5E1] pt-5">
                            <p className="text-[13px] text-muted-foreground">
                                실전처럼 자료 없이 해보세요.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h2 className="text-[14px] font-semibold">
                                발표 메모
                            </h2>

                            <span className="text-[12px] text-muted-foreground">
                                이 브라우저에 임시 저장됨
                            </span>
                        </div>

                        <Textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="발표에 사용할 핵심 내용을 자유롭게 정리해 보세요."
                            rows={10}
                            className="resize-y"
                        />
                    </section>

                    <Button
                        type="button"
                        disabled
                        className="h-12 w-full rounded-xl text-[15px] font-semibold"
                    >
                        발표 시작
                    </Button>

                    <p className="mt-3 text-center text-[12px] text-muted-foreground">
                        서버 연결이 완료되면 발표를 시작할 수 있습니다.
                    </p>
                </div>
            </main>
        </>
    );
}
