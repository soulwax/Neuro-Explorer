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
    <section className="app-surface app-surface--hero">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            {summary}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
