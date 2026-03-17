'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseCaseHandoff } from '~/lib/case-handoff';

export function ModuleHandoffBanner() {
  const searchParams = useSearchParams();
  const context = useMemo(() => parseCaseHandoff(searchParams), [searchParams]);

  if (!context) {
    return null;
  }

  return (
    <section className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/8 p-4 text-sm text-slate-100 shadow-[0_12px_30px_rgba(3,10,20,0.14)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
        Case Handoff
      </p>
      <p className="mt-2 leading-7 text-slate-200">
        You arrived here from <span className="font-semibold text-white">{context.fromTitle}</span>
        {' '}
        after the case <span className="font-semibold text-white">{context.caseTitle}</span>.
      </p>
      <p className="mt-2 leading-7 text-slate-300">
        Your working answer was{' '}
        <span className="font-semibold text-white">{context.selectedLabel || 'not recorded'}</span>
        , and the best-fit answer was{' '}
        <span className="font-semibold text-white">{context.targetLabel || 'not recorded'}</span>.
      </p>
    </section>
  );
}
