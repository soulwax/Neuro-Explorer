"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import { vertigoPresets, type VertigoPreset, type VertigoTask } from "~/lib/vertigo";

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

function InsetCard({
  eyebrow,
  title,
  detail,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  detail: string;
  children: ReactNode;
}>) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
      <p className="mt-3 text-xs leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

function TaskCard({ task }: Readonly<{ task: VertigoTask }>) {
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

function riskTone(centralRisk: number) {
  if (centralRisk >= 70) {
    return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  }

  if (centralRisk >= 35) {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function headImpulseTone(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("normal")) {
    return "border-white/10 bg-white/6 text-slate-100";
  }

  if (normalized.includes("positive")) {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  }

  return "border-amber-300/20 bg-amber-300/10 text-amber-100";
}

function headImpulseBadgeLabel(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("positive")) {
    return "head impulse positive";
  }

  if (normalized.includes("normal")) {
    return "head impulse normal";
  }

  return "head impulse limited";
}

function lesionTone(
  preset: VertigoPreset,
  region:
    | "posterior-canal"
    | "labyrinth"
    | "vestibular-nerve"
    | "vestibular-nuclei"
    | "cerebellum"
    | "multisensory-network",
) {
  if (preset.lesionRegion === region) {
    return 0.92;
  }

  if (
    preset.lesionRegion === "brainstem-cerebellum" &&
    (region === "vestibular-nuclei" || region === "cerebellum")
  ) {
    return 0.9;
  }

  if (preset.lesionRegion === "vestibular-nerve" && region === "labyrinth") {
    return 0.34;
  }

  if (preset.lesionRegion === "posterior-canal" && region === "labyrinth") {
    return 0.4;
  }

  return 0.16;
}

function buildTracePath(pattern: VertigoPreset["tracePattern"]) {
  const points: Array<[number, number]> = [[28, 112]];
  let x = 28;
  let y = 112;

  const pushPoint = (dx: number, dy: number) => {
    x += dx;
    y += dy;
    points.push([x, y]);
  };

  switch (pattern) {
    case "peripheral-sawtooth":
      for (let cycle = 0; cycle < 7; cycle += 1) {
        pushPoint(24, -12);
        pushPoint(6, 28);
      }
      break;
    case "central-switch":
      for (let cycle = 0; cycle < 3; cycle += 1) {
        pushPoint(20, -12);
        pushPoint(6, 24);
      }
      for (let cycle = 0; cycle < 3; cycle += 1) {
        pushPoint(20, 12);
        pushPoint(6, -24);
      }
      break;
    case "burst-decay": {
      let amplitude = 26;
      for (let cycle = 0; cycle < 5; cycle += 1) {
        pushPoint(16, -amplitude);
        pushPoint(6, amplitude * 1.3);
        amplitude *= 0.62;
      }
      pushPoint(20, -4);
      pushPoint(18, 2);
      break;
    }
    case "migraine-variable": {
      const deltas: Array<[number, number]> = [
        [18, -10],
        [10, 18],
        [16, -16],
        [8, 12],
        [18, -8],
        [10, 14],
        [14, -12],
        [8, 8],
        [16, -6],
      ];
      deltas.forEach(([dx, dy]) => pushPoint(dx, dy));
      break;
    }
    case "hydropic-fluctuation": {
      const deltas: Array<[number, number]> = [
        [20, -8],
        [8, 18],
        [18, -10],
        [6, 14],
        [20, -6],
        [8, 16],
        [18, -8],
        [6, 12],
      ];
      deltas.forEach(([dx, dy]) => pushPoint(dx, dy));
      break;
    }
  }

  return points
    .map(([pointX, pointY], index) =>
      `${index === 0 ? "M" : "L"} ${pointX} ${pointY}`,
    )
    .join(" ");
}

function durationMarkerX(durationHours: number) {
  const minHours = 1 / 120;
  const maxHours = 168;
  const minLog = Math.log10(minHours);
  const maxLog = Math.log10(maxHours);
  const durationLog = Math.log10(Math.min(maxHours, Math.max(minHours, durationHours)));
  return 50 + ((durationLog - minLog) / (maxLog - minLog)) * 238;
}

export function VertigoExplorer() {
  const [selectedPresetId, setSelectedPresetId] = useState(vertigoPresets[0]!.id);
  const preset =
    vertigoPresets.find((item) => item.id === selectedPresetId) ?? vertigoPresets[0]!;
  const curriculum = getCurriculumModule("vertigo");
  const handoffModules = (curriculum?.linkedModules ?? [])
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );
  const tracePath = useMemo(() => buildTracePath(preset.tracePattern), [preset.tracePattern]);
  const durationX = useMemo(() => durationMarkerX(preset.durationHours), [preset.durationHours]);
  const gazeEntries = [
    { label: "left gaze", value: preset.gazeLeft, tone: "bg-cyan-300" },
    { label: "primary", value: preset.gazePrimary, tone: "bg-slate-200" },
    { label: "right gaze", value: preset.gazeRight, tone: "bg-amber-300" },
  ];
  const provocationEntries = [
    { label: "rest", value: preset.provocationRest, tone: "bg-slate-200" },
    { label: "head turn", value: preset.provocationHeadTurn, tone: "bg-cyan-300" },
    { label: "positional", value: preset.provocationPositional, tone: "bg-emerald-300" },
    { label: "visual motion", value: preset.provocationVisualMotion, tone: "bg-rose-300" },
  ];

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Vestibular Localization
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Vertigo and vestibular localizer
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Teach dizziness through timing, triggers, hearing clues, gait
              burden, and the eye-movement exam. The goal is to separate canal,
              labyrinth, vestibular-nerve, stroke, and migraine-network
              syndromes without collapsing every spinning complaint into one
              bucket.
            </p>
          </div>
          <div
            className={`rounded-[24px] border px-4 py-3 text-sm ${riskTone(
              preset.centralRisk,
            )}`}
          >
            Current frame:{" "}
            <span className="font-semibold text-white">{preset.frame}</span>
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
              Start from the bedside vertigo grammar
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Students remember vertigo best when you organize it by temporal
            pattern: continuous acute vestibular syndrome, brief triggered
            spells, recurrent cochlear episodes, and visually loaded migraine
            attacks.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {vertigoPresets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPresetId(item.id)}
              className={`min-h-12 rounded-full px-4 py-2.5 text-sm font-medium transition ${
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
            Oculomotor trace
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Eye-movement pattern under the current syndrome
          </h2>
          <svg
            viewBox="0 0 420 220"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect x="18" y="18" width="384" height="184" rx="18" fill="#0d1424" stroke="#1e2d4a" />
            {[0, 1, 2, 3].map((index) => (
              <line
                key={`grid-${index}`}
                x1="46"
                y1={56 + index * 32}
                x2="382"
                y2={56 + index * 32}
                stroke="#233557"
                strokeDasharray="4 6"
              />
            ))}
            {[0, 1, 2, 3, 4].map((index) => (
              <line
                key={`vert-${index}`}
                x1={64 + index * 70}
                y1="42"
                x2={64 + index * 70}
                y2="182"
                stroke="#1b2943"
                strokeDasharray="4 6"
              />
            ))}
            <path
              d={tracePath}
              fill="none"
              stroke="#67d3ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="28" y1="112" x2="382" y2="112" stroke="#31435f" strokeDasharray="3 5" />
            <text x="30" y="34" fill="#7f95ad" fontSize="10">
              slow phase drift plus quick reset
            </text>
            <text x="30" y="196" fill="#7f95ad" fontSize="10">
              time
            </text>
            <text x="334" y="34" fill="#7f95ad" fontSize="10" textAnchor="end">
              intensity envelope
            </text>
          </svg>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.nystagmus}
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <InsetCard
              eyebrow="Duration ladder"
              title="Timing usually beats buzzwords"
              detail={`${preset.durationLabel} ${preset.recurrenceLabel}`}
            >
              <svg
                viewBox="0 0 320 94"
                className="w-full rounded-[18px] border border-white/6 bg-slate-950/45"
              >
                <line x1="50" y1="46" x2="288" y2="46" stroke="#35537d" strokeWidth="4" />
                {[50, 108, 166, 224, 282].map((x) => (
                  <line key={x} x1={x} y1="36" x2={x} y2="56" stroke="#1e2d4a" />
                ))}
                <line x1={durationX} y1="24" x2={durationX} y2="68" stroke="#ffd166" strokeWidth="4" />
                <text x="50" y="78" textAnchor="middle" fill="#7f95ad" fontSize="9">
                  sec
                </text>
                <text x="108" y="78" textAnchor="middle" fill="#7f95ad" fontSize="9">
                  min
                </text>
                <text x="166" y="78" textAnchor="middle" fill="#7f95ad" fontSize="9">
                  hr
                </text>
                <text x="224" y="78" textAnchor="middle" fill="#7f95ad" fontSize="9">
                  day
                </text>
                <text x="282" y="78" textAnchor="middle" fill="#7f95ad" fontSize="9">
                  week
                </text>
              </svg>
            </InsetCard>

            <InsetCard
              eyebrow="Gaze loading"
              title="Does the beat direction stay loyal?"
              detail="Peripheral syndromes often intensify in one gaze direction. Central syndromes change direction or lose that clean pattern."
            >
              <div className="space-y-3">
                {gazeEntries.map((entry) => (
                  <div key={entry.label}>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>{entry.label}</span>
                      <span className="font-mono text-slate-200">{entry.value}%</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/6">
                      <div
                        className={`h-full rounded-full ${entry.tone}`}
                        style={{ width: `${entry.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </InsetCard>

            <InsetCard
              eyebrow="Provocation map"
              title="What makes the vertigo declare itself"
              detail="Timing and triggers are often more localizing than the word dizziness itself."
            >
              <div className="space-y-3">
                {provocationEntries.map((entry) => (
                  <div key={entry.label}>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>{entry.label}</span>
                      <span className="font-mono text-slate-200">{entry.value}%</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/6">
                      <div
                        className={`h-full rounded-full ${entry.tone}`}
                        style={{ width: `${entry.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </InsetCard>
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
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${riskTone(preset.centralRisk)}`}>
              central risk {preset.centralRisk}%
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${headImpulseTone(preset.headImpulse)}`}>
              {headImpulseBadgeLabel(preset.headImpulse)}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.summary}
          </p>

          <div className="mt-5 grid gap-3">
            <MetricCard
              label="Central risk"
              value={`${preset.centralRisk}%`}
              detail="Not a diagnostic score, but a teaching shorthand for how hard the bedside data pull you toward brainstem-cerebellar causes."
              accent="text-rose-100"
            />
            <MetricCard
              label="Fixation suppression"
              value={`${preset.fixationSuppression}%`}
              detail="Peripheral nystagmus tends to calm when the patient fixates. Central patterns usually ignore that brake."
              accent="text-cyan-100"
            />
            <MetricCard
              label="Gait burden"
              value={`${preset.gaitBurden}%`}
              detail="The more catastrophic the truncal instability, the more you should worry about posterior fossa localization."
              accent="text-amber-100"
            />
            <MetricCard
              label="Hearing shift"
              value={`${preset.hearingShift}%`}
              detail="Cochlear symptoms are major localization clues in labyrinthine disease and selected AICA lesions."
              accent="text-emerald-100"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Vestibular pathway
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Where the lesion pressure sits
          </h2>
          <svg
            viewBox="0 0 360 244"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect x="12" y="12" width="336" height="220" rx="18" fill="#0d1424" stroke="#1e2d4a" />
            <path d="M78 88 C54 82 44 104 56 118 C42 136 56 164 82 158" fill="none" stroke="#6ee7b7" strokeWidth="8" strokeLinecap="round" opacity={lesionTone(preset, "posterior-canal")} />
            <rect
              x="42"
              y="126"
              width="70"
              height="44"
              rx="18"
              fill={`rgba(52,211,153,${lesionTone(preset, "labyrinth")})`}
              stroke="#34d399"
            />
            <rect
              x="132"
              y="120"
              width="62"
              height="36"
              rx="18"
              fill={`rgba(103,211,255,${lesionTone(preset, "vestibular-nerve")})`}
              stroke="#67d3ff"
            />
            <rect
              x="212"
              y="116"
              width="68"
              height="42"
              rx="18"
              fill={`rgba(248,113,113,${lesionTone(preset, "vestibular-nuclei")})`}
              stroke="#f87171"
            />
            <ellipse
              cx="264"
              cy="184"
              rx="44"
              ry="24"
              fill={`rgba(245,158,11,${lesionTone(preset, "cerebellum")})`}
              stroke="#f59e0b"
            />
            <rect
              x="256"
              y="42"
              width="74"
              height="40"
              rx="18"
              fill={`rgba(232,121,249,${lesionTone(preset, "multisensory-network")})`}
              stroke="#e879f9"
            />
            <line x1="112" y1="146" x2="132" y2="138" stroke="#35537d" strokeWidth="3" />
            <line x1="194" y1="138" x2="212" y2="138" stroke="#35537d" strokeWidth="3" />
            <line x1="246" y1="116" x2="246" y2="82" stroke="#35537d" strokeWidth="3" />
            <line x1="258" y1="158" x2="262" y2="160" stroke="#35537d" strokeWidth="3" />
            <text x="78" y="113" textAnchor="middle" fill="#f8fafc" fontSize="10">
              posterior
            </text>
            <text x="78" y="124" textAnchor="middle" fill="#f8fafc" fontSize="10">
              canal
            </text>
            <text x="77" y="152" textAnchor="middle" fill="#f8fafc" fontSize="10">
              labyrinth
            </text>
            <text x="163" y="142" textAnchor="middle" fill="#f8fafc" fontSize="10">
              nerve
            </text>
            <text x="246" y="140" textAnchor="middle" fill="#f8fafc" fontSize="10">
              nuclei
            </text>
            <text x="264" y="188" textAnchor="middle" fill="#f8fafc" fontSize="10">
              cerebellum
            </text>
            <text x="293" y="65" textAnchor="middle" fill="#f8fafc" fontSize="10">
              cortex
            </text>
            <text x="180" y="214" textAnchor="middle" fill="#7f95ad" fontSize="10">
              vestibular signal path from ear to brain
            </text>
          </svg>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.strongestLocalization}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            HINTS readout
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What the exam is really saying
          </h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                Head impulse
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-white">
                {preset.headImpulse}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                Nystagmus
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-white">
                {preset.nystagmus}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                Test of skew
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-white">
                {preset.skew}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-100">
            {preset.hintsScope}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.networkFrame}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Differential pivots
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What should win and what should lose
          </h2>
          <div className="mt-4 rounded-[22px] border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-100">
            {preset.dominantClue}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.weakerAlternative}
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Trigger pattern
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {preset.triggerContext}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Hearing frame
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {preset.hearingContext}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Bedside maneuvers
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Examinations that actually settle the syndrome
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {preset.bedsideTasks.map((task) => (
              <TaskCard key={task.label} task={task} />
            ))}
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Supportive teaching
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              How to frame the syndrome for learners and patients
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
              Pair vestibular reasoning with anatomy, stroke, gait, and tutoring
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
