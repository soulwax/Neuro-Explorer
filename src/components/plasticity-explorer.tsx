"use client";

import { useMemo, useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import {
  defaultPlasticityParams,
  plasticityParamDefinitions,
  plasticityPresets,
  simulatePlasticity,
  type PlasticityParams,
} from "~/lib/plasticity";

const CURVE_WIDTH = 420;
const CURVE_HEIGHT = 250;
const CURVE_PAD = 40;
const WEIGHT_WIDTH = 420;
const WEIGHT_HEIGHT = 250;
const WEIGHT_PAD = 40;
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
