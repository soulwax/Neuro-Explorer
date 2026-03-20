"use client";

import { useMemo, useState } from "react";
import {
  defaultSleepParams,
  sleepParamDefinitions,
  sleepPresets,
  simulateSleep,
  type SleepParams,
  type SleepStage,
} from "~/lib/sleep";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 220;
const CHART_PADDING = 60;

const STAGE_COLORS: Record<SleepStage, string> = {
  wake: "#ff7c76",
  REM: "#a78bfa",
  N1: "#67d3ff",
  N2: "#44d39a",
  N3: "#2563eb",
};

const STAGE_Y: Record<SleepStage, number> = {
  wake: 0,
  REM: 1,
  N1: 2,
  N2: 3,
  N3: 4,
};

function hypnogramY(stage: SleepStage): number {
  const plotHeight = CHART_HEIGHT - 40;
  const y = 20 + (STAGE_Y[stage] / 4) * plotHeight;
  return y;
}

export function SleepExplorer() {
  const [params, setParams] = useState<SleepParams>(defaultSleepParams);
  const [activePreset, setActivePreset] = useState("normal-young");
  const [selectedStage, setSelectedStage] = useState<SleepStage | null>(null);

  const result = useMemo(() => simulateSleep(params), [params]);

  const totalMinutes = params.totalTime * 60;
  const plotWidth = CHART_WIDTH - CHART_PADDING - 10;
  const xScale = plotWidth / totalMinutes;

  // Build hypnogram path segments (stepped)
  const hypnogramSegments: {
    x1: number;
    x2: number;
    y: number;
    stage: SleepStage;
  }[] = [];

  if (result.hypnogram.length > 0) {
    let segStart = 0;
    let currentStage = result.hypnogram[0]!.stage;
    for (let i = 1; i < result.hypnogram.length; i++) {
      if (result.hypnogram[i]!.stage !== currentStage) {
        hypnogramSegments.push({
          x1: CHART_PADDING + segStart * xScale,
          x2: CHART_PADDING + i * xScale,
          y: hypnogramY(currentStage),
          stage: currentStage,
        });
        segStart = i;
        currentStage = result.hypnogram[i]!.stage;
      }
    }
    hypnogramSegments.push({
      x1: CHART_PADDING + segStart * xScale,
      x2: CHART_PADDING + result.hypnogram.length * xScale,
      y: hypnogramY(currentStage),
      stage: currentStage,
    });
  }

  // Vertical connecting lines between segments
  const verticalLines: { x: number; y1: number; y2: number }[] = [];
  for (let i = 1; i < hypnogramSegments.length; i++) {
    const prev = hypnogramSegments[i - 1]!;
    const curr = hypnogramSegments[i]!;
    if (prev.y !== curr.y) {
      verticalLines.push({
        x: curr.x1,
        y1: prev.y,
        y2: curr.y,
      });
    }
  }

  function updateParam<K extends keyof SleepParams>(key: K, value: number) {
    if (Number.isNaN(value)) return;
    setParams((current) => ({ ...current, [key]: value }));
    setActivePreset("");
  }

  function applyPreset(presetId: string) {
    const preset = sleepPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setParams({ ...defaultSleepParams, ...preset.params });
    setActivePreset(presetId);
  }

  const currentPresetData = sleepPresets.find((p) => p.id === activePreset);

  // Stage bar chart data
  const stageOrder: SleepStage[] = ["wake", "N1", "N2", "N3", "REM"];
  const maxPct = Math.max(
    5,
    ...stageOrder.map((s) => result.stagePercentages[s]),
  );

  const selectedStageInfo = selectedStage
    ? result.stageInfo.find((si) => si.stage === selectedStage)
    : null;

  return (
    <div className="app-page-stack">
      {/* Header */}
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Sleep Medicine
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Sleep Architecture & Hypnogram
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Generate sleep hypnograms with realistic NREM-REM cycling. Explore
              normal sleep, narcolepsy, OSA, depression, insomnia, and REM
              sleep behavior disorder.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setParams(defaultSleepParams);
              setActivePreset("normal-young");
            }}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
          </button>
        </div>
      </section>

      {/* Presets */}
      <section className="app-surface">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Clinical Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {sleepPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              title={preset.description}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activePreset === preset.id
                  ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                  : "border-white/10 bg-white/6 text-slate-300 hover:bg-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {currentPresetData && (
          <div className="mt-3 rounded-2xl border border-white/6 bg-slate-950/30 p-4">
            <p className="text-sm text-slate-200">
              {currentPresetData.description}
            </p>
            <ul className="mt-2 space-y-1">
              {currentPresetData.clinicalNotes.map((note) => (
                <li key={note} className="text-xs leading-5 text-slate-400">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Parameters */}
      <section className="app-surface">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {sleepParamDefinitions.map((def) => (
            <label key={def.key} className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-400">
                {def.label}
                {def.unit ? ` (${def.unit})` : ""}
              </span>
              <input
                type="number"
                value={params[def.key]}
                min={def.min}
                max={def.max}
                step={def.step}
                onChange={(e) => updateParam(def.key, Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Hypnogram + Summary */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_300px]">
        <div className="app-surface">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Hypnogram
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Sleep stages over time
              </h2>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            {/* Y-axis labels */}
            {stageOrder.map((stage) => (
              <text
                key={stage}
                x={CHART_PADDING - 8}
                y={hypnogramY(stage) + 4}
                textAnchor="end"
                fill={STAGE_COLORS[stage]}
                fontSize="10"
                fontWeight="500"
              >
                {stage}
              </text>
            ))}

            {/* Horizontal grid lines */}
            {stageOrder.map((stage) => (
              <line
                key={`grid-${stage}`}
                x1={CHART_PADDING}
                y1={hypnogramY(stage)}
                x2={CHART_WIDTH - 10}
                y2={hypnogramY(stage)}
                stroke="#1e2d4a"
                strokeDasharray="2 4"
              />
            ))}

            {/* Hypnogram segments */}
            {hypnogramSegments.map((seg, i) => (
              <line
                key={`seg-${i}`}
                x1={seg.x1}
                y1={seg.y}
                x2={seg.x2}
                y2={seg.y}
                stroke={STAGE_COLORS[seg.stage]}
                strokeWidth="2.5"
              />
            ))}

            {/* Vertical transitions */}
            {verticalLines.map((vl, i) => (
              <line
                key={`vl-${i}`}
                x1={vl.x}
                y1={vl.y1}
                x2={vl.x}
                y2={vl.y2}
                stroke="#3b5175"
                strokeWidth="1"
              />
            ))}

            {/* X-axis hours */}
            {Array.from(
              { length: Math.ceil(params.totalTime) + 1 },
              (_, h) => (
                <text
                  key={`h-${h}`}
                  x={CHART_PADDING + (h * 60) * xScale}
                  y={CHART_HEIGHT - 4}
                  textAnchor="middle"
                  fill="#7f95ad"
                  fontSize="9"
                >
                  {h}h
                </text>
              ),
            )}
          </svg>
        </div>

        {/* Summary */}
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Sleep metrics
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Total sleep
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {(result.totalSleepTime / 60).toFixed(1)}h
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Efficiency
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${result.sleepEfficiency >= 0.85 ? "text-green-200" : "text-amber-200"}`}
              >
                {(result.sleepEfficiency * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                REM latency
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  result.remLatency < 30
                    ? "text-red-200"
                    : result.remLatency > 120
                      ? "text-amber-200"
                      : "text-cyan-100"
                }`}
              >
                {result.remLatency > 0 ? `${result.remLatency} min` : "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Cycles
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {result.numberOfCycles}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                WASO
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${result.waso > 30 ? "text-amber-200" : "text-white"}`}
              >
                {result.waso} min
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stage percentages bar chart + Stage info */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="app-surface">
          <h2 className="text-xl font-semibold text-white">
            Stage distribution
          </h2>
          <div className="mt-5 space-y-3">
            {stageOrder.map((stage) => {
              const pct = result.stagePercentages[stage];
              const barWidth = (pct / maxPct) * 100;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() =>
                    setSelectedStage(selectedStage === stage ? null : stage)
                  }
                  className={`block w-full rounded-2xl border p-3 text-left transition ${
                    selectedStage === stage
                      ? "border-cyan-300/30 bg-cyan-300/8"
                      : "border-white/6 bg-slate-950/30 hover:bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className="font-medium"
                      style={{ color: STAGE_COLORS[stage] }}
                    >
                      {stage}
                    </span>
                    <span className="font-mono text-slate-300">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: STAGE_COLORS[stage],
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage EEG info */}
        <div className="app-surface">
          <h2 className="text-xl font-semibold text-white">
            {selectedStageInfo
              ? selectedStageInfo.label
              : "Select a stage for EEG details"}
          </h2>
          {selectedStageInfo ? (
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-semibold text-cyan-100">EEG Pattern</p>
                <p className="mt-1">{selectedStageInfo.eegPattern}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-semibold text-cyan-100">Frequency</p>
                <p className="mt-1">{selectedStageInfo.frequency}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-semibold text-cyan-100">Amplitude</p>
                <p className="mt-1">{selectedStageInfo.amplitude}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-semibold text-cyan-100">Key Features</p>
                <ul className="mt-1 space-y-1">
                  {selectedStageInfo.keyFeatures.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4">
                <p className="font-semibold text-amber-100">
                  Clinical Significance
                </p>
                <p className="mt-1">
                  {selectedStageInfo.clinicalSignificance}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {result.stageInfo.map((si) => (
                <button
                  key={si.stage}
                  type="button"
                  onClick={() => setSelectedStage(si.stage)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-left transition hover:bg-slate-950/50"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: STAGE_COLORS[si.stage] }}
                  />
                  <span className="flex-1 text-sm text-slate-200">
                    {si.label}
                  </span>
                  <span className="text-xs text-slate-500">click</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Educational content */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="app-surface">
          <h2 className="text-xl font-semibold text-white">
            Normal sleep architecture
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {result.explanation.normalArchitecture.map((item) => (
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
          <h2 className="text-xl font-semibold text-white">What to notice</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {result.explanation.whatToNotice.map((item) => (
              <li
                key={item}
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
              >
                {item}
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-xl font-semibold text-white">
            Clinical correlates
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {result.explanation.clinicalCorrelates.map((item) => (
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
