import Header from '@/components/common/Header';
import MemberPageHero from '@/components/common/MemberPageHero';
import type { ReportResponseData } from '@/types/report';

type LoadingLayout = 'profile' | 'history' | 'setup' | 'report';
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

function Skeleton({ layout }: { layout: LoadingLayout }) {
  if (layout === 'profile') return (
    <>
      <Block className="mb-10 h-9 w-3/5 max-w-[290px]" />
      <div className="mb-12 flex items-center gap-5 rounded-2xl border border-[#F0EFED] p-6">
        <Block className="h-16 w-16 shrink-0 rounded-full" /><Lines /><Block className="hidden h-10 w-24 sm:block" />
      </div>
      <Block className="mb-5 h-4 w-32" />
      <div className="divide-y divide-[#F0EFED] rounded-2xl border border-[#F0EFED]">
        {[0, 1].map((row) => <div key={row} className="flex items-center gap-5 p-6"><Block className="h-9 w-7 shrink-0" /><Lines /></div>)}
      </div>
    </>
  );
  if (layout === 'history') return (
    <>
      <Block className="mb-3 h-3 w-16" /><Block className="mb-4 h-10 w-3/4 max-w-[380px]" /><Block className="mb-9 h-3 w-4/5" />
      <div className="mb-10 grid grid-cols-2 gap-3">
        {[0, 1].map((card) => <div key={card} className="space-y-5 rounded-xl border border-[#F0EFED] p-5"><Block className="h-3 w-20" /><Block className="h-9 w-12" /></div>)}
      </div>
      <Block className="mb-4 h-3 w-20" />
      <div className="divide-y divide-[#F0EFED] rounded-xl border border-[#F0EFED]">
        {[0, 1, 2].map((row) => <div key={row} className="flex items-center gap-5 p-6"><Lines /><Block className="h-7 w-10" /></div>)}
      </div>
    </>
  );
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
  if (layout === 'profile' || layout === 'history') return <div className="member-page">
    <Header hideBackButton reportForLogin={reportForLogin} />
    <p role="status" className="sr-only">{title}</p>
    <MemberPageHero eyebrow={layout === 'profile' ? '마이페이지' : '히스토리'}
      title={layout === 'profile' ? '내 정보와 지원 서류' : <span className="member-title-skeleton devoir-loading-skeleton" aria-hidden="true" />} />
    <main aria-busy="true" className="member-page-container member-page-body">
      <div aria-hidden="true" className="devoir-loading-skeleton">
        {layout === 'history' ? <>
          <div className="member-history-summary">{[0, 1].map((item) => <div key={item} className="member-history-stat"><Block className="h-3 w-20" /><Block className="mt-5 h-10 w-14" /></div>)}</div>
          <Block className="mb-6 h-6 w-24" />
          <div className="member-history-list">{[0, 1, 2].map((item) => <div key={item} className="member-history-card"><Lines /><Block className="h-8 w-12" /></div>)}</div>
        </> : <>
          <Block className="mb-4 h-4 w-20" />
          <div className="member-profile-card mb-14"><Block className="h-16 w-16 shrink-0 rounded-full" /><Lines /><Block className="hidden h-11 w-28 rounded-full sm:block" /></div>
          <Block className="mb-5 h-5 w-28" />
          <div className="member-document-list">{[0, 1].map((item) => <div key={item} className="member-document-card"><Block className="h-7 w-6 shrink-0" /><Lines /></div>)}</div>
        </>}
      </div>
    </main>
  </div>;
  return (
    <div className="min-h-screen bg-background pt-[68px]">
      <Header reportForLogin={reportForLogin} />
      <p role="status" className="sr-only">{title}</p>
      <main aria-busy="true" className="mx-auto w-full max-w-[780px] px-5 py-10 md:px-8 md:py-14">
        <div aria-hidden="true" className="devoir-loading-skeleton"><Skeleton layout={layout} /></div>
      </main>
    </div>
  );
}
