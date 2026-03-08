"use client";

import { useEffect, useState } from "react";
import {
  buildApiUrl,
  describeApiTarget,
  extractApiError,
  type ApiErrorInfo,
} from "~/lib/api";
import {
  defaultGridCellParams,
  gridCellParamDefinitions,
  type GridCellParams,
  type GridCellResult,
} from "~/lib/grid-cell";

const GRID_W = 340;
const GRID_H = 340;
const GRID_PAD = 20;
const TRACE_W = 760;
const TRACE_H = 180;
const TRACE_PAD = 24;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGridCellResult(payload: unknown): payload is GridCellResult {
  return (
    isRecord(payload) &&
    Array.isArray(payload.path) &&
    Array.isArray(payload.spikes) &&
    Array.isArray(payload.rateMap) &&
    isRecord(payload.summary)
  );
}

function heatColor(value: number, maxValue: number) {
  const normalized =
    maxValue <= 0 ? 0 : Math.max(0, Math.min(1, value / maxValue));
  const hue = 210 - 170 * normalized;
  const saturation = 55 + 35 * normalized;
  const light = 14 + 48 * normalized;
  return `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${light.toFixed(1)}%)`;
}

function pathTrace(points: GridCellResult["path"], arenaSize: number) {
  const scale = (GRID_W - GRID_PAD * 2) / Math.max(arenaSize, 1);

  return points
    .map((point, index) => {
      const x = GRID_PAD + point.x * scale;
      const y = GRID_H - GRID_PAD - point.y * scale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function rateTracePath(points: GridCellResult["path"], durationSec: number) {
  const maxRate = Math.max(1, ...points.map((point) => point.rateHz));
  const xScale = (TRACE_W - TRACE_PAD * 2) / Math.max(durationSec, 1);
  const yScale = (TRACE_H - 26) / maxRate;

  return points
    .map((point, index) => {
      const x = TRACE_PAD + point.t * xScale;
      const y = TRACE_H - 16 - point.rateHz * yScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function GridCellExplorer() {
  const [params, setParams] = useState<GridCellParams>(defaultGridCellParams);
  const [result, setResult] = useState<GridCellResult | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadGridField(nextParams = params) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/grid-cell", nextParams));
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        setError(
          extractApiError(
            payload,
            "The grid-cell route could not generate a navigation field.",
          ),
        );
        setResult(null);
        return;
      }

      if (!isGridCellResult(payload)) {
        setError({
          message: "Unexpected response shape",
          suggestion:
            "The grid-cell endpoint returned a payload this UI does not understand yet.",
        });
        setResult(null);
        return;
      }

      setResult(payload);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unknown request failure";
      setError({
        message,
        suggestion: "Check the local `/api/grid-cell` route and try again.",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGridField(defaultGridCellParams);
    // Initial bootstrap only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateParam<K extends keyof GridCellParams>(key: K, value: number) {
    if (Number.isNaN(value)) {
      return;
    }

    setParams((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const maxMapRate = Math.max(
    0,
    ...(result?.rateMap.flatMap((row) => row) ?? [0]),
  );
  const maxTraceRate = Math.max(
    1,
    ...(result?.path.map((point) => point.rateHz) ?? [1]),
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Grid Cell Navigator
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Typed navigation maps for entorhinal lattice firing
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              The frontend now renders arena trajectories, spikes, rate maps,
              and temporal firing structure directly in the main Next.js app,
              while the deterministic simulator stays behind a shared API route.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
            API target: {describeApiTarget()}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {gridCellParamDefinitions.map((definition) => (
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadGridField()}
            disabled={isLoading}
            className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating..." : "Generate Grid Field"}
          </button>
          <button
            type="button"
            onClick={() => {
              setParams(defaultGridCellParams);
              void loadGridField(defaultGridCellParams);
            }}
            disabled={isLoading}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Reset defaults
          </button>
          {result ? (
            <p className="text-sm text-slate-300">
              {result.path.length} samples | {result.spikes.length} spikes | peak{" "}
              {result.summary.peakRateHz.toFixed(1)} Hz
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="mt-5 rounded-[24px] border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            <p className="font-medium">{error.message}</p>
            {error.suggestion ? (
              <p className="mt-2 text-rose-100/80">{error.suggestion}</p>
            ) : null}
            {error.details ? (
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950/40 p-3 text-xs text-rose-100/85">
                {error.details}
              </pre>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Arena path + spikes
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Navigation through physical space
          </h2>
          <svg
            viewBox={`0 0 ${GRID_W} ${GRID_H}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect
              x={GRID_PAD}
              y={GRID_PAD}
              width={GRID_W - GRID_PAD * 2}
              height={GRID_H - GRID_PAD * 2}
              rx="8"
              fill="#0d1424"
              stroke="#1e2d4a"
            />
            {Array.from({ length: 5 }, (_, index) => {
              const x = GRID_PAD + ((GRID_W - GRID_PAD * 2) / 6) * (index + 1);
              return (
                <g key={index}>
                  <line
                    x1={x}
                    y1={GRID_PAD}
                    x2={x}
                    y2={GRID_H - GRID_PAD}
                    stroke="#18243b"
                    strokeWidth="0.7"
                  />
                  <line
                    x1={GRID_PAD}
                    y1={x}
                    x2={GRID_W - GRID_PAD}
                    y2={x}
                    stroke="#18243b"
                    strokeWidth="0.7"
                  />
                </g>
              );
            })}
            {result ? (
              <>
                <path
                  d={pathTrace(result.path, result.params.arenaSize)}
                  fill="none"
                  stroke="rgba(79,195,247,0.35)"
                  strokeWidth="1.1"
                />
                {result.spikes.map((spike, index) => {
                  const scale =
                    (GRID_W - GRID_PAD * 2) / Math.max(result.params.arenaSize, 1);
                  const x = GRID_PAD + spike.x * scale;
                  const y = GRID_H - GRID_PAD - spike.y * scale;

                  return (
                    <circle
                      key={`${spike.t}-${index}`}
                      cx={x}
                      cy={y}
                      r="2.2"
                      fill="#ffd166"
                      opacity="0.82"
                    />
                  );
                })}
                {result.path.length ? (
                  <>
                    {(() => {
                      const scale =
                        (GRID_W - GRID_PAD * 2) /
                        Math.max(result.params.arenaSize, 1);
                      const start = result.path[0]!;
                      const end = result.path[result.path.length - 1]!;

                      return (
                        <>
                          <circle
                            cx={GRID_PAD + start.x * scale}
                            cy={GRID_H - GRID_PAD - start.y * scale}
                            r="4"
                            fill="#00e676"
                          />
                          <circle
                            cx={GRID_PAD + end.x * scale}
                            cy={GRID_H - GRID_PAD - end.y * scale}
                            r="4"
                            fill="#ff5252"
                          />
                        </>
                      );
                    })()}
                  </>
                ) : null}
              </>
            ) : (
              <text
                x={GRID_W / 2}
                y={GRID_H / 2}
                textAnchor="middle"
                fill="#6b7f99"
                fontSize="12"
              >
                Generate Grid Field
              </text>
            )}
          </svg>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Firing rate map
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Hexagonal lattice occupancy
          </h2>
          <svg
            viewBox={`0 0 ${GRID_W} ${GRID_H}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect
              x={GRID_PAD}
              y={GRID_PAD}
              width={GRID_W - GRID_PAD * 2}
              height={GRID_H - GRID_PAD * 2}
              rx="8"
              fill="#0d1424"
              stroke="#1e2d4a"
            />
            {result ? (
              result.rateMap.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                  const cellW = (GRID_W - GRID_PAD * 2) / Math.max(row.length, 1);
                  const cellH =
                    (GRID_H - GRID_PAD * 2) /
                    Math.max(result.rateMap.length, 1);
                  const fill = value <= 0 ? "#0f1729" : heatColor(value, maxMapRate);

                  return (
                    <rect
                      key={`${rowIndex}-${colIndex}`}
                      x={GRID_PAD + colIndex * cellW}
                      y={GRID_PAD + rowIndex * cellH}
                      width={cellW + 0.4}
                      height={cellH + 0.4}
                      fill={fill}
                    />
                  );
                }),
              )
            ) : (
              <text
                x={GRID_W / 2}
                y={GRID_H / 2}
                textAnchor="middle"
                fill="#6b7f99"
                fontSize="12"
              >
                Generate Grid Field
              </text>
            )}
          </svg>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Instantaneous firing rate
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Theta-modulated rate trace
        </h2>
        <svg
          viewBox={`0 0 ${TRACE_W} ${TRACE_H}`}
          className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
        >
          <line
            x1={TRACE_PAD}
            y1="10"
            x2={TRACE_PAD}
            y2={TRACE_H - 16}
            stroke="#1e2d4a"
          />
          <line
            x1={TRACE_PAD}
            y1={TRACE_H - 16}
            x2={TRACE_W - TRACE_PAD}
            y2={TRACE_H - 16}
            stroke="#1e2d4a"
          />
          {result
            ? Array.from({ length: 9 }, (_, index) => {
                const t = (result.params.durationSec / 8) * index;
                const x =
                  TRACE_PAD +
                  (t / Math.max(result.params.durationSec, 1)) *
                    (TRACE_W - TRACE_PAD * 2);
                return (
                  <line
                    key={index}
                    x1={x}
                    y1="10"
                    x2={x}
                    y2={TRACE_H - 16}
                    stroke="#18243b"
                    strokeWidth="0.7"
                  />
                );
              })
            : null}
          {result ? (
            <>
              <path
                d={rateTracePath(result.path, result.params.durationSec)}
                fill="none"
                stroke="#4fc3f7"
                strokeWidth="1.5"
              />
              <text
                x={TRACE_W - TRACE_PAD}
                y="18"
                textAnchor="end"
                fill="#6b7f99"
                fontSize="10"
              >
                Peak {maxTraceRate.toFixed(1)} Hz
              </text>
            </>
          ) : (
            <text
              x={TRACE_W / 2}
              y={TRACE_H / 2}
              textAnchor="middle"
              fill="#6b7f99"
              fontSize="12"
            >
              Generate Grid Field
            </text>
          )}
        </svg>
      </section>

      {result ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              What you are seeing
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Space tiling summary
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Coverage
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.coveragePct.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Mean Rate
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.meanRateHz.toFixed(2)} Hz
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Spikes
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.spikeCount}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Orientation
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.orientationDeg.toFixed(1)}°
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Model notes
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Why the field looks hexagonal
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {result.explanation.model}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {result.explanation.notes.map((note) => (
                <li
                  key={note}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 px-4 py-3"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
