"use client";

import { useMemo, useState } from "react";
import {
  defaultPlasticityParams,
  plasticityParamDefinitions,
  simulatePlasticity,
  type PlasticityParams,
} from "~/lib/plasticity";

const CURVE_WIDTH = 420;
const CURVE_HEIGHT = 250;
const CURVE_PAD = 40;
const WEIGHT_WIDTH = 420;
const WEIGHT_HEIGHT = 250;
const WEIGHT_PAD = 40;

export function PlasticityExplorer() {
  const [params, setParams] = useState<PlasticityParams>(
    defaultPlasticityParams,
  );
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
  const highlightedX = CURVE_PAD + ((highlightedPoint?.dt ?? 0) + 50) * curveXScale;
  const highlightedY =
    curveMidY - (highlightedPoint?.dw ?? 0) * curveYScale;

  const weights = result.weightHistory.map((point) => point.weight);
  const minWeight = Math.max(0, Math.min(...weights) - 0.08);
  const maxWeight = Math.min(1, Math.max(...weights) + 0.08);
  const weightRange = Math.max(0.1, maxWeight - minWeight);
  const weightXScale = (WEIGHT_WIDTH - WEIGHT_PAD - 10) / Math.max(result.weightHistory.length, 1);
  const weightYScale = (WEIGHT_HEIGHT - 30) / weightRange;
  const initialWeightY =
    WEIGHT_HEIGHT - 20 - (result.params.initialWeight - minWeight) * weightYScale;
  const weightPath = result.weightHistory
    .map((point, index) => {
      const x = WEIGHT_PAD + (index + 0.5) * weightXScale;
      const y = WEIGHT_HEIGHT - 20 - (point.weight - minWeight) * weightYScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const lastWeightPoint = result.weightHistory[result.weightHistory.length - 1];
  const deltaPerPair = lastWeightPoint?.deltaW ?? 0;
  const regimeColor =
    result.direction === "LTP"
      ? "text-emerald-100 border-emerald-300/20 bg-emerald-300/10"
      : result.direction === "LTD"
        ? "text-rose-100 border-rose-300/20 bg-rose-300/10"
        : "text-slate-100 border-white/10 bg-white/6";

  function updateParam<K extends keyof PlasticityParams>(key: K, value: number) {
    if (Number.isNaN(value)) {
      return;
    }

    setParams((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Synaptic Plasticity
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              STDP as a stable local learning rule
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              This migration slice keeps the computation local and deterministic
              while adding a second chart-driven learning module. It is a good
              foundation before any AI-backed routes move over.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setParams(defaultPlasticityParams)}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_320px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
                stroke={result.direction === "LTP" ? "#44d39a" : result.direction === "LTD" ? "#ff7c76" : "#67d3ff"}
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

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Outcome
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Learning direction
          </h2>

          <div
            className={`mt-5 rounded-3xl border p-4 text-sm font-medium uppercase tracking-[0.18em] ${regimeColor}`}
          >
            {result.direction}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Final weight
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {result.finalWeight.toFixed(4)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Delta per pair
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-100">
                {deltaPerPair.toFixed(4)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Hebbian rule
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {result.explanation.hebbianRule}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">What happened</h2>
          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
            {result.explanation.stdpMechanism}
          </div>
          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
            {result.explanation.connectionToAI}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
      </section>
    </div>
  );
}
