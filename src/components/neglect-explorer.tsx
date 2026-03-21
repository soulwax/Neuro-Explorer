"use client";

import { useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import { neglectPresets, type NeglectPreset, type NeglectTask } from "~/lib/neglect";

const sceneObjects = [
  { id: "window", label: "Window", side: "left", x: 48, y: 42, width: 84, height: 42 },
  { id: "tray", label: "Meal tray", side: "left", x: 62, y: 166, width: 98, height: 50 },
  { id: "notes", label: "Notes", side: "left", x: 138, y: 92, width: 72, height: 36 },
  { id: "monitor", label: "Monitor", side: "right", x: 276, y: 38, width: 104, height: 46 },
  { id: "cup", label: "Cup", side: "right", x: 294, y: 124, width: 58, height: 34 },
  { id: "door", label: "Door", side: "right", x: 338, y: 180, width: 70, height: 44 },
] as const;

const cancellationTargets = [
  { id: "l1", zone: "left", x: 66, y: 78 },
  { id: "l2", zone: "left", x: 90, y: 114 },
  { id: "l3", zone: "left", x: 78, y: 146 },
  { id: "l4", zone: "left", x: 126, y: 68 },
  { id: "l5", zone: "left", x: 142, y: 126 },
  { id: "l6", zone: "left", x: 166, y: 162 },
  { id: "c1", zone: "center", x: 192, y: 90 },
  { id: "c2", zone: "center", x: 214, y: 132 },
  { id: "c3", zone: "center", x: 232, y: 72 },
  { id: "c4", zone: "center", x: 238, y: 166 },
  { id: "c5", zone: "center", x: 258, y: 106 },
  { id: "c6", zone: "center", x: 266, y: 148 },
  { id: "r1", zone: "right", x: 300, y: 74 },
  { id: "r2", zone: "right", x: 316, y: 112 },
  { id: "r3", zone: "right", x: 330, y: 154 },
  { id: "r4", zone: "right", x: 356, y: 82 },
  { id: "r5", zone: "right", x: 372, y: 126 },
  { id: "r6", zone: "right", x: 392, y: 168 },
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

function TaskCard({ task }: Readonly<{ task: NeglectTask }>) {
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

function objectOpacity(preset: NeglectPreset, side: "left" | "right") {
  if (side === "right") {
    return 0.94;
  }

  return Math.max(0.22, 0.92 - preset.spaceBias * 0.62);
}

function targetStatus(
  preset: NeglectPreset,
  zone: "left" | "center" | "right",
  zoneSeenCount: Record<"left" | "center" | "right", number>,
) {
  zoneSeenCount[zone] += 1;
  const limit =
    zone === "left"
      ? preset.leftTargetHits
      : zone === "center"
        ? preset.centerTargetHits
        : preset.rightTargetHits;

  return zoneSeenCount[zone] <= limit;
}

export function NeglectExplorer() {
  const [selectedPresetId, setSelectedPresetId] = useState(
    neglectPresets[0]!.id,
  );
  const preset =
    neglectPresets.find((item) => item.id === selectedPresetId) ??
    neglectPresets[0]!;
  const curriculum = getCurriculumModule("neglect");
  const handoffModules = (curriculum?.linkedModules ?? [])
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );
  const leftCapturePct = Math.round((preset.leftTargetHits / 6) * 100);
  const centerCapturePct = Math.round((preset.centerTargetHits / 6) * 100);
  const lineMarkX = 80 + ((50 + preset.bisectionShiftPct) / 100) * 260;
  const leftFadeOpacity = 0.12 + preset.spaceBias * 0.34;
  const zoneSeenCount = { left: 0, center: 0, right: 0 };
  const cancellationStatus = cancellationTargets.map((target) => ({
    ...target,
    found: targetStatus(preset, target.zone, zoneSeenCount),
  }));

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Spatial Attention
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Neglect and extinction localizer
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Separate hemispatial neglect from field loss by looking at search
              strategy, object-centered distortion, extinction under
              competition, and the mismatch between what the patient can detect
              alone versus what they explore spontaneously.
            </p>
          </div>
          <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-sm text-cyan-50">
            Strongest framing:{" "}
            <span className="font-semibold text-white">{preset.referenceFrame}</span>
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
              Attention failure is not one syndrome
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Choose whether the dominant problem is viewer-centered bias,
            bilateral extinction, object-centered truncation, or leftward
            motor initiation failure.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {neglectPresets.map((item) => (
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
            Attention map
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Exploration field under the current syndrome
          </h2>
          <svg
            viewBox="0 0 460 280"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <defs>
              <linearGradient id="neglect-left-fade" x1="0" x2="1">
                <stop
                  offset="0%"
                  stopColor="#f87171"
                  stopOpacity={Number(leftFadeOpacity.toFixed(2))}
                />
                <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <rect x="18" y="18" width="424" height="244" rx="18" fill="#0d1424" stroke="#1e2d4a" />
            <rect x="36" y="34" width="176" height="212" rx="14" fill="url(#neglect-left-fade)" />
            <line x1="230" y1="34" x2="230" y2="246" stroke="#27405f" strokeDasharray="5 6" />
            <text x="88" y="28" fill="#7f95ad" fontSize="10" textAnchor="middle">
              neglected hemispace
            </text>
            <text x="334" y="28" fill="#7f95ad" fontSize="10" textAnchor="middle">
              attended hemispace
            </text>

            {sceneObjects.map((item) => {
              const opacity = objectOpacity(
                preset,
                item.side === "left" ? "left" : "right",
              );
              return (
                <g key={item.id} opacity={opacity}>
                  <rect
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    rx="12"
                    fill={item.side === "left" ? "#172036" : "#1a2942"}
                    stroke={item.side === "left" ? "#35537d" : "#41638f"}
                  />
                  <text
                    x={item.x + item.width / 2}
                    y={item.y + item.height / 2 + 4}
                    textAnchor="middle"
                    fill="#d7e5f3"
                    fontSize="11"
                  >
                    {item.label}
                  </text>
                  {preset.objectBias > 0.2 ? (
                    <rect
                      x={item.x}
                      y={item.y}
                      width={item.width / 2}
                      height={item.height}
                      rx="12"
                      fill={`rgba(244,63,94,${(preset.objectBias * 0.34).toFixed(2)})`}
                    />
                  ) : null}
                </g>
              );
            })}

            {cancellationStatus.map((target) =>
              target.found ? (
                <g key={target.id}>
                  <circle
                    cx={target.x}
                    cy={target.y}
                    r="6"
                    fill="#67d3ff"
                    opacity={target.zone === "left" ? 0.78 : 0.92}
                  />
                  <path
                    d={`M${target.x - 5} ${target.y} L${target.x + 5} ${target.y} M${target.x} ${target.y - 5} L${target.x} ${target.y + 5}`}
                    stroke="#0d1424"
                    strokeWidth="1.4"
                  />
                </g>
              ) : (
                <circle
                  key={target.id}
                  cx={target.x}
                  cy={target.y}
                  r="6"
                  fill="none"
                  stroke={target.zone === "left" ? "#f87171" : "#64748b"}
                  strokeDasharray="3 3"
                  opacity={target.zone === "left" ? 0.9 : 0.45}
                />
              ),
            )}

            <path
              d="M348 66 C326 62 300 64 280 74 C302 86 322 106 338 130 C308 122 282 118 250 120 C276 136 296 160 308 186 C274 176 246 172 220 170"
              fill="none"
              stroke="rgba(103,211,255,0.44)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <text x="346" y="196" fill="#7f95ad" fontSize="10">
              spontaneous search path
            </text>
          </svg>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Line bisection
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">
                Midpoint is dragged rightward
              </h3>
              <svg
                viewBox="0 0 380 108"
                className="mt-3 w-full rounded-[18px] border border-white/6 bg-slate-950/45"
              >
                <line x1="80" y1="56" x2="340" y2="56" stroke="#35537d" strokeWidth="4" />
                <line x1="210" y1="34" x2="210" y2="78" stroke="#1e2d4a" strokeDasharray="4 4" />
                <line
                  x1={lineMarkX}
                  y1="30"
                  x2={lineMarkX}
                  y2="82"
                  stroke="#ffd166"
                  strokeWidth="4"
                />
                <text x="210" y="18" textAnchor="middle" fill="#7f95ad" fontSize="9">
                  true center
                </text>
                <text x={lineMarkX} y="98" textAnchor="middle" fill="#ffd166" fontSize="9">
                  +{preset.bisectionShiftPct}% right shift
                </text>
              </svg>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                Large shifts point toward viewer-centered spatial bias even when
                formal strength and primary sensation are intact.
              </p>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Competition load
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">
                Bilateral input suppresses the left side
              </h3>
              <div className="mt-3 space-y-3">
                {[
                  {
                    label: "Left alone",
                    value: preset.singleLeftDetection,
                    tone: "bg-cyan-300",
                  },
                  {
                    label: "Both detected",
                    value: preset.bilateralBothDetection,
                    tone: "bg-amber-300",
                  },
                  {
                    label: "Left reported during bilateral",
                    value: preset.bilateralLeftDetection,
                    tone: "bg-rose-300",
                  },
                ].map((entry) => (
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
              <p className="mt-3 text-xs leading-6 text-slate-400">
                Extinction is exposed by comparing single-target detection with
                bilateral competition, not by single-item confrontation alone.
              </p>
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
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {preset.referenceFrame}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
              left capture {leftCapturePct}%
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
              extinction {Math.round(preset.extinctionLoad * 100)}%
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.summary}
          </p>

          <div className="mt-5 grid gap-3">
            <MetricCard
              label="Left target capture"
              value={`${leftCapturePct}%`}
              detail="How many leftmost cancellation targets are spontaneously acquired."
              accent="text-cyan-100"
            />
            <MetricCard
              label="Center capture"
              value={`${centerCapturePct}%`}
              detail="Center-space can stay partly intact even while left exploration collapses."
              accent="text-slate-100"
            />
            <MetricCard
              label="Bisection shift"
              value={`+${preset.bisectionShiftPct}%`}
              detail="Rightward midpoint bias is a compact readout of egocentric spatial pull."
              accent="text-amber-100"
            />
            <MetricCard
              label="Extinction load"
              value={`${Math.round(preset.extinctionLoad * 100)}%`}
              detail="Higher values mean bilateral competition is disproportionately destructive."
              accent="text-rose-100"
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
            Network before lesion label
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.strongestLocalization}
          </p>
          <p className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
            {preset.networkFrame}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Weaker alternative
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Why a field cut is not enough
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {preset.weakerAlternative}
          </p>
          <div className="mt-4 rounded-[22px] border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-200">
            {preset.dominantClue}
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Discriminators
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What to look for at the bedside
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {preset.differentiators.map((item) => (
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
            Bedside probes
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Tasks that reveal the syndrome layer
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {preset.tasks.map((task) => (
              <TaskCard key={task.label} task={task} />
            ))}
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Supportive strategy
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Rehab and teaching moves
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
              Pair attention with fields, cortex, stroke, and tutoring
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
