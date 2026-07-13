import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function StyleGuide() {
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-16 pb-32">
      <div className="space-y-2 border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">Benly UI Design System</h1>
        <p className="text-muted-foreground text-lg">
          프로젝트에 설치된 shadcn/ui 컴포넌트 총집합 카탈로그입니다.
        </p>
      </div>

      {/* 1. Buttons & Chips */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">1. Buttons & Chips</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 border rounded-xl bg-card">
          <Button variant="default">기본 블랙 버튼</Button>
          <Button variant="secondary">세컨더리 버튼</Button>
          <Button variant="outline">아웃라인 버튼</Button>
          <Button variant="ghost">고스트 버튼</Button>
          <Button variant="destructive">경고(Destructive)</Button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center p-6 border rounded-xl bg-card">
          <Button variant="chip">백엔드 (미선택)</Button>
          <Button variant="chip" data-state="selected">프론트엔드 (선택됨)</Button>
        </div>
        
        <div className="w-96">
          <Button variant="default" size="cta">모의면접 시작 (CTA)</Button>
        </div>
      </section>

      {/* 2. Badges */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">2. Badges</h2>
        <div className="flex gap-4 p-6 border rounded-xl bg-card">
          <Badge variant="default" className="rounded-md px-2 py-0.5">필수</Badge>
          <Badge variant="secondary" className="rounded-md px-2 py-0.5">선택</Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">메인 질문 1/5</Badge>
        </div>
      </section>

      {/* 3. Form Elements (Input & Textarea) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">3. Form Inputs (면접 설정용)</h2>
        <div className="grid grid-cols-2 gap-8 p-6 border rounded-xl bg-card">
          <div className="space-y-3">
            <label className="text-sm font-medium">회사명</label>
            <Input placeholder="예: 카카오, 토스, 네이버" />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">지원 직무</label>
            <Input placeholder="예: Spring 백엔드 개발자" />
          </div>
          <div className="col-span-2 space-y-3">
            <label className="text-sm font-medium">채용공고 (JD)</label>
            <Textarea 
              placeholder="공고 내용을 복사해 붙여넣으세요. 질문이 훨씬 정교해집니다." 
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>
      </section>

      {/* 4. Selection Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">4. Selection Cards</h2>
        <div className="grid grid-cols-2 gap-6 p-6 border rounded-xl bg-muted/30">
          <Card className="cursor-pointer transition-all hover:border-black/50">
            <CardHeader>
              <CardTitle>서비스 기업</CardTitle>
              <CardDescription>네이버·카카오·쿠팡·배민</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              기술 심화 + 라이브 코딩 + 컬처핏
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all bg-black text-white border-black shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">대기업 SW (선택됨)</CardTitle>
              <CardDescription className="text-gray-400">삼성·SK하이닉스·LG CNS</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              인성 + 직무 PT + 임원 면접
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Accordion */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">5. Accordion (맞춤 설정)</h2>
        <div className="p-6 border rounded-xl bg-card max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-settings" className="border-none">
              <AccordionTrigger className="hover:no-underline px-4 py-2 rounded-lg hover:bg-muted transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">맞춤 설정 추가</span>
                  <Badge variant="secondary" className="rounded-md">선택</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-2 text-muted-foreground leading-relaxed">
                이곳에 직무, 회사명, 채용공고, 지원 서류(PDF) 등을 입력하는 폼이 부드럽게 펼쳐집니다. 
                선택 사항이지만 정보를 많이 넣을수록 AI의 꼬리 질문이 정교해집니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 6. Progress Bar */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">6. Progress (면접 진행도)</h2>
        <div className="p-8 border rounded-xl bg-card space-y-6 max-w-xl">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>면접 진행률</span>
            <span>40%</span>
          </div>
          <Progress value={40} className="h-2" />
        </div>
      </section>

      {/* 7. Dialog (Modal) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">7. Dialog (모달 팝업)</h2>
        <div className="p-6 border rounded-xl bg-card flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">면접 종료하기 테스트</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>모의면접을 종료하시겠어요?</DialogTitle>
                <DialogDescription>
                  지금 종료하면 진행 중인 면접 데이터가 저장되지 않을 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline">취소</Button>
                <Button variant="destructive">종료하기</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}