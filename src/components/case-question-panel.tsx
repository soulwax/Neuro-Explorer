export function CaseQuestionPanel({
  title,
  oneLiner,
  chiefComplaint,
  history,
  syndromeFrame,
  examFindings,
  prompt,
  hints,
  localizationCues,
  differentialTraps,
  nextDataRequests,
}: Readonly<{
  title: string;
  oneLiner: string;
  chiefComplaint: string;
  history: string;
  syndromeFrame: string;
  examFindings: string[];
  prompt: string;
  hints: string[];
  localizationCues: string[];
  differentialTraps: string[];
  nextDataRequests: string[];
}>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/90">
        Clinical vignette
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{oneLiner}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Chief complaint
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            {chiefComplaint}
          </p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            History
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{history}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Syndrome frame
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          {syndromeFrame}
        </p>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Exam findings
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
          {examFindings.map((finding) => (
            <li key={finding}>• {finding}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-[20px] border border-cyan-300/20 bg-cyan-300/8 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
          Prompt
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-200">{prompt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {hints.map((hint) => (
            <span
              key={hint}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              {hint}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-200/90">
            Localization cues
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {localizationCues.map((cue) => (
              <li key={cue}>• {cue}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-rose-200/90">
            Differential traps
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {differentialTraps.map((trap) => (
              <li key={trap}>• {trap}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
          Next data to request
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
          {nextDataRequests.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
