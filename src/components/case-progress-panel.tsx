import type { ModuleCaseProgressSummary } from '~/lib/case-progress';

export function CaseProgressPanel({
  summary,
  onReset,
}: Readonly<{
  summary: ModuleCaseProgressSummary;
  onReset: () => void;
}>) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Study progress
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Track your case accuracy inside this module
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-12 items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Reset progress
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Cases completed
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.completedCount}
            <span className="ml-1 text-sm font-medium text-slate-400">
              / {summary.totalCases}
            </span>
          </p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Correct reveals
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-100">
            {summary.correctCount}
          </p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Accuracy
          </p>
          <p className="mt-2 text-2xl font-semibold text-cyan-100">
            {summary.accuracyPercent}%
          </p>
        </div>
      </div>

      {summary.lastAttempt ? (
        <div className="mt-3 rounded-[18px] border border-white/10 bg-white/6 p-4 text-sm leading-6 text-slate-300">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Last reveal
          </p>
          <p className="mt-2 font-medium text-white">{summary.lastAttempt.caseTitle}</p>
          <p className="mt-2">
            Picked <span className="font-semibold text-slate-100">{summary.lastAttempt.selectedLabel}</span>
            {' '}and the best fit was{' '}
            <span className="font-semibold text-slate-100">{summary.lastAttempt.targetLabel}</span>.
          </p>
        </div>
      ) : null}
    </div>
  );
}
