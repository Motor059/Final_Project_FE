import Header from '@/components/common/Header';
import LoadingState from '@/components/common/LoadingState';
import type { ReportResponseData } from '@/types/report';

type LoadingLayout = 'setup' | 'report';
interface PageLoadingProps {
  layout: LoadingLayout;
  title: string;
  reportForLogin?: ReportResponseData;
}

function Block({ className = '' }: { className?: string }) {
  return <div className={`rounded-md bg-[#F1F1EF] ${className}`} />;
}

function Lines() {
  return <div className="flex-1 space-y-3"><Block className="h-3 w-1/3" /><Block className="h-4 w-2/3" /></div>;
}

export function MemberPageSkeleton({ layout }: { layout: 'profile' | 'history' }) {
  return <div aria-hidden="true" className="devoir-loading-skeleton page-content-skeleton">
    {layout === 'history' ? <>
      <div className="member-history-summary">{[0, 1].map((item) => <div key={item} className="member-history-stat"><Block className="h-5 w-20" /><Block className="mt-3.5 h-11 w-14" /></div>)}</div>
      <Block className="mb-[22px] h-[31px] w-24" />
      <div className="member-history-groups">{[0, 1].map((group) => <div key={group}>
        <Block className="mb-3.5 h-[22px] w-28" />
        <div className="member-history-list">{[0, 1, 2].map((item) => <div key={item} className="member-history-card min-h-[114px]"><Lines /><Block className="h-8 w-12" /></div>)}</div>
      </div>)}</div>
    </> : <>
      <section className="member-profile-section"><Block className="mb-3.5 h-[21px] w-20" /><div className="member-profile-card min-h-[116px]"><Block className="h-16 w-16 shrink-0 rounded-full" /><Lines /><Block className="hidden h-11 w-28 rounded-full sm:block" /></div></section>
      <div className="member-documents-heading"><Block className="h-[27px] w-32" /><Block className="mt-2.5 h-6 w-4/5" /></div>
      <Block className="h-[190px] w-full rounded-[28px]" />
      <div className="member-questions-section"><Block className="mb-2.5 h-[25px] w-36" /><Block className="mb-4 h-6 w-3/5" /><Block className="h-20 w-full rounded-[26px]" /></div>
      <div className="my-12 h-px bg-border" />
      <div className="mb-12"><Block className="mb-3.5 h-[21px] w-20" /><div className="member-setting-card h-[96px]"><Lines /><Block className="h-7 w-12 rounded-full" /></div></div>
      <Block className="mb-3.5 h-[21px] w-12" /><Block className="h-[130px] w-full rounded-[28px]" />
    </>}
  </div>;
}

export function InterviewSetupSkeleton() {
  return <div aria-hidden="true" className="su-sub devoir-loading-skeleton page-content-skeleton">
    <div className="field"><Block className="h-5 w-24" /><div className="opts c3">{[0, 1, 2].map((item) => <Block key={item} className="h-[130px] rounded-[20px]" />)}</div></div>
    <div className="field"><Block className="h-5 w-24" /><div className="opts c2">{[0, 1].map((item) => <Block key={item} className="h-[108px] rounded-[20px]" />)}</div></div>
    <Block className="h-[100px] rounded-[20px]" />
  </div>;
}

function Skeleton({ layout }: { layout: LoadingLayout }) {
  if (layout === 'setup') return (
    <>
      <Block className="mb-3 h-3 w-24" /><Block className="mb-4 h-10 w-4/5 max-w-[360px]" /><Block className="mb-10 h-3 w-4/5" />
      <Block className="mb-4 h-4 w-20" />
      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((card) => <div key={card} className="space-y-4 rounded-xl border border-[#F0EFED] p-5"><Block className="h-4 w-20" /><Block className="h-3 w-full" /></div>)}
      </div>
      <Block className="mb-4 h-4 w-20" />
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        {[0, 1].map((card) => <div key={card} className="rounded-xl border border-[#F0EFED] p-6"><Block className="h-4 w-24" /></div>)}
      </div>
      <Block className="h-12 w-full rounded-xl" />
    </>
  );
  return (
    <>
      <Block className="mb-6 h-3 w-48" />
      <div className="mb-4 space-y-5 rounded-[20px] border border-[#F0EFED] p-7"><Block className="h-3 w-24" /><Block className="h-6 w-4/5" /><Block className="h-3 w-full" /></div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="space-y-6 rounded-[20px] border border-[#F0EFED] p-7"><Block className="h-3 w-20" /><Block className="h-14 w-16" /><Block className="h-3 w-full" /><Block className="h-3 w-3/4" /></div>
        <div className="flex items-center justify-center rounded-[20px] border border-[#F0EFED] p-7"><Block className="h-36 w-36 rounded-full" /></div>
      </div>
      <div className="space-y-3">{[0, 1].map((row) => <div key={row} className="rounded-xl border border-[#F0EFED] p-5"><Block className="h-4 w-3/5" /></div>)}</div>
    </>
  );
}

export default function PageLoading({ layout, title, reportForLogin }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-background pt-[68px]">
      <Header reportForLogin={reportForLogin} />
      <main className="mx-auto w-full max-w-[780px] px-5 py-10 md:px-8 md:py-14">
        <LoadingState inline title={title} className="mb-8" />
        <div aria-hidden="true" className="devoir-loading-skeleton"><Skeleton layout={layout} /></div>
      </main>
    </div>
  );
}
