export function CaseShell({
  eyebrow,
  title,
  summary,
  actions,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            {summary}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
