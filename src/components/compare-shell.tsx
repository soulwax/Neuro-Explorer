export function CompareShell({
  title,
  leftLabel,
  rightLabel,
  left,
  right,
}: Readonly<{
  title: string;
  leftLabel: string;
  rightLabel: string;
  left: React.ReactNode;
  right: React.ReactNode;
}>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Compare mode
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
            {leftLabel}
          </p>
          <div className="mt-3 text-sm leading-7 text-slate-300">{left}</div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-100">
            {rightLabel}
          </p>
          <div className="mt-3 text-sm leading-7 text-slate-300">{right}</div>
        </div>
      </div>
    </div>
  );
}
