"use client";

import { useMemo, useState } from "react";
import {
  defaultRetinaParams,
  retinaParamDefinitions,
  retinaStimulusTypes,
  simulateRetina,
  type CurvePoint,
  type MatrixPoint,
  type RetinaParams,
} from "~/lib/retina";

const MATRIX_SIZE = 340;
const MATRIX_PADDING = 18;
const CURVE_WIDTH = 360;
const CURVE_HEIGHT = 210;
const CURVE_PADDING = 26;

function centerSurroundColor(value: number, maxAbs: number) {
  const normalized =
    maxAbs <= 0 ? 0.5 : Math.max(0, Math.min(1, (value / maxAbs + 1) / 2));
  const hue = 220 - 220 * normalized;
  const saturation = 55 + 30 * Math.abs(normalized - 0.5) * 2;
  const lightness = 16 + (40 * Math.abs(value)) / Math.max(maxAbs, 0.001);
  return `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%)`;
}

function stimulusColor(value: number) {
  if (value > 0) {
    return "#ffd58a";
  }

  if (value < 0) {
    return "#8f7dff";
  }

  return "#0f1729";
}

function peakPoint(points: CurvePoint[]) {
  return points.reduce((best, point) =>
    point.value > best.value ? point : best,
  );
}

function troughPoint(points: CurvePoint[]) {
  return points.reduce((best, point) =>
    point.value < best.value ? point : best,
  );
}

function MatrixHeatmap({
  points,
  mode,
}: {
  points: MatrixPoint[];
  mode: "field" | "stimulus";
}) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const columns = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const cellWidth = (MATRIX_SIZE - MATRIX_PADDING * 2) / Math.max(columns, 1);
  const cellHeight = (MATRIX_SIZE - MATRIX_PADDING * 2) / Math.max(rows, 1);
  const maxAbs = points.reduce(
    (best, point) => Math.max(best, Math.abs(point.value)),
    0.1,
  );
  const zeroX = MATRIX_PADDING + (0 - minX + 0.5) * cellWidth;
  const zeroY = MATRIX_PADDING + (maxY - 0 + 0.5) * cellHeight;

  return (
    <svg
      viewBox={`0 0 ${MATRIX_SIZE} ${MATRIX_SIZE}`}
      className="w-full rounded-[24px] border border-white/6 bg-slate-950/45"
    >
      <rect
        x={MATRIX_PADDING}
        y={MATRIX_PADDING}
        width={MATRIX_SIZE - MATRIX_PADDING * 2}
        height={MATRIX_SIZE - MATRIX_PADDING * 2}
        rx={8}
        fill="#0d1424"
        stroke="#1e2d4a"
      />
      {points.map((point) => {
        const x = MATRIX_PADDING + (point.x - minX) * cellWidth;
        const y = MATRIX_PADDING + (maxY - point.y) * cellHeight;
        const fill =
          mode === "field"
            ? centerSurroundColor(point.value, maxAbs)
            : stimulusColor(point.value);

        return (
          <rect
            key={`${point.x}:${point.y}`}
            x={x}
            y={y}
            width={cellWidth + 0.4}
            height={cellHeight + 0.4}
            fill={fill}
          />
        );
      })}
      <line
        x1={zeroX}
        y1={MATRIX_PADDING}
        x2={zeroX}
        y2={MATRIX_SIZE - MATRIX_PADDING}
        stroke="rgba(200,214,229,0.18)"
        strokeDasharray="4 4"
      />
      <line
        x1={MATRIX_PADDING}
        y1={zeroY}
        x2={MATRIX_SIZE - MATRIX_PADDING}
        y2={zeroY}
        stroke="rgba(200,214,229,0.18)"
        strokeDasharray="4 4"
      />
      <text
        x={MATRIX_SIZE - MATRIX_PADDING}
        y={16}
        textAnchor="end"
        fill="#7f95ad"
        fontSize="10"
      >
        {mode === "field"
          ? "center positive, surround negative"
          : "bright positive, dark negative"}
      </text>
    </svg>
  );
}

function CurveChart({
  points,
  color,
  label,
}: {
  points: CurvePoint[];
  color: string;
  label: string;
}) {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint) {
    return null;
  }

  const minX = firstPoint.x;
  const maxX = lastPoint.x;
  const maxAbs = points.reduce(
    (best, point) => Math.max(best, Math.abs(point.value)),
    0.1,
  );
  const xScale = (CURVE_WIDTH - CURVE_PADDING * 2) / Math.max(maxX - minX, 1);
  const yScale = (CURVE_HEIGHT - 32) / (maxAbs * 2);
  const zeroY = CURVE_HEIGHT / 2;
  const path = points
    .map((point, index) => {
      const x = CURVE_PADDING + (point.x - minX) * xScale;
      const y = zeroY - point.value * yScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`}
      className="w-full rounded-[24px] border border-white/6 bg-slate-950/45"
    >
      <line
        x1={CURVE_PADDING}
        y1={12}
        x2={CURVE_PADDING}
        y2={CURVE_HEIGHT - 18}
        stroke="#1e2d4a"
      />
      <line
        x1={CURVE_PADDING}
        y1={zeroY}
        x2={CURVE_WIDTH - CURVE_PADDING}
        y2={zeroY}
        stroke="#2b476f"
      />
      {Array.from({ length: 5 }).map((_, index) => {
        const gridX =
          CURVE_PADDING + ((CURVE_WIDTH - CURVE_PADDING * 2) / 4) * index;
        return (
          <line
            key={index}
            x1={gridX}
            y1={12}
            x2={gridX}
            y2={CURVE_HEIGHT - 18}
            stroke="#18243b"
            strokeWidth="0.7"
          />
        );
      })}
      <path d={path} fill="none" stroke={color} strokeWidth="1.7" />
      <text
        x={CURVE_WIDTH - CURVE_PADDING}
        y={18}
        textAnchor="end"
        fill="#7f95ad"
        fontSize="10"
      >
        {label}
      </text>
    </svg>
  );
}

export function RetinaExplorer() {
  const [params, setParams] = useState<RetinaParams>(defaultRetinaParams);
  const result = useMemo(() => simulateRetina(params), [params]);

  const preferredSpot = peakPoint(result.sizeTuning);
  const strongestSuppression = troughPoint(result.positionScan);
  const responseMode =
    result.response > 0.05
      ? "Center dominated"
      : result.response < -0.05
        ? "Surround dominated"
        : "Balanced";

  function updateNumericParam<K extends keyof RetinaParams>(
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
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Retina Lab
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Center-surround computation as a typed interactive module
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Multiple linked views, parameter controls, and deterministic
              computation make this a good example of how the new app handles
              higher-density scientific interaction.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setParams(defaultRetinaParams)}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {retinaParamDefinitions.map((definition) => (
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
                  updateNumericParam(definition.key, Number(event.target.value))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
              Stimulus Type
            </span>
            <select
              value={params.stimulusType}
              onChange={(event) =>
                setParams((current) => ({
                  ...current,
                  stimulusType: event.target.value as RetinaParams["stimulusType"],
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
            >
              {retinaStimulusTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Receptive field
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Difference-of-Gaussians map
            </h2>
            <div className="mt-5">
              <MatrixHeatmap points={result.receptiveField} mode="field" />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Stimulus
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Current light pattern
            </h2>
            <div className="mt-5">
              <MatrixHeatmap points={result.stimulus} mode="stimulus" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Summary
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Response regime
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Net response
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {result.response.toFixed(3)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Preferred spot radius
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-100">
                {preferredSpot.x.toFixed(1)} cells
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Suppression trough
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {strongestSuppression.x.toFixed(1)} cells
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-amber-100">{responseMode}</p>
            <p className="mt-2">
              Larger spots or annuli recruit more inhibitory surround. Edge
              stimuli reveal how strongly the ganglion cell cares about spatial
              contrast rather than raw brightness.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Size tuning
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Spot radius versus response
          </h2>
          <div className="mt-5">
            <CurveChart
              points={result.sizeTuning}
              color="#67d3ff"
              label="spot radius"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Position scan
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Horizontal translation versus response
          </h2>
          <div className="mt-5">
            <CurveChart
              points={result.positionScan}
              color="#ffd58a"
              label="horizontal position"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Interpretation</h2>
          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
            The strongest positive spot response appears near radius{" "}
            <span className="font-semibold text-cyan-100">
              {preferredSpot.x.toFixed(1)}
            </span>
            . If the trace falls as the spot expands, the inhibitory surround is
            taking over the center.
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Model notes</h2>
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
      </section>
    </div>
  );
}
