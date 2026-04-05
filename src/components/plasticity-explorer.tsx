"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import {
  defaultPlasticityParams,
  plasticityParamDefinitions,
  plasticityPresets,
  simulatePlasticity,
  stdpWindow,
  type PlasticityAnchor,
  type PlasticityExample,
  type PlasticityParams,
} from "~/lib/plasticity";

const CURVE_WIDTH = 420;
const CURVE_HEIGHT = 250;
const CURVE_PAD = 40;
const WEIGHT_WIDTH = 420;
const WEIGHT_HEIGHT = 250;
const WEIGHT_PAD = 40;
const DETAIL_WIDTH = 198;
const DETAIL_HEIGHT = 126;
const DETAIL_PAD_X = 16;
const DETAIL_PAD_Y = 16;
const CUSTOM_PRESET_ID = "custom";
const DEFAULT_PRESET_ID = plasticityPresets[0]!.id;

function formatSigned(value: number, digits = 4) {
  const rounded = value.toFixed(digits);
  return value > 0 ? `+${rounded}` : rounded;
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

function InsightInset({
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

function ExampleCard({
  item,
}: Readonly<{
  item: PlasticityExample | PlasticityAnchor;
}>) {
  const description = "scenario" in item ? item.scenario : item.finding;
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
        {item.title}
      </p>
      <p className="mt-3 text-sm font-medium leading-6 text-white">
        {description}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {item.implication}
      </p>
    </div>
  );
}

function buildLinePath<T>(
  points: readonly T[],
  getX: (point: T) => number,
  getY: (point: T) => number,
) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${getX(point).toFixed(1)} ${getY(point).toFixed(1)}`,
    )
    .join(" ");
}

export function PlasticityExplorer() {
  const [params, setParams] = useState<PlasticityParams>(
    defaultPlasticityParams,
  );
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
  const result = useMemo(() => simulatePlasticity(params), [params]);

  const maxDeltaMagnitude = Math.max(
    0.01,
    ...result.stdpCurve.map((point) => Math.abs(point.dw)),
  );
  const curveMidY = CURVE_PAD + (CURVE_HEIGHT - 30) / 2;
  const curveXScale = (CURVE_WIDTH - CURVE_PAD - 10) / 100;
  const curveYScale = ((CURVE_HEIGHT - 30) / 2) / maxDeltaMagnitude;
  const zeroX = CURVE_PAD + 50 * curveXScale;

  const ltpPath =
    "M" +
    zeroX.toFixed(1) +
    " " +
    curveMidY.toFixed(1) +
    result.stdpCurve
      .filter((point) => point.dt >= 0)
      .map((point) => {
        const x = CURVE_PAD + (point.dt + 50) * curveXScale;
        const y = curveMidY - point.dw * curveYScale;
        return ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join("");

  const ltdPoints = result.stdpCurve.filter((point) => point.dt <= 0);
  const ltdPath = ltdPoints
    .map((point, index) => {
      const x = CURVE_PAD + (point.dt + 50) * curveXScale;
      const y = curveMidY - point.dw * curveYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const highlightedPoint =
    result.stdpCurve.find((point) => point.dt === Math.round(result.params.deltaT)) ??
    result.stdpCurve[50];
  const highlightedX =
    CURVE_PAD + ((highlightedPoint?.dt ?? 0) + 50) * curveXScale;
  const highlightedY = curveMidY - (highlightedPoint?.dw ?? 0) * curveYScale;
  const mirroredPoint =
    result.stdpCurve.find((point) => point.dt === -(highlightedPoint?.dt ?? 0)) ??
    highlightedPoint;
  const selectedTimingPair = [
    {
      label:
        (highlightedPoint?.dt ?? 0) > 0
          ? `+${highlightedPoint?.dt ?? 0} ms`
          : `${highlightedPoint?.dt ?? 0} ms`,
      tone: (highlightedPoint?.dw ?? 0) >= 0 ? "#44d39a" : "#ff7c76",
      value: highlightedPoint?.dw ?? 0,
    },
    {
      label:
        (mirroredPoint?.dt ?? 0) > 0
          ? `+${mirroredPoint?.dt ?? 0} ms`
          : `${mirroredPoint?.dt ?? 0} ms`,
      tone: (mirroredPoint?.dw ?? 0) >= 0 ? "#44d39a" : "#ff7c76",
      value: mirroredPoint?.dw ?? 0,
    },
  ];
  const selectedTimingMax = Math.max(
    0.001,
    ...selectedTimingPair.map((entry) => Math.abs(entry.value)),
  );
  const latencySamples = [5, 10, 20, 30, 40].map((latency) => ({
    latency,
    causal: Math.max(0, stdpWindow(latency, result.params)),
    antiCausal: Math.abs(Math.min(0, stdpWindow(-latency, result.params))),
  }));
  const latencyMagnitudeMax = Math.max(
    0.001,
    ...latencySamples.flatMap((sample) => [sample.causal, sample.antiCausal]),
  );
  const nearestLatency =
    latencySamples.reduce((closest, sample) => {
      if (!closest) {
        return sample;
      }
      return Math.abs(sample.latency - Math.abs(result.params.deltaT)) <
        Math.abs(closest.latency - Math.abs(result.params.deltaT))
        ? sample
        : closest;
    }, latencySamples[0]) ?? latencySamples[0];

  const weights = result.weightHistory.map((point) => point.weight);
  const minWeight = Math.max(0, Math.min(...weights) - 0.08);
  const maxWeight = Math.min(1, Math.max(...weights) + 0.08);
  const weightRange = Math.max(0.1, maxWeight - minWeight);
  const weightXScale =
    (WEIGHT_WIDTH - WEIGHT_PAD - 10) /
    Math.max(result.weightHistory.length, 1);
  const weightYScale = (WEIGHT_HEIGHT - 30) / weightRange;
  const initialWeightY =
    WEIGHT_HEIGHT -
    20 -
    (result.params.initialWeight - minWeight) * weightYScale;
  const weightPath = result.weightHistory
    .map((point, index) => {
      const x = WEIGHT_PAD + (index + 0.5) * weightXScale;
      const y =
        WEIGHT_HEIGHT - 20 - (point.weight - minWeight) * weightYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const effectiveDeltaHistory = result.weightHistory.map((point, index) => {
    const previousWeight =
      index === 0
        ? result.params.initialWeight
        : result.weightHistory[index - 1]!.weight;
    return {
      pair: point.pair,
      delta: Number((point.weight - previousWeight).toFixed(6)),
    };
  });
  const effectiveDeltaMax = Math.max(
    0.0005,
    ...effectiveDeltaHistory.map((point) => Math.abs(point.delta)),
  );
  const deltaMidY = DETAIL_PAD_Y + (DETAIL_HEIGHT - DETAIL_PAD_Y * 2) / 2;
  const deltaXScale =
    (DETAIL_WIDTH - DETAIL_PAD_X * 2) /
    Math.max(effectiveDeltaHistory.length - 1, 1);
  const deltaYScale =
    ((DETAIL_HEIGHT - DETAIL_PAD_Y * 2) / 2) / effectiveDeltaMax;
  const effectiveDeltaPath = buildLinePath(
    effectiveDeltaHistory,
    (point) => DETAIL_PAD_X + (point.pair - 1) * deltaXScale,
    (point) => deltaMidY - point.delta * deltaYScale,
  );
  const weightCheckpoints = [0.25, 0.5, 0.75, 1].map((fraction) => {
    const pair = Math.max(1, Math.round(result.weightHistory.length * fraction));
    const point =
      result.weightHistory[pair - 1] ??
      result.weightHistory[result.weightHistory.length - 1]!;
    return {
      label: `${Math.round(fraction * 100)}%`,
      pair: point.pair,
      weight: point.weight,
      delta: Number((point.weight - result.params.initialWeight).toFixed(4)),
    };
  });
  const firstBoundPair =
    result.weightHistory.find(
      (point) => point.weight <= 0.000001 || point.weight >= 0.999999,
    )?.pair ?? null;
  const clippedUpdatePair =
    result.weightHistory.find((point, index) => {
      const realizedDelta = effectiveDeltaHistory[index]!.delta;
      return Math.abs(realizedDelta - point.deltaW) > 0.000001;
    })?.pair ?? null;

  const regimeColor =
    result.direction === "LTP"
      ? "text-emerald-100 border-emerald-300/20 bg-emerald-300/10"
      : result.direction === "LTD"
        ? "text-rose-100 border-rose-300/20 bg-rose-300/10"
        : "text-slate-100 border-white/10 bg-white/6";

  const activePreset =
    plasticityPresets.find((preset) => preset.id === activePresetId) ?? null;
  const handoffModules = ["neuron", "dopamine", "ask"]
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );

  function applyPreset(presetId: string) {
    const preset = plasticityPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setParams(preset.params);
    setActivePresetId(preset.id);
  }

  function updateParam<K extends keyof PlasticityParams>(key: K, value: number) {
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
              Synaptic Plasticity
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Causal strengthening, depressive pruning, and stability brakes
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Plasticity is now framed as a family of teaching phenotypes rather
              than a single STDP curve. You can compare causal potentiation,
              anti-causal depression, metaplastic restraint, and saturation
              risk without pretending one local rule explains an entire memory.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setParams(defaultPlasticityParams);
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
              Start from a learning rule phenotype
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Each preset tells a different synaptic story: clean causal gain,
            non-causal weakening, restrained metaplastic balance, or floor and
            ceiling saturation.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {plasticityPresets.map((preset) => (
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
              "You are outside the canned presets. Use the phenotype summary below to see what balance of strengthening, weakening, and saturation your current rule is producing."}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {activePreset?.clinicalLens ?? result.interpretation.clinicalLens}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            {activePreset?.caution ??
              "Treat this as a local learning-rule scaffold, not a whole-network disease explanation."}
          </p>
        </div>
      </section>

      <section className="app-surface">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plasticityParamDefinitions.map((definition) => (
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
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              STDP curve
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Timing window
            </h2>
            <svg
              viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`}
              className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
            >
              <line
                x1={CURVE_PAD}
                y1={curveMidY}
                x2={CURVE_WIDTH - 10}
                y2={curveMidY}
                stroke="#1e2d4a"
              />
              <line
                x1={zeroX}
                y1={CURVE_PAD}
                x2={zeroX}
                y2={CURVE_HEIGHT - 20}
                stroke="#1e2d4a"
                strokeDasharray="4 4"
              />
              <path d={ltpPath} fill="none" stroke="#44d39a" strokeWidth="2" />
              <path d={ltdPath} fill="none" stroke="#ff7c76" strokeWidth="2" />
              <circle
                cx={highlightedX}
                cy={highlightedY}
                r="4.5"
                fill="#67d3ff"
              />
              <text
                x={zeroX}
                y={CURVE_HEIGHT - 5}
                textAnchor="middle"
                fill="#7f95ad"
                fontSize="9"
              >
                dt = 0
              </text>
              <text
                x={CURVE_PAD - 2}
                y={CURVE_PAD + 10}
                textAnchor="end"
                fill="#44d39a"
                fontSize="9"
              >
                LTP
              </text>
              <text
                x={CURVE_PAD - 2}
                y={CURVE_HEIGHT - 25}
                textAnchor="end"
                fill="#ff7c76"
                fontSize="9"
              >
                LTD
              </text>
            </svg>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InsightInset
                eyebrow="Delay sensitivity"
                title="Equal delays, opposite order"
                detail={`At ${nearestLatency?.latency ?? 0} ms, the same absolute delay can still favor strengthening or weakening depending on spike order and window asymmetry.`}
              >
                <svg
                  viewBox={`0 0 ${DETAIL_WIDTH} ${DETAIL_HEIGHT}`}
                  className="w-full rounded-[18px] border border-white/6 bg-slate-950/45"
                >
                  <line
                    x1={DETAIL_PAD_X}
                    y1={DETAIL_HEIGHT - DETAIL_PAD_Y}
                    x2={DETAIL_WIDTH - DETAIL_PAD_X}
                    y2={DETAIL_HEIGHT - DETAIL_PAD_Y}
                    stroke="#1e2d4a"
                  />
                  {latencySamples.map((sample, index) => {
                    const groupWidth = 24;
                    const gap = 7;
                    const startX =
                      DETAIL_PAD_X + 8 + index * (groupWidth + gap);
                    const causalHeight =
                      (sample.causal / latencyMagnitudeMax) *
                      (DETAIL_HEIGHT - DETAIL_PAD_Y * 2 - 16);
                    const antiCausalHeight =
                      (sample.antiCausal / latencyMagnitudeMax) *
                      (DETAIL_HEIGHT - DETAIL_PAD_Y * 2 - 16);
                    const isNearest = sample.latency === nearestLatency?.latency;

                    return (
                      <g key={sample.latency}>
                        <rect
                          x={startX}
                          y={DETAIL_HEIGHT - DETAIL_PAD_Y - causalHeight}
                          width="10"
                          height={causalHeight}
                          rx="3"
                          fill={isNearest ? "#7de8bb" : "#44d39a"}
                        />
                        <rect
                          x={startX + 13}
                          y={DETAIL_HEIGHT - DETAIL_PAD_Y - antiCausalHeight}
                          width="10"
                          height={antiCausalHeight}
                          rx="3"
                          fill={isNearest ? "#ff9b95" : "#ff7c76"}
                        />
                        <text
                          x={startX + 11.5}
                          y={DETAIL_HEIGHT - 4}
                          textAnchor="middle"
                          fill="#7f95ad"
                          fontSize="8"
                        >
                          {sample.latency}
                        </text>
                      </g>
                    );
                  })}
                  <text x="16" y="14" fill="#44d39a" fontSize="8">
                    causal
                  </text>
                  <text x="58" y="14" fill="#ff7c76" fontSize="8">
                    anti-causal
                  </text>
                </svg>
              </InsightInset>

              <InsightInset
                eyebrow="Selected timing"
                title="Current vs mirrored pairing"
                detail={
                  Math.abs(selectedTimingPair[0]!.value) >=
                  Math.abs(selectedTimingPair[1]!.value)
                    ? "The currently selected ordering expresses the stronger update at this exact delay."
                    : "The mirrored ordering would actually dominate at this delay because the LTD side is broader or stronger."
                }
              >
                <svg
                  viewBox={`0 0 ${DETAIL_WIDTH} ${DETAIL_HEIGHT}`}
                  className="w-full rounded-[18px] border border-white/6 bg-slate-950/45"
                >
                  <line
                    x1={DETAIL_WIDTH / 2}
                    y1={DETAIL_PAD_Y - 2}
                    x2={DETAIL_WIDTH / 2}
                    y2={DETAIL_HEIGHT - DETAIL_PAD_Y + 2}
                    stroke="#1e2d4a"
                    strokeDasharray="4 4"
                  />
                  {selectedTimingPair.map((entry, index) => {
                    const barWidth =
                      (Math.abs(entry.value) / selectedTimingMax) *
                      (DETAIL_WIDTH / 2 - DETAIL_PAD_X - 12);
                    const y = DETAIL_PAD_Y + 18 + index * 38;
                    const isPositive = entry.value >= 0;
                    const x = isPositive
                      ? DETAIL_WIDTH / 2
                      : DETAIL_WIDTH / 2 - barWidth;

                    return (
                      <g key={entry.label}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height="16"
                          rx="8"
                          fill={entry.tone}
                        />
                        <text
                          x={DETAIL_WIDTH / 2 - 10}
                          y={y + 11}
                          textAnchor="end"
                          fill="#c8d6e5"
                          fontSize="9"
                        >
                          {entry.label}
                        </text>
                        <text
                          x={
                            isPositive ? x + barWidth + 8 : x - 8
                          }
                          y={y + 11}
                          textAnchor={isPositive ? "start" : "end"}
                          fill="#e2e8f0"
                          fontSize="9"
                        >
                          {formatSigned(entry.value)}
                        </text>
                      </g>
                    );
                  })}
                  <text
                    x={DETAIL_WIDTH / 2}
                    y={DETAIL_HEIGHT - 6}
                    textAnchor="middle"
                    fill="#7f95ad"
                    fontSize="8"
                  >
                    zero update
                  </text>
                </svg>
              </InsightInset>
            </div>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Weight evolution
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Synaptic strength across pairings
            </h2>
            <svg
              viewBox={`0 0 ${WEIGHT_WIDTH} ${WEIGHT_HEIGHT}`}
              className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
            >
              <line
                x1={WEIGHT_PAD}
                y1={WEIGHT_PAD}
                x2={WEIGHT_PAD}
                y2={WEIGHT_HEIGHT - 20}
                stroke="#1e2d4a"
              />
              <line
                x1={WEIGHT_PAD}
                y1={WEIGHT_HEIGHT - 20}
                x2={WEIGHT_WIDTH - 10}
                y2={WEIGHT_HEIGHT - 20}
                stroke="#1e2d4a"
              />
              <line
                x1={WEIGHT_PAD}
                y1={initialWeightY}
                x2={WEIGHT_WIDTH - 10}
                y2={initialWeightY}
                stroke="#1e2d4a"
                strokeDasharray="4 4"
              />
              <path
                d={weightPath}
                fill="none"
                stroke={
                  result.direction === "LTP"
                    ? "#44d39a"
                    : result.direction === "LTD"
                      ? "#ff7c76"
                      : "#67d3ff"
                }
                strokeWidth="2"
              />
              <text
                x={WEIGHT_WIDTH - 12}
                y={initialWeightY - 3}
                textAnchor="end"
                fill="#7f95ad"
                fontSize="8"
              >
                initial
              </text>
              <text
                x={WEIGHT_WIDTH / 2}
                y={WEIGHT_HEIGHT - 3}
                textAnchor="middle"
                fill="#7f95ad"
                fontSize="9"
              >
                Spike pair
              </text>
            </svg>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InsightInset
                eyebrow="Realized update"
                title="What each pairing actually changed"
                detail={
                  clippedUpdatePair
                    ? `By about pair ${clippedUpdatePair}, the bound starts absorbing the requested update, so extra pairings teach less than the rule would suggest.`
                    : "Because the weight stays away from floor and ceiling, each pairing keeps expressing a real update instead of being clipped away."
                }
              >
                <svg
                  viewBox={`0 0 ${DETAIL_WIDTH} ${DETAIL_HEIGHT}`}
                  className="w-full rounded-[18px] border border-white/6 bg-slate-950/45"
                >
                  <line
                    x1={DETAIL_PAD_X}
                    y1={deltaMidY}
                    x2={DETAIL_WIDTH - DETAIL_PAD_X}
                    y2={deltaMidY}
                    stroke="#1e2d4a"
                  />
                  <path
                    d={effectiveDeltaPath}
                    fill="none"
                    stroke={
                      result.direction === "LTP"
                        ? "#44d39a"
                        : result.direction === "LTD"
                          ? "#ff7c76"
                          : "#67d3ff"
                    }
                    strokeWidth="2"
                  />
                  <text x="16" y="14" fill="#7f95ad" fontSize="8">
                    +delta
                  </text>
                  <text
                    x="16"
                    y={DETAIL_HEIGHT - 8}
                    fill="#7f95ad"
                    fontSize="8"
                  >
                    -delta
                  </text>
                  <text
                    x={DETAIL_WIDTH / 2}
                    y={DETAIL_HEIGHT - 6}
                    textAnchor="middle"
                    fill="#7f95ad"
                    fontSize="8"
                  >
                    pair index
                  </text>
                </svg>
              </InsightInset>

              <InsightInset
                eyebrow="Trajectory checkpoints"
                title="How fast the rule moves the synapse"
                detail={
                  firstBoundPair
                    ? `The weight reaches a hard bound by pair ${firstBoundPair}, which is why later changes mostly flatten into saturation.`
                    : "Checkpoint bars stay in midrange, so the rule remains teachable rather than collapsing into floor or ceiling."
                }
              >
                <svg
                  viewBox={`0 0 ${DETAIL_WIDTH} ${DETAIL_HEIGHT}`}
                  className="w-full rounded-[18px] border border-white/6 bg-slate-950/45"
                >
                  <line
                    x1={DETAIL_PAD_X}
                    y1={DETAIL_HEIGHT - DETAIL_PAD_Y}
                    x2={DETAIL_WIDTH - DETAIL_PAD_X}
                    y2={DETAIL_HEIGHT - DETAIL_PAD_Y}
                    stroke="#1e2d4a"
                  />
                  {weightCheckpoints.map((checkpoint, index) => {
                    const barWidth = 22;
                    const gap = 17;
                    const x = DETAIL_PAD_X + 14 + index * (barWidth + gap);
                    const fullHeight = DETAIL_HEIGHT - DETAIL_PAD_Y * 2 - 10;
                    const barHeight = checkpoint.weight * fullHeight;
                    const y = DETAIL_HEIGHT - DETAIL_PAD_Y - barHeight;
                    const isFinal = index === weightCheckpoints.length - 1;

                    return (
                      <g key={checkpoint.label}>
                        <rect
                          x={x}
                          y={DETAIL_PAD_Y + 4}
                          width={barWidth}
                          height={fullHeight}
                          rx="8"
                          fill="rgba(255,255,255,0.04)"
                        />
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="8"
                          fill={
                            isFinal
                              ? "#67d3ff"
                              : result.direction === "LTP"
                                ? "#44d39a"
                                : result.direction === "LTD"
                                  ? "#ff7c76"
                                  : "#94a3b8"
                          }
                        />
                        <text
                          x={x + barWidth / 2}
                          y={DETAIL_HEIGHT - 4}
                          textAnchor="middle"
                          fill="#7f95ad"
                          fontSize="8"
                        >
                          {checkpoint.label}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fill="#c8d6e5"
                          fontSize="8"
                        >
                          {checkpoint.weight.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </InsightInset>
            </div>
          </div>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Phenotype
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {result.interpretation.headline}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${regimeColor}`}
            >
              {result.summary.learningRegime}
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {result.summary.timingPolarity}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {result.interpretation.mechanism}
          </p>

          <div className="mt-5 grid gap-3">
            <SummaryCard
              label="Final weight"
              value={result.finalWeight.toFixed(4)}
              accent="text-white"
              detail="Where the synapse finishes after all pairings."
            />
            <SummaryCard
              label="Total change"
              value={formatSigned(result.summary.totalWeightChange)}
              accent="text-cyan-100"
              detail="Net movement from the starting weight after repeated pairings."
            />
            <SummaryCard
              label="Delta per pair"
              value={formatSigned(result.summary.deltaPerPair)}
              accent="text-amber-100"
              detail="The current local update rule expressed at the selected timing offset."
            />
            <SummaryCard
              label="Window bias"
              value={formatSigned(result.summary.windowBias)}
              accent="text-sky-100"
              detail="Positive favors LTP overall; negative favors LTD and stability pressure."
            />
            <SummaryCard
              label="Saturation state"
              value={result.summary.saturationState}
              accent="text-emerald-100"
              detail="Whether the synapse is pressed toward ceiling, floor, or still lives in a teachable middle range."
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Clinical lens
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What this rule teaches
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {result.interpretation.clinicalLens}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Behavioral readout
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What learners should notice
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
            What not to overclaim
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Examples
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Where this plasticity phenotype shows up
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            These are teaching examples, not claims that one whole disease
            reduces to one synapse. The point is to give students memorable
            places where this pattern of strengthening, weakening, or restraint
            is a useful explanatory frame.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {result.interpretation.exampleCases.map((item) => (
              <ExampleCard key={item.title} item={item} />
            ))}
          </div>
        </div>

        <div className="app-page-stack">
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Classic anchors
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Landmark examples to teach alongside the rule
            </h2>
            <div className="mt-4 space-y-3">
              {result.explanation.landmarkAnchors.map((item) => (
                <ExampleCard key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Plain-language rule
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              The shortest phrasing worth remembering
            </h2>
            <div className="mt-4 rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-100">
              {result.explanation.hebbianRule}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="app-surface">
            <h2 className="text-xl font-semibold text-white">What happened</h2>
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
              {result.explanation.stdpMechanism}
            </div>
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
              {result.explanation.connectionToAI}
            </div>
          </div>

          <div className="app-surface">
            <h2 className="text-xl font-semibold text-white">
              Biological basis
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {result.explanation.biologicalBasis.map((item) => (
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

          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Continue the loop
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Use this with excitability, dopamine, and tutoring
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
