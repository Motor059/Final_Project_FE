import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { getAuthVersion } from '@/lib/authStorage';
import { MemberPageSkeleton } from '@/components/common/PageLoading';

const bodyHeights = new Map<string, number>();

export default function MemberPageBody({ layout, loading, pending = loading, children }: {
  layout: 'profile' | 'history'; loading: boolean; pending?: boolean; children: ReactNode;
}) {
  const bodyRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const sizeKey = () => `${getAuthVersion()}:${layout}:${window.innerWidth}`;
    const update = () => {
      if (pending) {
        const height = bodyHeights.get(sizeKey());
        body.style.height = height ? `${height}px` : '';
      } else {
        body.style.height = '';
        bodyHeights.set(sizeKey(), body.getBoundingClientRect().height);
        if (bodyHeights.size > 20) bodyHeights.delete(bodyHeights.keys().next().value!);
      }
    };
    update();
    const observer = !pending && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(body);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [layout, pending]);

  return <main ref={bodyRef} aria-busy={loading} className="member-page-container member-page-body">
    {loading ? <MemberPageSkeleton layout={layout} /> : children}
  </main>;
}
