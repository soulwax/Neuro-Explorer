"use client";

import { useEffect, useState } from "react";
import {
  buildApiUrl,
  describeApiTarget,
  extractApiError,
  type ApiErrorInfo,
} from "~/lib/api";
import {
  defaultEcgParams,
  ecgLeadNames,
  ecgParamDefinitions,
  type ECGParams,
  type ECGResult,
} from "~/lib/ecg";

const LEAD_WIDTH = 320;
const LEAD_HEIGHT = 130;
const LEAD_PAD = 12;
const LEAD_MIN = -2;
const LEAD_MAX = 2;
const ACTIVATION_W = 360;
const ACTIVATION_H = 280;

const heartChambers = [
  {
    key: "atria",
    x: -0.46,
    y: 0.78,
    z: 0.14,
    rx: 28,
    ry: 22,
    color: [79, 195, 247],
    label: "RA/LA",
  },
  {
    key: "septum",
    x: 0.02,
    y: 0.18,
    z: 0.04,
    rx: 18,
    ry: 44,
    color: [255, 209, 102],
    label: "Septum",
  },
  {
    key: "rightVentricle",
    x: -0.34,
    y: -0.26,
    z: 0.34,
    rx: 30,
    ry: 48,
    color: [255, 107, 107],
    label: "RV",
  },
  {
    key: "leftVentricle",
    x: 0.4,
    y: -0.22,
    z: -0.14,
    rx: 34,
    ry: 56,
    color: [0, 230, 118],
    label: "LV",
  },
  {
    key: "repolarization",
    x: 0.12,
    y: -0.58,
    z: -0.08,
    rx: 56,
    ry: 24,
    color: [124, 77, 255],
    label: "T",
  },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEcgResult(payload: unknown): payload is ECGResult {
  return (
    isRecord(payload) &&
    isRecord(payload.leads) &&
    isRecord(payload.summary) &&
    isRecord(payload.activation) &&
    Array.isArray((payload.activation as ECGResult["activation"]).frames)
  );
}

function project3D(
  point: { x: number; y: number; z: number },
  cx: number,
  cy: number,
  scale: number,
) {
  return {
    x: cx + point.x * scale + point.z * scale * 0.42,
    y: cy - point.y * scale - point.z * scale * 0.24,
  };
}

function lerpColor(
  from: readonly number[],
  to: readonly number[],
  amount: number,
) {
  const a = Math.max(0, Math.min(1, amount));
  const r = Math.round(from[0]! + (to[0]! - from[0]!) * a);
  const g = Math.round(from[1]! + (to[1]! - from[1]!) * a);
  const b = Math.round(from[2]! + (to[2]! - from[2]!) * a);
  return `rgb(${r},${g},${b})`;
}

function activationFill(intensity: number, palette: readonly number[]) {
  return lerpColor([19, 26, 43], palette, intensity);
}

function leadPath(
  points: ECGResult["leads"][keyof ECGResult["leads"]],
  durationMs: number,
) {
  const plotWidth = LEAD_WIDTH - LEAD_PAD * 2;
  const plotHeight = LEAD_HEIGHT - 20;
  const xScale = plotWidth / Math.max(durationMs, 1);
  const yScale = plotHeight / (LEAD_MAX - LEAD_MIN);

  return points
    .map((point, index) => {
      const x = LEAD_PAD + point.t * xScale;
      const y = LEAD_HEIGHT - 10 - (point.mv - LEAD_MIN) * yScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function leadGridLines(durationMs: number) {
  const lines: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    tone: "major" | "minor";
  }> = [];
  const xScale = (LEAD_WIDTH - LEAD_PAD * 2) / Math.max(durationMs, 1);

  for (let t = 0; t <= durationMs; t += 200) {
    const x = LEAD_PAD + t * xScale;
    lines.push({
      x1: x,
      y1: 10,
      x2: x,
      y2: LEAD_HEIGHT - 10,
      tone: "major",
    });
  }

  const yScale = (LEAD_HEIGHT - 20) / (LEAD_MAX - LEAD_MIN);
  for (let mv = -1.5; mv <= 1.5; mv += 0.5) {
    const y = LEAD_HEIGHT - 10 - (mv - LEAD_MIN) * yScale;
    lines.push({
      x1: LEAD_PAD,
      y1: y,
      x2: LEAD_WIDTH - LEAD_PAD,
      y2: y,
      tone: "minor",
    });
  }

  return lines;
}

export function ECGExplorer() {
  const [params, setParams] = useState<ECGParams>(defaultEcgParams);
  const [result, setResult] = useState<ECGResult | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  async function loadEcg(nextParams = params) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/ecg", nextParams));
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        setError(
          extractApiError(payload, "The ECG route could not generate a trace."),
        );
        setResult(null);
        return;
      }

      if (!isEcgResult(payload)) {
        setError({
          message: "Unexpected response shape",
          suggestion:
            "The ECG endpoint returned a payload this UI does not understand yet.",
        });
        setResult(null);
        return;
      }

      setResult(payload);
      setFrameIndex(0);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unknown request failure";
      setError({
        message,
        suggestion: "Check the local `/api/ecg` route and try again.",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEcg(defaultEcgParams);
    // Initial bootstrap only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!result?.activation.frames.length) {
      return;
    }

    const intervalMs = Math.max(
      35,
      Math.round(result.activation.beatMs / result.activation.frames.length),
    );

    const timer = window.setInterval(() => {
      setFrameIndex((current) =>
        (current + 1) % Math.max(result.activation.frames.length, 1),
      );
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [result]);

  function updateParam<K extends keyof ECGParams>(key: K, value: number) {
    if (Number.isNaN(value)) {
      return;
    }

    setParams((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const activeFrame = result?.activation.frames[frameIndex] ?? null;
  const activationFrames = result?.activation.frames ?? [];
  const leadAxes = result?.activation.leadAxes ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              12-Lead ECG Explorer
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Typed lead rendering with a shared electrophysiology backend
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              This page keeps the synthetic dipole model server-side and renders
              all twelve leads, the 3D cardiac vector, and the lead-axis
              geometry inside the primary Next.js app.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
            API target: {describeApiTarget()}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ecgParamDefinitions.map((definition) => (
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
            onClick={() => void loadEcg()}
            disabled={isLoading}
            className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating..." : "Generate ECG"}
          </button>
          <button
            type="button"
            onClick={() => {
              setParams(defaultEcgParams);
              void loadEcg(defaultEcgParams);
            }}
            disabled={isLoading}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Reset defaults
          </button>
          {result ? (
            <p className="text-sm text-slate-300">
              Axis: {result.summary.electricalAxis} | QTc:{" "}
              {result.summary.qtcBazettMs.toFixed(1)} ms
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
            3D cardiac activation
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Dipole replay through the beat
          </h2>
          <svg
            viewBox={`0 0 ${ACTIVATION_W} ${ACTIVATION_H}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect
              x="12"
              y="12"
              width="336"
              height="256"
              rx="16"
              fill="#0d1424"
              stroke="#1e2d4a"
            />
            {activationFrames.length ? (
              <>
                <path
                  d={activationFrames
                    .map((frame, index) => {
                      const point = project3D(frame.vector, 182, 146, 42);
                      return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="rgba(79,195,247,0.26)"
                  strokeWidth="1.2"
                />
                <path
                  d="M180 76 C138 34 88 58 88 116 C88 154 118 178 145 200 C162 214 172 228 180 246 C188 228 198 214 215 200 C242 178 272 154 272 116 C272 58 222 34 180 76Z"
                  fill="#141f35"
                  stroke="#233557"
                  strokeWidth="1.2"
                />
                <path
                  d="M198 82 C228 58 258 70 266 104 C272 132 252 162 221 184 C205 195 194 206 186 219 C198 190 204 162 206 130 C207 111 205 96 198 82Z"
                  fill="rgba(255,255,255,0.03)"
                />
                {activeFrame
                  ? heartChambers.map((chamber) => {
                      const projected = project3D(chamber, 182, 146, 84);
                      const intensity = activeFrame.regions[chamber.key];

                      return (
                        <g key={chamber.key}>
                          <ellipse
                            cx={projected.x}
                            cy={projected.y}
                            rx={chamber.rx}
                            ry={chamber.ry}
                            fill={activationFill(intensity, chamber.color)}
                            stroke="rgba(200,214,229,0.18)"
                            strokeWidth="1"
                          />
                          <text
                            x={projected.x}
                            y={projected.y + 4}
                            textAnchor="middle"
                            fill="#c8d6e5"
                            fontSize="10"
                          >
                            {chamber.label}
                          </text>
                        </g>
                      );
                    })
                  : null}
                {activeFrame ? (
                  <>
                    {(() => {
                      const origin = project3D(
                        { x: 0, y: 0, z: 0 },
                        182,
                        146,
                        46.2,
                      );
                      const tip = project3D(activeFrame.vector, 182, 146, 46.2);

                      return (
                        <>
                          <line
                            x1={origin.x}
                            y1={origin.y}
                            x2={tip.x}
                            y2={tip.y}
                            stroke="#ffd166"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx={tip.x} cy={tip.y} r="4.5" fill="#ffd166" />
                        </>
                      );
                    })()}
                    <text x="28" y="28" fill="#6b7f99" fontSize="11">
                      Phase: {activeFrame.phase}
                    </text>
                    <text x="28" y="44" fill="#6b7f99" fontSize="11">
                      Dominant lead: {activeFrame.dominantLead}
                    </text>
                    <text x="28" y="60" fill="#6b7f99" fontSize="11">
                      Vector magnitude: {activeFrame.vector.magnitude.toFixed(3)}
                    </text>
                  </>
                ) : (
                  <text
                    x="180"
                    y="140"
                    textAnchor="middle"
                    fill="#6b7f99"
                    fontSize="12"
                  >
                    Generate ECG to animate a beat
                  </text>
                )}
              </>
            ) : (
              <text
                x="180"
                y="140"
                textAnchor="middle"
                fill="#6b7f99"
                fontSize="12"
              >
                Generate ECG to animate a beat
              </text>
            )}
          </svg>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Lead constellation
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Which lead sees the strongest vector
          </h2>
          <svg
            viewBox={`0 0 ${ACTIVATION_W} ${ACTIVATION_H}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <rect
              x="12"
              y="12"
              width="336"
              height="256"
              rx="16"
              fill="#0d1424"
              stroke="#1e2d4a"
            />
            {activationFrames.length ? (
              <>
                <path
                  d={activationFrames
                    .map((frame, index) => {
                      const point = project3D(frame.vector, 182, 146, 36.12);
                      return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="rgba(0,230,118,0.34)"
                  strokeWidth="1.4"
                />
                {leadAxes.map((axis) => {
                  const point = project3D(axis, 182, 146, 86);
                  const stroke =
                    axis.group === "limb" ? "#4fc3f7" : "#ff8a65";
                  return (
                    <g key={axis.name}>
                      <line
                        x1="182"
                        y1="146"
                        x2={point.x}
                        y2={point.y}
                        stroke={stroke}
                        strokeWidth="1.2"
                        opacity="0.75"
                      />
                      <circle cx={point.x} cy={point.y} r="4" fill={stroke} />
                      <text
                        x={point.x + 7}
                        y={point.y - 5}
                        fill="#c8d6e5"
                        fontSize="10"
                      >
                        {axis.name}
                      </text>
                    </g>
                  );
                })}
                {activeFrame ? (
                  <>
                    {(() => {
                      const tip = project3D(activeFrame.vector, 182, 146, 47.3);

                      return (
                        <>
                          <circle cx="182" cy="146" r="5" fill="#c8d6e5" />
                          <line
                            x1="182"
                            y1="146"
                            x2={tip.x}
                            y2={tip.y}
                            stroke="#ffd166"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx={tip.x} cy={tip.y} r="5" fill="#ffd166" />
                        </>
                      );
                    })()}
                    <text x="24" y="28" fill="#6b7f99" fontSize="11">
                      Limb leads: cyan
                    </text>
                    <text x="24" y="44" fill="#6b7f99" fontSize="11">
                      Chest leads: orange
                    </text>
                    <text x="24" y="60" fill="#6b7f99" fontSize="11">
                      Projection on {activeFrame.dominantLead}:{" "}
                      {activeFrame.dominantProjection.toFixed(3)}
                    </text>
                  </>
                ) : null}
              </>
            ) : (
              <text
                x="180"
                y="140"
                textAnchor="middle"
                fill="#6b7f99"
                fontSize="12"
              >
                Generate ECG to inspect the vector field
              </text>
            )}
          </svg>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Representative beat phase
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Scrub through activation timing
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            {activeFrame
              ? `t=${activeFrame.t.toFixed(1)} ms | ${activeFrame.phase} | strongest view ${activeFrame.dominantLead}`
              : "Generate ECG to animate a representative beat."}
          </p>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(activationFrames.length - 1, 0)}
          step={1}
          value={frameIndex}
          onChange={(event) => setFrameIndex(Number(event.target.value))}
          className="mt-5 w-full accent-cyan-300"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ecgLeadNames.map((leadName) => {
          const points = result?.leads[leadName] ?? [];
          const durationMs = result?.params.duration ?? params.duration;
          const baselineY =
            LEAD_HEIGHT -
            10 -
            ((0 - LEAD_MIN) / (LEAD_MAX - LEAD_MIN)) * (LEAD_HEIGHT - 20);

          return (
            <article
              key={leadName}
              className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur"
            >
              <h3 className="text-lg font-semibold text-white">{leadName}</h3>
              <svg
                viewBox={`0 0 ${LEAD_WIDTH} ${LEAD_HEIGHT}`}
                className="mt-4 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
              >
                {leadGridLines(durationMs).map((line, index) => (
                  <line
                    key={`${leadName}-${index}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={line.tone === "major" ? "#1e2d4a" : "#1a243b"}
                    strokeWidth="0.7"
                  />
                ))}
                <line
                  x1={LEAD_PAD}
                  y1={baselineY}
                  x2={LEAD_WIDTH - LEAD_PAD}
                  y2={baselineY}
                  stroke="#2f4f78"
                  strokeWidth="1"
                />
                {points.length ? (
                  <path
                    d={leadPath(points, durationMs)}
                    fill="none"
                    stroke="#4fc3f7"
                    strokeWidth="1.3"
                  />
                ) : (
                  <text
                    x={LEAD_WIDTH / 2}
                    y={LEAD_HEIGHT / 2}
                    textAnchor="middle"
                    fill="#6b7f99"
                    fontSize="11"
                  >
                    Generate ECG
                  </text>
                )}
              </svg>
            </article>
          );
        })}
      </section>

      {result ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Rhythm summary
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {result.summary.dominantRhythm}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Beats Estimated
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.beatsEstimated}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  RR Interval
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.rrMsNominal.toFixed(0)} ms
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  QTc Bazett
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {result.summary.qtcBazettMs.toFixed(0)} ms
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Frontal Axis
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {result.summary.electricalAxis}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Model notes
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Shared dipole interpretation
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
