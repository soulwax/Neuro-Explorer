"use client";

import { useMemo, useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import {
  defaultDopamineParams,
  dopamineParamDefinitions,
  dopaminePresets,
  simulateDopamine,
  type DopamineParams,
  type SnapshotMetric,
  type TracePoint,
} from "~/lib/dopamine";
import { getCurriculumModule } from "~/lib/curriculum";

const ERROR_WIDTH = 760;
const ERROR_HEIGHT = 220;
const ERROR_PAD = 28;
const SMALL_WIDTH = 360;
const SMALL_HEIGHT = 200;
const SMALL_PAD = 24;
const CUSTOM_PRESET_ID = "custom";
const DEFAULT_PRESET_ID = dopaminePresets[0]!.id;

function traceColor(index: number) {
  const colors = ["#67d3ff", "#ffd58a", "#44d39a", "#ff7c76", "#f39dd4"];
  return colors[index % colors.length]!;
}

function buildTracePath(
  points: TracePoint[],
  width: number,
  pad: number,
  xScale: number,
  zeroY: number,
  yScale: number,
) {
  return points
    .map((point, index) => {
      const x = pad + point.t * xScale;
      const y = zeroY - point.value * yScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatSigned(value: number, digits = 3) {
  const rounded = value.toFixed(digits);
  return value > 0 ? `+${rounded}` : rounded;
}

function omissionTone(severity: "minimal" | "moderate" | "severe") {
  switch (severity) {
    case "severe":
      return "border-rose-300/28 bg-rose-300/12 text-rose-100";
    case "moderate":
      return "border-amber-300/24 bg-amber-200/10 text-amber-100";
    default:
      return "border-emerald-300/22 bg-emerald-300/10 text-emerald-100";
  }
}

function SummaryCard({
  label,
  value,
  accent,
  detail,
}: Readonly<{
  label: string;
  value: string;
  accent: string;
  detail: string;
}>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function SnapshotMetricCard({
  metric,
}: Readonly<{
  metric: SnapshotMetric;
}>) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{metric.label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            Trial {metric.trial}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            metric.rewardDelivered
              ? "bg-emerald-300/14 text-emerald-100"
              : "bg-rose-300/14 text-rose-100"
          }`}
        >
          {metric.rewardDelivered ? "Reward on" : "Reward off"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Cue peak
          </p>
          <p className="mt-1 font-mono text-sm text-amber-100">
            {formatSigned(metric.cuePeak)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Reward peak
          </p>
          <p className="mt-1 font-mono text-sm text-rose-100">
            {formatSigned(metric.rewardPeak)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Cue value
          </p>
          <p className="mt-1 font-mono text-sm text-slate-200">
            {metric.cueValue.toFixed(3)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Reward value
          </p>
          <p className="mt-1 font-mono text-sm text-slate-200">
            {metric.rewardValue.toFixed(3)}
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalysisInsetCard({
  eyebrow,
  title,
  summary,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
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

export function DopamineExplorer() {
  const [params, setParams] = useState<DopamineParams>(defaultDopamineParams);
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
  const result = useMemo(() => simulateDopamine(params), [params]);

  const maxErrorAbs = Math.max(
    0.25,
    ...result.snapshots.flatMap((snapshot) =>
      snapshot.predictionError.map((point) => Math.abs(point.value)),
    ),
  );
  const errorXScale = (ERROR_WIDTH - ERROR_PAD * 2) / result.params.durationMs;
  const errorYScale = (ERROR_HEIGHT - 30) / (maxErrorAbs * 2);
  const errorZeroY = ERROR_HEIGHT / 2;
  const cueX = ERROR_PAD + result.params.cueTime * errorXScale;
  const rewardX = ERROR_PAD + result.params.rewardTime * errorXScale;

  const lastSnapshot = result.snapshots[result.snapshots.length - 1];
  const valuePoints = lastSnapshot?.valueTrace ?? [];
  const maxValue = Math.max(
    0.1,
    ...valuePoints.map((point) => point.value),
  );
  const valueXScale = (SMALL_WIDTH - SMALL_PAD * 2) / result.params.durationMs;
  const valueYScale = (SMALL_HEIGHT - 26) / maxValue;
  const valuePath = valuePoints
    .map((point, index) => {
      const x = SMALL_PAD + point.t * valueXScale;
      const y = SMALL_HEIGHT - 16 - point.value * valueYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const maxLearningAbs = Math.max(
    0.15,
    ...result.learningCurve.flatMap((point) => [
      Math.abs(point.cueError),
      Math.abs(point.rewardError),
    ]),
  );
  const learningXScale =
    (SMALL_WIDTH - SMALL_PAD * 2) /
    Math.max(result.learningCurve.length - 1, 1);
  const learningYScale = (SMALL_HEIGHT - 26) / (maxLearningAbs * 2);
  const learningZeroY = SMALL_HEIGHT / 2;
  const cuePath = result.learningCurve
    .map((point, index) => {
      const x = SMALL_PAD + index * learningXScale;
      const y = learningZeroY - point.cueError * learningYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const rewardPath = result.learningCurve
    .map((point, index) => {
      const x = SMALL_PAD + index * learningXScale;
      const y = learningZeroY - point.rewardError * learningYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const omissionX =
    result.params.omissionTrial > 0
      ? SMALL_PAD + (result.params.omissionTrial - 1) * learningXScale
      : null;
  const snapshotPeakAbs = Math.max(
    0.15,
    ...result.snapshotMetrics.flatMap((metric) => [
      Math.abs(metric.cuePeak),
      Math.abs(metric.rewardPeak),
    ]),
  );
  const snapshotPeakZeroY = SMALL_HEIGHT / 2;
  const snapshotPeakScale = (SMALL_HEIGHT - 30) / (snapshotPeakAbs * 2);
  const snapshotGroupWidth =
    (SMALL_WIDTH - SMALL_PAD * 2) / Math.max(result.snapshotMetrics.length, 1);
  const transferSeries = result.learningCurve.map((point) => ({
    trial: point.trial,
    delta: point.cueError - point.rewardError,
  }));
  const transferAbs = Math.max(
    0.15,
    ...transferSeries.map((point) => Math.abs(point.delta)),
  );
  const transferXScale =
    (SMALL_WIDTH - SMALL_PAD * 2) / Math.max(transferSeries.length - 1, 1);
  const transferZeroY = SMALL_HEIGHT / 2;
  const transferYScale = (SMALL_HEIGHT - 26) / (transferAbs * 2);
  const transferPath = transferSeries
    .map((point, index) => {
      const x = SMALL_PAD + index * transferXScale;
      const y = transferZeroY - point.delta * transferYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const anchorSummary =
    result.snapshotMetrics.some((metric) => !metric.rewardDelivered)
      ? "Anchor trials let you compare the cue takeover directly against the omission trial dip instead of only reading one full trace."
      : "Anchor trials compress the whole training history into a few checkpoints, so cue takeover is easier to compare at a glance.";
  const transferSummary =
    result.summary.shiftTrial === null
      ? "The curve stays reward-leaning throughout training, so the cue never fully takes over the predictive burden."
      : result.summary.transferIndex > 0
        ? `The curve crosses zero around trial ${result.summary.shiftTrial} and ends cue-dominant, which is the clean signature of transfer.`
        : `The cue begins to catch up around trial ${result.summary.shiftTrial}, but reward delivery still carries most of the positive surprise.`;

  const activePreset =
    dopaminePresets.find((preset) => preset.id === activePresetId) ?? null;
  const handoffModules = ["brain-atlas", "basal-ganglia", "plasticity", "ask"]
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );

  function applyPreset(presetId: string) {
    const preset = dopaminePresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setParams(preset.params);
    setActivePresetId(preset.id);
  }

  function updateParam<K extends keyof DopamineParams>(key: K, value: number) {
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
              Dopamine Lab
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cue capture, omission dips, and reinforcement phenotypes
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              The dopamine module now teaches more than a single cueward shift.
              It frames temporal-difference learning as a way to compare
              blunted transfer, cue-dominant expectation, and brittle omission
              sensitivity without pretending this simple model is a literal
              disease simulator.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setParams(defaultDopamineParams);
              setActivePresetId(DEFAULT_PRESET_ID);
            }}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
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
              Start from a learning phenotype, not just loose sliders
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Each preset is a teaching lens for a different reinforcement story:
            clean transfer, cue capture, blunting, or brittle omission
            sensitivity.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {dopaminePresets.map((preset) => (
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
              Custom parameter set
            </span>
          ) : null}
        </div>

        <div className="mt-5 rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
            {activePreset?.label ?? "Custom interpretation"}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            {activePreset?.description ??
              "You are now outside the canned presets. Use the phenotype summary below to see what story the current parameter combination is actually telling."}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {activePreset?.clinicalLens ??
              result.interpretation.clinicalLens}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            {activePreset?.caution ??
              "Treat this as a reasoning scaffold, not a literal neurochemical measurement."}
          </p>
        </div>
      </section>

      <section className="app-surface">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dopamineParamDefinitions.map((definition) => (
            <label key={definition.key} className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
                {definition.label}
                {definition.unit ? ` (${definition.unit})` : ""}
              </span>
              <input
                type="number"
                value={params[definition.key]}
                min={definition.min}
                max={definition.max}
                step={definition.step}
                onChange={(event) =>
                  updateParam(definition.key, Number(event.target.value))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Prediction error across a trial
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Snapshot traces through learning
          </h2>
          <svg
            viewBox={`0 0 ${ERROR_WIDTH} ${ERROR_HEIGHT}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <line
              x1={ERROR_PAD}
              y1={12}
              x2={ERROR_PAD}
              y2={ERROR_HEIGHT - 18}
              stroke="#1e2d4a"
            />
            <line
              x1={ERROR_PAD}
              y1={errorZeroY}
              x2={ERROR_WIDTH - ERROR_PAD}
              y2={errorZeroY}
              stroke="#2b476f"
            />
            <line
              x1={cueX}
              y1={12}
              x2={cueX}
              y2={ERROR_HEIGHT - 18}
              stroke="#6b7f99"
              strokeDasharray="4 4"
            />
            <line
              x1={rewardX}
              y1={12}
              x2={rewardX}
              y2={ERROR_HEIGHT - 18}
              stroke="#6b7f99"
              strokeDasharray="4 4"
            />
            <text x={cueX} y={16} textAnchor="middle" fill="#6b7f99" fontSize="10">
              cue
            </text>
            <text
              x={rewardX}
              y={16}
              textAnchor="middle"
              fill="#6b7f99"
              fontSize="10"
            >
              reward
            </text>
            {result.snapshots.map((snapshot, index) => (
              <g key={snapshot.label}>
                <path
                  d={buildTracePath(
                    snapshot.predictionError,
                    ERROR_WIDTH,
                    ERROR_PAD,
                    errorXScale,
                    errorZeroY,
                    errorYScale,
                  )}
                  fill="none"
                  stroke={traceColor(index)}
                  strokeWidth="1.6"
                />
                <text
                  x={ERROR_WIDTH - ERROR_PAD}
                  y={28 + index * 14}
                  textAnchor="end"
                  fill={traceColor(index)}
                  fontSize="10"
                >
                  {snapshot.label}
                </text>
              </g>
            ))}
          </svg>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <AnalysisInsetCard
              eyebrow="Anchor trials"
              title="Cue and reward peaks by checkpoint"
              summary={anchorSummary}
            >
              <svg
                viewBox={`0 0 ${SMALL_WIDTH} ${SMALL_HEIGHT}`}
                className="w-full rounded-[20px] border border-white/8 bg-slate-950/50"
              >
                <line
                  x1={SMALL_PAD}
                  y1={snapshotPeakZeroY}
                  x2={SMALL_WIDTH - SMALL_PAD}
                  y2={snapshotPeakZeroY}
                  stroke="#2b476f"
                />
                {result.snapshotMetrics.map((metric, index) => {
                  const groupX = SMALL_PAD + index * snapshotGroupWidth;
                  const cueHeight = Math.abs(metric.cuePeak) * snapshotPeakScale;
                  const rewardHeight =
                    Math.abs(metric.rewardPeak) * snapshotPeakScale;
                  const cueY =
                    metric.cuePeak >= 0
                      ? snapshotPeakZeroY - cueHeight
                      : snapshotPeakZeroY;
                  const rewardY =
                    metric.rewardPeak >= 0
                      ? snapshotPeakZeroY - rewardHeight
                      : snapshotPeakZeroY;

                  return (
                    <g key={`${metric.trial}-${metric.label}`}>
                      <rect
                        x={groupX + 8}
                        y={cueY}
                        width={Math.max(12, snapshotGroupWidth / 2 - 14)}
                        height={cueHeight}
                        rx="5"
                        fill="#ffd58a"
                      />
                      <rect
                        x={groupX + snapshotGroupWidth / 2 + 2}
                        y={rewardY}
                        width={Math.max(12, snapshotGroupWidth / 2 - 14)}
                        height={rewardHeight}
                        rx="5"
                        fill="#ff7c76"
                        opacity={metric.rewardDelivered ? 0.92 : 0.72}
                      />
                      <text
                        x={groupX + snapshotGroupWidth / 2}
                        y={SMALL_HEIGHT - 6}
                        textAnchor="middle"
                        fill="#7f95ad"
                        fontSize="9"
                      >
                        T{metric.trial}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-amber-100">
                  Cue peak
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-rose-100">
                  Reward peak
                </span>
              </div>
            </AnalysisInsetCard>

            <AnalysisInsetCard
              eyebrow="Transfer balance"
              title="Cue takeover index"
              summary={transferSummary}
            >
              <svg
                viewBox={`0 0 ${SMALL_WIDTH} ${SMALL_HEIGHT}`}
                className="w-full rounded-[20px] border border-white/8 bg-slate-950/50"
              >
                <line
                  x1={SMALL_PAD}
                  y1={10}
                  x2={SMALL_PAD}
                  y2={SMALL_HEIGHT - 16}
                  stroke="#1e2d4a"
                />
                <line
                  x1={SMALL_PAD}
                  y1={transferZeroY}
                  x2={SMALL_WIDTH - SMALL_PAD}
                  y2={transferZeroY}
                  stroke="#2b476f"
                />
                <path
                  d={transferPath}
                  fill="none"
                  stroke="#67d3ff"
                  strokeWidth="1.6"
                />
                {omissionX ? (
                  <line
                    x1={omissionX}
                    y1={10}
                    x2={omissionX}
                    y2={SMALL_HEIGHT - 16}
                    stroke="#6b7f99"
                    strokeDasharray="4 4"
                  />
                ) : null}
              </svg>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-cyan-100">
                  Cue error minus reward error
                </span>
                {omissionX ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Omission marked
                  </span>
                ) : null}
              </div>
            </AnalysisInsetCard>
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Learning phenotype
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {result.interpretation.headline}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {result.summary.learningRegime}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${omissionTone(
                result.summary.omissionSeverity,
              )}`}
            >
              {result.summary.omissionSeverity} omission penalty
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {result.interpretation.mechanism}
          </p>

          <div className="mt-5 grid gap-3">
            <SummaryCard
              label="Final cue response"
              value={result.summary.finalCueResponse.toFixed(3)}
              accent="text-amber-100"
              detail="How strongly the predictive cue now carries positive error."
            />
            <SummaryCard
              label="Final reward response"
              value={formatSigned(result.summary.finalRewardResponse)}
              accent="text-white"
              detail="Positive means reward is still surprising; small or near-zero means value has shifted upstream."
            />
            <SummaryCard
              label="Cue / reward ratio"
              value={result.summary.cueRewardRatio.toFixed(2)}
              accent="text-cyan-100"
              detail="A fast way to see whether the system is still reward-locked or already cue-dominant."
            />
            <SummaryCard
              label="Shift trial"
              value={
                result.summary.shiftTrial
                  ? result.summary.shiftTrial.toString()
                  : "Not reached"
              }
              accent="text-emerald-100"
              detail="The first trial where cue response overtakes reward response."
            />
            <SummaryCard
              label="Transfer index"
              value={formatSigned(result.summary.transferIndex)}
              accent="text-sky-100"
              detail="Positive values mean the cue has inherited more of the predictive burden."
            />
            <SummaryCard
              label="Omission dip"
              value={formatSigned(result.summary.omissionDip)}
              accent="text-rose-100"
              detail="How hard the system crashes when expected reward fails to appear."
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Value function
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Final trial expectation
          </h2>
          <svg
            viewBox={`0 0 ${SMALL_WIDTH} ${SMALL_HEIGHT}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <line
              x1={SMALL_PAD}
              y1={10}
              x2={SMALL_PAD}
              y2={SMALL_HEIGHT - 16}
              stroke="#1e2d4a"
            />
            <line
              x1={SMALL_PAD}
              y1={SMALL_HEIGHT - 16}
              x2={SMALL_WIDTH - SMALL_PAD}
              y2={SMALL_HEIGHT - 16}
              stroke="#1e2d4a"
            />
            <path
              d={valuePath}
              fill="none"
              stroke="#44d39a"
              strokeWidth="1.6"
            />
          </svg>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Learning curve
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Cue versus reward responses
          </h2>
          <svg
            viewBox={`0 0 ${SMALL_WIDTH} ${SMALL_HEIGHT}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <line
              x1={SMALL_PAD}
              y1={10}
              x2={SMALL_PAD}
              y2={SMALL_HEIGHT - 16}
              stroke="#1e2d4a"
            />
            <line
              x1={SMALL_PAD}
              y1={learningZeroY}
              x2={SMALL_WIDTH - SMALL_PAD}
              y2={learningZeroY}
              stroke="#2b476f"
            />
            <path
              d={cuePath}
              fill="none"
              stroke="#ffd58a"
              strokeWidth="1.6"
            />
            <path
              d={rewardPath}
              fill="none"
              stroke="#ff7c76"
              strokeWidth="1.6"
            />
            {omissionX ? (
              <line
                x1={omissionX}
                y1={10}
                x2={omissionX}
                y2={SMALL_HEIGHT - 16}
                stroke="#6b7f99"
                strokeDasharray="4 4"
              />
            ) : null}
          </svg>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-amber-100">
              Cue
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-rose-100">
              Reward
            </span>
            {omissionX ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Omission trial marked
              </span>
            ) : null}
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Snapshot comparison
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Trial-by-trial anchor cards
          </h2>
          <div className="mt-4 space-y-3">
            {result.snapshotMetrics.map((metric) => (
              <SnapshotMetricCard key={`${metric.trial}-${metric.label}`} metric={metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Clinical lens
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {result.interpretation.phenotype}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {result.interpretation.clinicalLens}
            </p>
            <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-200">
              {result.explanation.model}
            </div>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Behavioral readout
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              What a learner should notice
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {result.interpretation.behaviorSignals.map((item) => (
                <li
                  key={item}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Differential traps
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              What this model should not make you overclaim
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {result.interpretation.differentialTraps.map((item) => (
                <li
                  key={item}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
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
              Useful follow-up experiments
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {result.interpretation.nextQuestions.map((item) => (
                <li
                  key={item}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Model notes
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Four reminders for students
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {result.explanation.notes.map((note) => (
                <li
                  key={note}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Continue the loop
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Use this with anatomy, plasticity, and tutoring
            </h2>
            <div className="mt-4 space-y-3">
              {handoffModules.map((module) => (
                <div
                  key={module.slug}
                  className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
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
