"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import {
  basalGangliaParamDefinitions,
  basalGangliaPresets,
  defaultBasalGangliaParams,
  simulateBasalGanglia,
  type BasalGangliaParams,
} from "~/lib/basal-ganglia";
import { getCurriculumModule } from "~/lib/curriculum";

const CUSTOM_PRESET_ID = "custom";
const DEFAULT_PRESET_ID = basalGangliaPresets[0]!.id;

function flowWidth(value: number) {
  return 1.6 + value / 18;
}

function flowOpacity(value: number) {
  return 0.24 + value / 130;
}

function fillOpacity(value: number) {
  return 0.16 + value / 135;
}

function signedDelta(current: number, baseline: number) {
  const delta = current - baseline;
  if (delta === 0) {
    return "0";
  }
  return `${delta > 0 ? "+" : ""}${delta}`;
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
  summary,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}>) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{summary}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  baseline,
  tone,
}: Readonly<{
  label: string;
  value: number;
  baseline?: number;
  tone: string;
}>) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-slate-100">
          {value}%
          {typeof baseline === "number" ? (
            <span className="ml-2 text-slate-500">
              ({signedDelta(value, baseline)})
            </span>
          ) : null}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/6">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function RangeControl({
  label,
  detail,
  value,
  min,
  max,
  step,
  onChange,
}: Readonly<{
  label: string;
  detail: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}>) {
  return (
    <label className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-slate-100">
          {value}%
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-cyan-300"
      />
    </label>
  );
}

function LoopNode({
  x,
  y,
  label,
  subLabel,
  value,
  accent,
}: Readonly<{
  x: number;
  y: number;
  label: string;
  subLabel: string;
  value: number;
  accent: string;
}>) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        cx="0"
        cy="0"
        r="36"
        fill={accent}
        opacity={fillOpacity(value)}
        stroke={accent}
        strokeOpacity={0.92}
        strokeWidth="1.6"
      />
      <text
        x="0"
        y="-6"
        textAnchor="middle"
        fill="#f8fafc"
        fontSize="12"
        fontWeight="600"
      >
        {label}
      </text>
      <text x="0" y="12" textAnchor="middle" fill="#94a3b8" fontSize="10">
        {subLabel}
      </text>
      <text x="0" y="27" textAnchor="middle" fill="#e2e8f0" fontSize="10">
        {value}%
      </text>
    </g>
  );
}

export function BasalGangliaExplorer() {
  const [params, setParams] = useState<BasalGangliaParams>(
    defaultBasalGangliaParams,
  );
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
  const result = useMemo(() => simulateBasalGanglia(params), [params]);
  const baseline = useMemo(
    () => simulateBasalGanglia(defaultBasalGangliaParams),
    [],
  );
  const activePreset =
    basalGangliaPresets.find((preset) => preset.id === activePresetId) ?? null;
  const curriculum = getCurriculumModule("basal-ganglia");
  const handoffModules = (curriculum?.linkedModules ?? [])
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );

  const loopRows = [
    {
      label: "Direct release",
      value: result.metrics.directFlow,
      baseline: baseline.metrics.directFlow,
      tone: "bg-emerald-300",
    },
    {
      label: "Indirect brake",
      value: result.metrics.indirectFlow,
      baseline: baseline.metrics.indirectFlow,
      tone: "bg-amber-300",
    },
    {
      label: "Hyperdirect stop",
      value: result.metrics.hyperdirectFlow,
      baseline: baseline.metrics.hyperdirectFlow,
      tone: "bg-rose-300",
    },
    {
      label: "Pallidal output",
      value: result.metrics.pallidalBrake,
      baseline: baseline.metrics.pallidalBrake,
      tone: "bg-orange-300",
    },
    {
      label: "Thalamic release",
      value: result.metrics.thalamicRelease,
      baseline: baseline.metrics.thalamicRelease,
      tone: "bg-cyan-300",
    },
  ];

  const motorRows = [
    {
      label: "Movement vigor",
      value: result.metrics.movementVigor,
      tone: "bg-emerald-300",
    },
    {
      label: "Selection stability",
      value: result.metrics.selectionStability,
      tone: "bg-sky-300",
    },
    {
      label: "Cue leverage",
      value: result.metrics.cueLeverage,
      tone: "bg-cyan-300",
    },
    {
      label: "Medication response",
      value: result.metrics.medicationResponse,
      tone: "bg-lime-300",
    },
    {
      label: "Freezing risk",
      value: result.metrics.freezingRisk,
      tone: "bg-rose-300",
    },
    {
      label: "Unwanted movement",
      value: result.metrics.unwantedMovementRisk,
      tone: "bg-amber-300",
    },
    {
      label: "Dyskinesia risk",
      value: result.metrics.dyskinesiaRisk,
      tone: "bg-fuchsia-300",
    },
  ];

  const customSummary =
    "You are outside the canned presets now. Read the current loop metrics as a circuit story: what is over-braked, what is under-suppressed, and which bedside movement grammar should follow.";

  function applyPreset(presetId: string) {
    const preset = basalGangliaPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setParams(preset.params);
    setActivePresetId(preset.id);
  }

  function updateParam<K extends keyof BasalGangliaParams>(
    key: K,
    value: number,
  ) {
    if (Number.isNaN(value)) {
      return;
    }

    setParams((current) => ({
      ...current,
      [key]: value,
    }));
    setActivePresetId(CUSTOM_PRESET_ID);
  }

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Movement Disorders
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Basal ganglia loop explorer
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Compare direct release, indirect suppression, and hyperdirect
              stopping so learners can explain bradykinesia, freezing, chorea,
              and dyskinesia as circuit problems rather than as memorized
              disease labels.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setParams(defaultBasalGangliaParams);
              setActivePresetId(DEFAULT_PRESET_ID);
            }}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset baseline
          </button>
        </div>
      </section>

      <ModuleHandoffBanner />

      <section className="app-surface">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Teaching presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Start from a circuit phenotype, not a diagnosis label
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            The loop is most teachable when learners compare a balanced gate,
            dopamine depletion, freezing-prone overbraking, medication rescue,
            dyskinetic overshoot, and indirect-pathway collapse side by side.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {basalGangliaPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activePresetId === preset.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {preset.label}
            </button>
          ))}
          {activePresetId === CUSTOM_PRESET_ID ? (
            <span className="rounded-full border border-white/10 bg-slate-950/35 px-4 py-2 text-sm text-slate-300">
              Custom loop state
            </span>
          ) : null}
        </div>

        <div className="mt-5 rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {activePreset?.phenotype ?? result.interpretation.phenotype}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
              {result.summary.dominantRegime}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
              {result.summary.gateState}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            {activePreset?.summary ?? customSummary}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {activePreset?.clinicalLens ?? result.interpretation.clinicalLens}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            {activePreset?.caution ??
              "Treat this as a teaching scaffold for loop reasoning, not a literal patient-specific physiology readout."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {basalGangliaParamDefinitions.map((definition) => (
          <RangeControl
            key={definition.key}
            label={definition.label}
            detail={definition.detail}
            value={params[definition.key]}
            min={definition.min}
            max={definition.max}
            step={definition.step}
            onChange={(value) => updateParam(definition.key, value)}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Loop map
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Direct, indirect, and hyperdirect competition
          </h2>
          <svg
            viewBox="0 0 620 320"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect
              x="16"
              y="16"
              width="588"
              height="288"
              rx="22"
              fill="#0d1424"
              stroke="#1e2d4a"
            />

            <path
              d="M112 74 C134 98 146 112 168 132"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth={flowWidth(result.metrics.directFlow)}
              strokeOpacity={flowOpacity(result.metrics.directFlow)}
              strokeLinecap="round"
            />
            <path
              d="M208 144 C286 140 334 140 398 144"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth={flowWidth(result.metrics.directFlow)}
              strokeOpacity={flowOpacity(result.metrics.directFlow)}
              strokeLinecap="round"
            />
            <path
              d="M112 80 C194 40 256 36 308 52"
              fill="none"
              stroke="#fb7185"
              strokeWidth={flowWidth(result.metrics.hyperdirectFlow)}
              strokeOpacity={flowOpacity(result.metrics.hyperdirectFlow)}
              strokeLinecap="round"
            />
            <path
              d="M114 86 C170 110 210 122 244 132"
              fill="none"
              stroke="#fbbf24"
              strokeWidth={flowWidth(result.metrics.indirectFlow)}
              strokeOpacity={flowOpacity(result.metrics.indirectFlow)}
              strokeLinecap="round"
            />
            <path
              d="M280 170 C284 198 284 214 280 228"
              fill="none"
              stroke="#fbbf24"
              strokeWidth={flowWidth(result.metrics.indirectFlow)}
              strokeOpacity={flowOpacity(result.metrics.indirectFlow)}
              strokeLinecap="round"
            />
            <path
              d="M310 230 C350 206 350 120 308 88"
              fill="none"
              stroke="#fbbf24"
              strokeWidth={flowWidth(result.metrics.indirectFlow)}
              strokeOpacity={flowOpacity(result.metrics.indirectFlow)}
              strokeLinecap="round"
            />
            <path
              d="M344 86 C374 96 394 112 416 130"
              fill="none"
              stroke="#fb7185"
              strokeWidth={flowWidth(result.metrics.hyperdirectFlow)}
              strokeOpacity={flowOpacity(result.metrics.hyperdirectFlow)}
              strokeLinecap="round"
            />
            <path
              d="M432 144 C458 144 478 144 506 144"
              fill="none"
              stroke="#f59e0b"
              strokeWidth={flowWidth(result.metrics.pallidalBrake)}
              strokeOpacity={flowOpacity(result.metrics.pallidalBrake)}
              strokeLinecap="round"
            />
            <path
              d="M548 144 C564 120 570 102 566 80 C560 46 512 38 470 48"
              fill="none"
              stroke="#67d3ff"
              strokeWidth={flowWidth(result.metrics.thalamicRelease)}
              strokeOpacity={flowOpacity(result.metrics.thalamicRelease)}
              strokeLinecap="round"
            />
            <path
              d="M548 176 C556 206 556 220 548 246"
              fill="none"
              stroke="#67d3ff"
              strokeWidth={flowWidth(result.metrics.movementVigor)}
              strokeOpacity={flowOpacity(result.metrics.movementVigor)}
              strokeLinecap="round"
            />

            <LoopNode
              x={80}
              y={80}
              label="Cortex"
              subLabel="demand"
              value={params.corticalDrive}
              accent="#93c5fd"
            />
            <LoopNode
              x={184}
              y={144}
              label="Striatum"
              subLabel="D1 release"
              value={result.metrics.directFlow}
              accent="#6ee7b7"
            />
            <LoopNode
              x={280}
              y={144}
              label="Striatum"
              subLabel="D2 brake"
              value={result.metrics.indirectFlow}
              accent="#fbbf24"
            />
            <LoopNode
              x={320}
              y={70}
              label="STN"
              subLabel="rapid stop"
              value={result.metrics.hyperdirectFlow}
              accent="#fb7185"
            />
            <LoopNode
              x={280}
              y={244}
              label="GPe"
              subLabel="relay"
              value={Math.max(10, 100 - Math.round(result.metrics.indirectFlow * 0.72))}
              accent="#fde68a"
            />
            <LoopNode
              x={432}
              y={144}
              label="GPi/SNr"
              subLabel="output brake"
              value={result.metrics.pallidalBrake}
              accent="#f59e0b"
            />
            <LoopNode
              x={548}
              y={144}
              label="Thalamus"
              subLabel="release"
              value={result.metrics.thalamicRelease}
              accent="#67d3ff"
            />
            <LoopNode
              x={548}
              y={248}
              label="Brainstem"
              subLabel="gait scale"
              value={result.metrics.movementVigor}
              accent="#a3e635"
            />

            <text x="164" y="112" fill="#6ee7b7" fontSize="10">
              direct
            </text>
            <text x="200" y="108" fill="#fbbf24" fontSize="10">
              indirect
            </text>
            <text x="232" y="42" fill="#fb7185" fontSize="10">
              hyperdirect
            </text>
            <text x="448" y="126" fill="#fbbf24" fontSize="10">
              pallidal brake
            </text>
            <text x="500" y="42" fill="#67d3ff" fontSize="10">
              thalamic release
            </text>
          </svg>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <InsetCard
              eyebrow="Baseline comparison"
              title="Normal versus current gate balance"
              summary="Each bar compares the current loop against the balanced teaching baseline so learners can see which part of the circuit has drifted most."
            >
              <div className="space-y-3">
                {loopRows.map((row) => (
                  <ProgressRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    baseline={row.baseline}
                    tone={row.tone}
                  />
                ))}
              </div>
            </InsetCard>

            <InsetCard
              eyebrow="Motor envelope"
              title="What the learner should expect at the bedside"
              summary="The loop matters clinically only when it changes movement grammar: vigor, stability, cue response, freezing, and hyperkinetic spill."
            >
              <div className="space-y-3">
                {motorRows.map((row) => (
                  <ProgressRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    tone={row.tone}
                  />
                ))}
              </div>
            </InsetCard>
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Loop state
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {result.interpretation.headline}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {result.summary.motorState}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
              {result.summary.cueDependence}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
              {result.summary.therapyWindow}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {result.interpretation.mechanism}
          </p>

          <div className="mt-5 grid gap-3">
            <MetricCard
              label="Movement vigor"
              value={`${result.metrics.movementVigor}%`}
              detail="How easily the loop can scale and release the selected movement."
              accent="text-emerald-100"
            />
            <MetricCard
              label="Pallidal brake"
              value={`${result.metrics.pallidalBrake}%`}
              detail="Higher values mean GPi/SNr output is keeping the thalamus more tightly inhibited."
              accent="text-amber-100"
            />
            <MetricCard
              label="Thalamic release"
              value={`${result.metrics.thalamicRelease}%`}
              detail="The usable output gate back to cortex and gait-related motor programs."
              accent="text-cyan-100"
            />
            <MetricCard
              label="Cue leverage"
              value={`${result.metrics.cueLeverage}%`}
              detail="How much external rhythm or structure should rescue movement release."
              accent="text-sky-100"
            />
            <MetricCard
              label="Freezing risk"
              value={`${result.metrics.freezingRisk}%`}
              detail="Conflict-sensitive initiation failure driven by overbraking rather than weakness."
              accent="text-rose-100"
            />
            <MetricCard
              label="Dyskinesia risk"
              value={`${result.metrics.dyskinesiaRisk}%`}
              detail="How close the loop is to overshooting into medication-linked hyperkinetic spill."
              accent="text-fuchsia-100"
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
            Circuit before syndrome label
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {activePreset?.strongestLocalization ??
              result.interpretation.clinicalLens}
          </p>
          <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-100">
            {activePreset?.clinicalLens ?? result.interpretation.clinicalLens}
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Bedside grammar
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What the movement should look like
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {(activePreset?.bedsideClues ?? result.interpretation.behaviorSignals).map(
              (item) => (
                <li
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
                >
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Differential traps
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What this loop state does not mean
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {(activePreset?.differentialClues ??
              result.interpretation.differentialTraps).map((item) => (
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
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Teaching pearls
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              The professor version
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {(activePreset?.teachingPearls ??
                result.interpretation.teachingPearls).map((item) => (
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
              Next questions
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              High-yield follow-up probes
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {(activePreset?.nextQuestions ?? result.interpretation.nextQuestions).map(
                (item) => (
                  <li
                    key={item}
                    className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Continue the loop
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Use this with dopamine, gait, anatomy, and tutoring
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

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Teaching frame
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Why this module belongs now
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The app already teaches dopamine, gait, motor pathways, and brain
              localization. This module is the missing bridge that turns those
              surfaces into one movement-disorders reasoning sequence.
            </p>
            <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
              Bradykinesia, freezing, chorea, and dyskinesia are not separate
              flash cards. They are different ways a shared loop can become
              over-braked, under-suppressed, or pushed past its useful
              dopaminergic window.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
