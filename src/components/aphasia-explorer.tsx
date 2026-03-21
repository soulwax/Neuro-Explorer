"use client";

import { useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import { aphasiaPresets, type AphasiaBedsideTask, type AphasiaPreset } from "~/lib/aphasia";

const languageDomains = [
  { key: "fluency", label: "Fluency", tone: "bg-cyan-300" },
  { key: "comprehension", label: "Comprehension", tone: "bg-emerald-300" },
  { key: "repetition", label: "Repetition", tone: "bg-amber-300" },
  { key: "naming", label: "Naming", tone: "bg-sky-300" },
  { key: "reading", label: "Reading", tone: "bg-fuchsia-300" },
  { key: "writing", label: "Writing", tone: "bg-rose-300" },
] as const;

function MetricCard({
  label,
  value,
  detail,
  accent,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  accent: string;
}>) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function ProbeCard({
  title,
  finding,
  detail,
}: Readonly<{
  title: string;
  finding: string;
  detail: string;
}>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
        {title}
      </p>
      <p className="mt-3 text-sm font-medium leading-6 text-white">
        {finding}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
    </div>
  );
}

function TaskCard({ task }: Readonly<{ task: AphasiaBedsideTask }>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
        {task.label}
      </p>
      <p className="mt-3 text-sm font-medium leading-6 text-white">
        {task.finding}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {task.implication}
      </p>
    </div>
  );
}

function lesionTone(preset: AphasiaPreset, region: AphasiaPreset["lesionRegion"]) {
  return preset.lesionRegion === region ? 0.92 : 0.18;
}

function fluencyTone(tag: AphasiaPreset["fluencyTag"]) {
  switch (tag) {
    case "fluent":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "nonfluent":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-white/10 bg-white/6 text-slate-100";
  }
}

export function AphasiaExplorer() {
  const [selectedPresetId, setSelectedPresetId] = useState(aphasiaPresets[0]!.id);
  const preset =
    aphasiaPresets.find((item) => item.id === selectedPresetId) ?? aphasiaPresets[0]!;
  const curriculum = getCurriculumModule("aphasia");
  const handoffModules = (curriculum?.linkedModules ?? [])
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Cognitive Neurology
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Aphasia syndrome localizer
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Teach aphasia through bedside dissociations: fluency,
              comprehension, repetition, naming, reading, and writing. The goal
              is to localize the language-network bottleneck before jumping
              straight to stroke labels or rehab slogans.
            </p>
          </div>
          <div
            className={`rounded-[24px] border px-4 py-3 text-sm ${fluencyTone(
              preset.fluencyTag,
            )}`}
          >
            Dominant grammar:{" "}
            <span className="font-semibold text-white">{preset.phenotype}</span>
          </div>
        </div>
      </section>

      <ModuleHandoffBanner />

      <section className="app-surface">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Syndrome presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Start from the bedside language split
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            These presets are organized around the classroom-level language
            dissociations students actually remember: nonfluent versus fluent,
            repetition spared versus broken, and comprehension relatively intact
            versus heavily impaired.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {aphasiaPresets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPresetId(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                item.id === preset.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Language profile
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Which channels are preserved and which ones break
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
            <div className="rounded-[24px] border border-white/8 bg-slate-950/35 p-4">
              <div className="space-y-4">
                {languageDomains.map((domain) => {
                  const value = preset.profile[domain.key];
                  return (
                    <div key={domain.key}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-300">{domain.label}</span>
                        <span className="font-mono text-slate-100">{value}%</span>
                      </div>
                      <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/6">
                        <div
                          className={`h-full rounded-full ${domain.tone}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Spontaneous sample
                </p>
                <p className="mt-3 text-lg leading-8 text-white">
                  {preset.speechSample}
                </p>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  This is the first bedside clue students usually hear before
                  any formal testing starts.
                </p>
              </div>

              <div className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Repetition split
                </p>
                <h3 className="mt-2 text-sm font-semibold text-white">
                  Repetition versus the rest of the profile
                </h3>
                <div className="mt-3 flex items-end gap-3">
                  <div className="flex-1 rounded-[18px] border border-white/6 bg-white/4 p-3">
                    <p className="text-xs text-slate-400">Repetition</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-100">
                      {preset.profile.repetition}%
                    </p>
                  </div>
                  <div className="flex-1 rounded-[18px] border border-white/6 bg-white/4 p-3">
                    <p className="text-xs text-slate-400">Split</p>
                    <p className="mt-2 text-2xl font-semibold text-cyan-100">
                      {preset.repetitionSplit > 0 ? "+" : ""}
                      {preset.repetitionSplit}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Positive values mean repetition is worse than the rest of the
                  language profile; negative values mean repetition is
                  paradoxically spared.
                </p>
              </div>

              <div className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Auditory load
                </p>
                <h3 className="mt-2 text-sm font-semibold text-white">
                  How fragile spoken-language comprehension becomes
                </h3>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-rose-300"
                    style={{ width: `${preset.auditoryLoad}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Higher load means spoken language rapidly outruns the patient’s
                  ability to map sound onto meaning.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Phenotype
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {preset.label}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${fluencyTone(
                preset.fluencyTag,
              )}`}
            >
              {preset.fluencyTag}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
              auditory load {preset.auditoryLoad}%
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.summary}
          </p>

          <div className="mt-5 grid gap-3">
            <MetricCard
              label="Fluency"
              value={`${preset.profile.fluency}%`}
              detail="Speech rate, phrase length, and grammatical ease."
              accent="text-cyan-100"
            />
            <MetricCard
              label="Comprehension"
              value={`${preset.profile.comprehension}%`}
              detail="How well bedside spoken language remains grounded in meaning."
              accent="text-emerald-100"
            />
            <MetricCard
              label="Naming"
              value={`${preset.profile.naming}%`}
              detail="Object naming is often the clinical bridge between language knowledge and output bottlenecks."
              accent="text-sky-100"
            />
            <MetricCard
              label="Reading/Writing"
              value={`${Math.round((preset.profile.reading + preset.profile.writing) / 2)}%`}
              detail="Written language often mirrors the same network bottleneck but can still expose extra dissociations."
              accent="text-rose-100"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Dominant hemisphere map
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Which language node is most implicated
          </h2>
          <svg
            viewBox="0 0 360 250"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect x="12" y="12" width="336" height="226" rx="18" fill="#0d1424" stroke="#1e2d4a" />
            <path
              d="M80 126 C80 76 118 42 182 42 C244 42 288 76 292 124 C294 146 286 170 268 186 C252 202 232 206 206 206 L154 206 C118 206 94 196 82 176 C74 164 70 144 80 126Z"
              fill="#121b2f"
              stroke="#30445f"
              strokeWidth="1.4"
            />
            <ellipse
              cx="138"
              cy="122"
              rx="28"
              ry="22"
              fill={`rgba(103,211,255,${lesionTone(preset, "broca")})`}
              stroke="#67d3ff"
            />
            <ellipse
              cx="242"
              cy="112"
              rx="30"
              ry="22"
              fill={`rgba(52,211,153,${lesionTone(preset, "wernicke")})`}
              stroke="#34d399"
            />
            <path
              d="M154 110 C182 86 214 82 236 96"
              fill="none"
              stroke={`rgba(245,158,11,${Math.max(
                lesionTone(preset, "arcuate"),
                lesionTone(preset, "perisylvian") * 0.82,
              )})`}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <ellipse
              cx="120"
              cy="84"
              rx="26"
              ry="18"
              fill={`rgba(248,113,113,${lesionTone(preset, "aca-mca-border")})`}
              stroke="#f87171"
            />
            <ellipse
              cx="268"
              cy="86"
              rx="24"
              ry="18"
              fill={`rgba(232,121,249,${lesionTone(preset, "mca-pca-border")})`}
              stroke="#e879f9"
            />
            <rect
              x="118"
              y="86"
              width="146"
              height="76"
              rx="24"
              fill={`rgba(148,163,184,${lesionTone(preset, "perisylvian")})`}
              stroke="#94a3b8"
            />
            <text x="138" y="126" textAnchor="middle" fill="#f8fafc" fontSize="10">
              Broca
            </text>
            <text x="242" y="116" textAnchor="middle" fill="#f8fafc" fontSize="10">
              Wernicke
            </text>
            <text x="194" y="82" textAnchor="middle" fill="#f8fafc" fontSize="9">
              arcuate bridge
            </text>
            <text x="120" y="84" textAnchor="middle" fill="#f8fafc" fontSize="8">
              ant.
            </text>
            <text x="268" y="86" textAnchor="middle" fill="#f8fafc" fontSize="8">
              post.
            </text>
            <text x="194" y="204" textAnchor="middle" fill="#7f95ad" fontSize="10">
              dominant hemisphere language network
            </text>
          </svg>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.strongestLocalization}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Network logic
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Why this bedside split happens
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.networkFrame}
          </p>
          <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-100">
            {preset.dominantClue}
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Weaker alternative
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What not to confuse this with
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.weakerAlternative}
          </p>
          <div className="mt-4 grid gap-3">
            <MetricCard
              label="Repetition"
              value={`${preset.profile.repetition}%`}
              detail="One of the fastest high-yield pivots in bedside aphasia classification."
              accent="text-amber-100"
            />
            <MetricCard
              label="Naming"
              value={`${preset.profile.naming}%`}
              detail="Naming often fails across syndromes, but the reason it fails differs by network bottleneck."
              accent="text-sky-100"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Bedside probes
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            The task-level dissociations that settle the syndrome
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ProbeCard
              title="Repetition probe"
              finding={preset.repetitionProbe}
              detail="Repetition is the fastest bedside clue for separating core perisylvian aphasias from transcortical patterns."
            />
            <ProbeCard
              title="Comprehension probe"
              finding={preset.comprehensionProbe}
              detail="Command following tells you whether meaning is preserved, not just whether the patient can stay engaged."
            />
            <ProbeCard
              title="Naming probe"
              finding={preset.namingProbe}
              detail="Naming failure alone is nonspecific, but how it fails gives you the localization edge."
            />
            <ProbeCard
              title="Reading and writing"
              finding={preset.readingWriting}
              detail="Written language can echo or sharpen the same syndrome seen in speech."
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {preset.bedsideTasks.map((task) => (
              <TaskCard key={task.label} task={task} />
            ))}
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Supportive communication
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Rehab and teaching stance
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {preset.rehabSupports.map((item) => (
                <li
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-100">
              {preset.teachingPearl}
            </div>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Continue the loop
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Pair language with stroke, neglect, anatomy, and tutoring
            </h2>
            <div className="mt-4 space-y-3">
              {handoffModules.map((module) => (
                <div
                  key={module.slug}
                  className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {module.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {module.trainingStage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
