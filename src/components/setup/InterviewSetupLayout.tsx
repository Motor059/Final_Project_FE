import type { ReactNode } from "react";
import Header from "@/components/common/Header";
import SelectionCard from "./SelectionCard";
import TitleWords from "@/components/common/TitleWords";
import "@/components/presentation/pt-reference.css";

export function InterviewSetupFrame({ type, children }: { type: 'QA' | 'PT'; children: ReactNode }) {
  return <>
    <Header />
    <main className="pt-ref pt-ref-page">
      <section className="pv-hero"><div className="pv-glow" aria-hidden="true" /><div className="wrap narrow pv-head">
        <span className="pv-eyebrow">모의면접 설정</span><h1 className="pv-h1 has-title-words"><TitleWords words={['어떤', '면접을', '연습할까요?']} /></h1>
        <p className="pv-sub">{type === "PT" ? "기업과 준비 시간을 고르면 과제를 받고 바로 준비를 시작해요." : <>면접 유형과 기업 유형만 고르면 바로 시작할 수 있어요.<br />재료를 더할수록 질문이 정교해져요.</>}</p>
      </div></section>
      <section className="pv-body"><div className="wrap narrow">
        {children}
      </div></section>
    </main>
  </>;
}

export default function InterviewSetupLayout({ type, locked, loading = false, withinPage = false, onTypeChange, children, footer }: {
  type: "QA" | "PT"; locked: boolean; loading?: boolean; withinPage?: boolean; onTypeChange: (type: "QA" | "PT") => void; children: ReactNode; footer: ReactNode;
}) {
  const form = <>
        {loading && <p role="status" className="sr-only">면접 설정을 불러오고 있어요</p>}
        <fieldset disabled={locked || loading} inert={locked || loading} aria-busy={locked} className="form pt-ref-fieldset">
          <div className="field"><div className="fl"><span className="req">필수</span>면접 유형</div><div className="opts c2">
            <SelectionCard reference title="일반 모의면접" description="질문에 답하며 기술·인성 면접을 연습해요." detail="메인 질문 5개, 꼬리 질문 2개씩 / 약 20분" selected={type === "QA"} onClick={() => onTypeChange("QA")} />
            <SelectionCard reference title="PT 모의면접" description="기업별 과제를 준비하고 발표한 뒤 추가 질문을 받아요." detail="과제 확인·준비 / 발표 / 질의응답" selected={type === "PT"} onClick={() => onTypeChange("PT")} />
          </div></div>
          {children}
        </fieldset>
        {footer}
  </>;
  return withinPage ? form : <InterviewSetupFrame type={type}>{form}</InterviewSetupFrame>;
}
