import Link from "next/link";

import type { CaseHandoffLink } from "~/lib/case-handoff";

export function RevealPanel({
  correct,
  selectedLabel,
  targetLabel,
  explanation,
  teachingPoints,
  nextDataRequests,
  followUpLinks,
}: Readonly<{
  correct: boolean;
  selectedLabel: string;
  targetLabel: string;
  explanation: string;
  teachingPoints: string[];
  nextDataRequests: string[];
  followUpLinks: CaseHandoffLink[];
}>) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        correct
          ? "border-emerald-300/30 bg-emerald-300/10"
          : "border-amber-300/30 bg-amber-300/10"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.2em] ${
          correct ? "text-emerald-100" : "text-amber-100"
        }`}
      >
        {correct ? "Reasoning aligned" : "Reveal and compare"}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        {correct
          ? `Correct: ${targetLabel}`
          : `You picked ${selectedLabel}; best localization is ${targetLabel}`}
      </h3>
      <p className="mt-4 text-sm leading-7 text-slate-200">{explanation}</p>

      <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
        {teachingPoints.map((point) => (
          <li
            key={point}
            className="rounded-[20px] border border-white/10 bg-slate-950/35 px-4 py-3"
          >
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-slate-950/35 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
          Highest-yield next data
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
          {nextDataRequests.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {followUpLinks.map((moduleLink) => (
          <Link
            key={moduleLink.slug}
            href={moduleLink.href}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
          >
            Continue to {moduleLink.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
