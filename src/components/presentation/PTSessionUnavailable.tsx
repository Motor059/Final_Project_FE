import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import { Button } from "@/components/ui/button";

export default function PTSessionUnavailable({ expired, error, onRetry }: {
  expired: boolean; error: string | null; onRetry?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-background px-5 pt-[68px]">
        <div className="w-full max-w-[440px] text-center">
          <h1 className="mb-3 text-[24px] font-semibold">{expired ? "체험 PT 면접이 만료됐어요" : "PT 면접을 확인할 수 없어요"}</h1>
          <p role="alert" className="mb-7 text-[14px] leading-7 text-muted-foreground">{expired ? "새 면접을 시작해 다시 연습할 수 있어요." : error}</p>
          {onRetry && !expired && <Button type="button" variant="outline" className="mb-3 h-12 w-full rounded-xl" onClick={onRetry}>다시 불러오기</Button>}
          <Button type="button" className="h-12 w-full rounded-xl" onClick={() => navigate("/setup", { replace: true })}>면접 설정으로 돌아가기</Button>
        </div>
      </main>
    </>
  );
}
