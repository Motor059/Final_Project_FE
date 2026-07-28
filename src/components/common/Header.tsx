import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="w-full h-16 px-6 md:px-10 flex items-center justify-between border-b bg-white">
      {/* 로고 영역 */}
      <div className="text-2xl font-bold tracking-tighter cursor-pointer">
        Knock.
      </div>
      
      {/* 로그인 버튼 */}
      <Button variant="default" className="rounded-md font-semibold px-6">
        로그인
      </Button>
    </header>
  );
}