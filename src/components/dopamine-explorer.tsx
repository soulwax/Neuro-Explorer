"use client";

import { useMemo, useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import {
  defaultDopamineParams,
  dopamineParamDefinitions,
  simulateDopamine,
  type DopamineParams,
  type TracePoint,
} from "~/lib/dopamine";

const ERROR_WIDTH = 760;
const ERROR_HEIGHT = 220;
const ERROR_PAD = 28;
const SMALL_WIDTH = 360;
const SMALL_HEIGHT = 200;
const SMALL_PAD = 24;

function traceColor(index: number) {
  const colors = ["#67d3ff", "#ffd58a", "#44d39a", "#ff7c76"];
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

export function DopamineExplorer() {
  const [params, setParams] = useState<DopamineParams>(defaultDopamineParams);
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

  function updateParam<K extends keyof DopamineParams>(key: K, value: number) {
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
              Dopamine Lab
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Prediction error moves from reward to cue
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              This is still stable-first: deterministic temporal-difference
              learning, local chart rendering, and no dependency on the Worker
              boundary. It is the last major learning-curve module before we
              consider AI-backed pages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setParams(defaultDopamineParams)}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
          </button>
        </div>
      </section>

      <ModuleHandoffBanner />

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_320px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Summary
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Learned prediction
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Final cue response
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-100">
                {result.summary.finalCueResponse.toFixed(3)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Final reward response
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {result.summary.finalRewardResponse.toFixed(3)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Omission dip
              </p>
              <p className="mt-2 text-2xl font-semibold text-rose-100">
                {result.summary.omissionDip.toFixed(3)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-amber-100">
              {result.summary.shiftTrial
                ? `Cue dominance emerges around trial ${result.summary.shiftTrial}`
                : "Cue dominance does not surpass reward response in this run"}
            </p>
            <p className="mt-2">
              The goal is not just to make reward responses large. The system
              learns to predict reward early enough that the cue inherits the
              strongest positive prediction error.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Interpretation</h2>
          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
            {result.explanation.model}
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
