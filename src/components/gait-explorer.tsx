"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import { gaitPresets, type GaitPreset } from "~/lib/gait";

interface Footprint {
  side: "left" | "right";
  x: number;
  y: number;
  angle: number;
  opacity: number;
}

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

function buildFootprints(preset: GaitPreset) {
  const footprints: Footprint[] = [];
  let x = 54;
  const centerY = 140;
  const baseOffset = Math.max(10, preset.baseWidth * 0.9);

  for (let index = 0; index < 10; index += 1) {
    const side: Footprint["side"] = index % 2 === 0 ? "left" : "right";
    const rawStep =
      side === "left" ? preset.stepLengthLeft : preset.stepLengthRight;
    let strideScale = 0.72;

    if (preset.pattern === "parkinsonian") {
      strideScale = index < 4 ? 0.5 : 0.62;
    } else if (preset.pattern === "frontal") {
      strideScale = index < 4 ? 0.44 : 0.58;
    }

    const irregularity =
      preset.pattern === "cerebellar"
        ? (index % 3) * 0.12 - 0.12
        : preset.pattern === "sensory-ataxic"
          ? (index % 2 === 0 ? -0.08 : 0.08)
          : 0;

    x += rawStep * (strideScale + irregularity);

    let drift =
      side === "left"
        ? baseOffset / 2
        : -baseOffset / 2;
    let angle = side === "left" ? 16 : -16;

    if (preset.pattern === "cerebellar") {
      drift += Math.sin(index * 0.8) * 16 + (index % 2 === 0 ? 6 : -6);
      angle += (index % 3) * 8 - 8;
    } else if (preset.pattern === "sensory-ataxic") {
      drift += (index % 3) * 8 - 8;
      angle += side === "left" ? 10 : -10;
    } else if (preset.pattern === "parkinsonian") {
      angle *= 0.55;
    } else if (preset.pattern === "frontal") {
      drift += Math.sin(index) * 4;
      angle *= 0.45;
      x -= index < 3 ? 6 : 0;
    }

    if (preset.pattern === "hemiparetic" && preset.affectedSide === side) {
      drift += side === "left" ? 14 : -14;
      angle += side === "left" ? 16 : -16;
      x -= 8;
    }

    footprints.push({
      side,
      x,
      y: centerY + drift,
      angle,
      opacity:
        preset.pattern === "parkinsonian" || preset.pattern === "frontal"
          ? Math.max(0.56, 0.96 - index * 0.03)
          : 0.92,
    });
  }

  return footprints;
}

function FootprintShape({
  footprint,
}: Readonly<{
  footprint: Footprint;
}>) {
  const fill = footprint.side === "left" ? "#67d3ff" : "#ffd166";
  return (
    <g
      transform={`translate(${footprint.x} ${footprint.y}) rotate(${footprint.angle})`}
      opacity={footprint.opacity}
    >
      <ellipse cx="0" cy="0" rx="13" ry="25" fill={fill} />
      <circle cx="-4" cy="-23" r="4" fill={fill} />
      <circle cx="2" cy="-26" r="3.6" fill={fill} />
      <circle cx="7" cy="-21" r="3.2" fill={fill} />
    </g>
  );
}

export function GaitExplorer() {
  const [selectedPresetId, setSelectedPresetId] = useState(gaitPresets[0]!.id);
  const preset =
    gaitPresets.find((item) => item.id === selectedPresetId) ?? gaitPresets[0]!;
  const footprints = useMemo(() => buildFootprints(preset), [preset]);
  const curriculum = getCurriculumModule("gait");
  const handoffModules = (curriculum?.linkedModules ?? [])
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );
  const symmetryIndex = Math.abs(preset.stepLengthRight - preset.stepLengthLeft);
  const stressorEntries = [
    { label: "start", value: preset.stressors.start, tone: "bg-rose-300" },
    { label: "turn", value: preset.stressors.turn, tone: "bg-amber-300" },
    { label: "eyes closed", value: preset.stressors.eyesClosed, tone: "bg-cyan-300" },
    { label: "dual task", value: preset.stressors.dualTask, tone: "bg-emerald-300" },
  ];

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Bedside Patterning
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Gait pattern localizer
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Use stride geometry, base width, turning burden, cue response, and
              eyes-closed stress to separate basal ganglia, cerebellar,
              sensory, corticospinal, and frontal gait syndromes.
            </p>
          </div>
          <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-sm text-cyan-50">
            Dominant phenotype:{" "}
            <span className="font-semibold text-white">{preset.phenotype}</span>
          </div>
        </div>
      </section>

      <ModuleHandoffBanner />

      <section className="app-surface">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Clinical presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Start from the gait grammar you want to teach
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Some patterns are narrow-base and cue-responsive, others are broad,
            irregular, asymmetrically weak, or visually dependent. The point is
            to localize from the way the patient walks, not from one buzzword.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {gaitPresets.map((item) => (
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
            Footprint lane
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Walkway pattern under the current phenotype
          </h2>
          <svg
            viewBox="0 0 460 280"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect x="18" y="18" width="424" height="244" rx="18" fill="#0d1424" stroke="#1e2d4a" />
            <rect x="52" y="44" width="356" height="192" rx="16" fill="#121b2f" stroke="#233557" />
            <line x1="230" y1="52" x2="230" y2="228" stroke="#223551" strokeDasharray="5 7" />
            <text x="230" y="36" textAnchor="middle" fill="#7f95ad" fontSize="10">
              midline
            </text>
            <path
              d="M66 140 C132 132 188 138 250 142 C304 146 352 142 394 138"
              fill="none"
              stroke="rgba(103,211,255,0.22)"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {footprints.map((footprint, index) => (
              <FootprintShape key={`${footprint.side}-${index}`} footprint={footprint} />
            ))}
            <text x="74" y="246" fill="#7f95ad" fontSize="10">
              start
            </text>
            <text x="348" y="246" fill="#7f95ad" fontSize="10">
              turn zone
            </text>
          </svg>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InsetCard
              eyebrow="Step geometry"
              title="Symmetry versus width"
              detail="Hemiparetic patterns exaggerate side-to-side stride differences, while cerebellar and sensory patterns broaden the lane and add irregularity."
            >
              <svg
                viewBox="0 0 210 126"
                className="w-full rounded-[18px] border border-white/6 bg-slate-950/45"
              >
                {[
                  {
                    label: "L step",
                    value: preset.stepLengthLeft,
                    tone: "#67d3ff",
                    x: 28,
                  },
                  {
                    label: "R step",
                    value: preset.stepLengthRight,
                    tone: "#ffd166",
                    x: 72,
                  },
                  {
                    label: "Base",
                    value: preset.baseWidth,
                    tone: "#f59e0b",
                    x: 116,
                  },
                  {
                    label: "Var",
                    value: preset.variability,
                    tone: "#34d399",
                    x: 160,
                  },
                ].map((entry) => {
                  const barHeight = (entry.value / 60) * 78;
                  return (
                    <g key={entry.label}>
                      <rect
                        x={entry.x}
                        y={100 - barHeight}
                        width="24"
                        height={barHeight}
                        rx="8"
                        fill={entry.tone}
                      />
                      <text
                        x={entry.x + 12}
                        y="114"
                        textAnchor="middle"
                        fill="#7f95ad"
                        fontSize="8"
                      >
                        {entry.label}
                      </text>
                      <text
                        x={entry.x + 12}
                        y={94 - barHeight}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="8"
                      >
                        {entry.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </InsetCard>

            <InsetCard
              eyebrow="Stressors"
              title="What makes this gait fall apart"
              detail="The highest bar is often the single bedside condition that separates one gait syndrome from another."
            >
              <div className="space-y-3">
                {stressorEntries.map((entry) => (
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
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {preset.phenotype}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
              cue response {preset.cueResponse}%
            </span>
            {preset.affectedSide ? (
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                affected {preset.affectedSide}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.summary}
          </p>

          <div className="mt-5 grid gap-3">
            <MetricCard
              label="Cadence"
              value={`${preset.cadence}/min`}
              detail="Step frequency alone can mislead if stride length and turning burden are ignored."
              accent="text-cyan-100"
            />
            <MetricCard
              label="Base width"
              value={`${preset.baseWidth} cm`}
              detail="Wide bases suggest balance calibration or sensory dependence more than basal ganglia hypokinesia."
              accent="text-amber-100"
            />
            <MetricCard
              label="Stride asymmetry"
              value={`${symmetryIndex} cm`}
              detail="Large asymmetry pulls you toward pyramidal or focal peripheral patterns."
              accent="text-rose-100"
            />
            <MetricCard
              label="Turn burden"
              value={`${preset.turnSteps} steps`}
              detail="Turns expose gait programming and postural control better than straight walking alone."
              accent="text-emerald-100"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Strongest localization
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Circuit before disease label
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.strongestLocalization}
          </p>
          <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
            {preset.networkFrame}
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Dominant clue
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What the gait is telling you
          </h2>
          <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-100">
            {preset.dominantClue}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.weakerAlternative}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Bedside grammar
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Findings worth verbalizing
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {preset.bedsideClues.map((item) => (
              <li
                key={item}
                className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Bedside tests
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Quick probes that settle the differential
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {preset.bedsideTests.map((test) => (
              <div
                key={test.label}
                className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                  {test.label}
                </p>
                <p className="mt-3 text-sm font-medium leading-6 text-white">
                  {test.finding}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {test.implication}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Rehab cueing
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Practical teaching and support moves
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {preset.rehabCues.map((item) => (
                <li
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Continue the loop
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Connect gait to anatomy, stroke, loops, and tutoring
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
