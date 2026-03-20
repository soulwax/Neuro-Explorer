'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseCaseHandoff } from '~/lib/case-handoff';

function ModuleHandoffBannerContent() {
  const searchParams = useSearchParams();
  const context = useMemo(() => parseCaseHandoff(searchParams), [searchParams]);

  if (!context) {
    return null;
  }

  return (
    <section className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/8 p-4 text-sm text-slate-100 shadow-[0_10px_24px_rgba(2,8,18,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
        Case Handoff
      </p>
      <p className="mt-2 leading-6 text-slate-200">
        You arrived here from <span className="font-semibold text-white">{context.fromTitle}</span>
        {' '}
        after the case <span className="font-semibold text-white">{context.caseTitle}</span>.
      </p>
      <p className="mt-2 leading-6 text-slate-300">
        Your working answer was{' '}
        <span className="font-semibold text-white">{context.selectedLabel || 'not recorded'}</span>
        , and the best-fit answer was{' '}
        <span className="font-semibold text-white">{context.targetLabel || 'not recorded'}</span>.
      </p>
    </section>
  );
}

export function ModuleHandoffBanner() {
  return (
    <Suspense fallback={null}>
      <ModuleHandoffBannerContent />
    </Suspense>
  );
}
