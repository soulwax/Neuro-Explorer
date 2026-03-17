"use client";

import { useMemo, useState } from "react";
import {
  defaultActionPotentialParams,
  actionPotentialParamDefinitions,
  actionPotentialPresets,
  simulateActionPotential,
  type ActionPotentialParams,
} from "~/lib/action-potential";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 280;
const CHART_PADDING = 48;
const VOLTAGE_MIN = -90;
const VOLTAGE_MAX = 60;

function chartY(voltage: number) {
  const plotHeight = CHART_HEIGHT - 20;
  const yScale = plotHeight / (VOLTAGE_MAX - VOLTAGE_MIN);
  return CHART_HEIGHT - 10 - (voltage - VOLTAGE_MIN) * yScale;
}

function currentChartY(current: number, maxCurrent: number) {
  const plotHeight = CHART_HEIGHT - 20;
  if (maxCurrent === 0) return CHART_HEIGHT / 2;
  const yScale = plotHeight / (maxCurrent * 2);
  return CHART_HEIGHT / 2 - current * yScale;
}

function gateChartY(gate: number) {
  const plotHeight = CHART_HEIGHT - 20;
  return CHART_HEIGHT - 10 - gate * plotHeight;
}

type ViewMode = "voltage" | "currents" | "gates" | "conductances";

export function ActionPotentialExplorer() {
  const [params, setParams] =
    useState<ActionPotentialParams>(defaultActionPotentialParams);
  const [viewMode, setViewMode] = useState<ViewMode>("voltage");
  const [activePreset, setActivePreset] = useState<string>("normal-ap");

  const result = useMemo(() => simulateActionPotential(params), [params]);

  const plotWidth = CHART_WIDTH - CHART_PADDING;
  const xScale = plotWidth / result.params.duration;

  // Voltage trace
  const voltagePath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = chartY(p.voltage);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Current traces
  const maxCurrent = Math.max(
    1,
    ...result.timeSeries.map((p) =>
      Math.max(Math.abs(p.iNa), Math.abs(p.iK), Math.abs(p.iL)),
    ),
  );

  const iNaPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = currentChartY(p.iNa, maxCurrent);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const iKPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = currentChartY(p.iK, maxCurrent);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Gate traces
  const mPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = gateChartY(p.m);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const hPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = gateChartY(p.h);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const nPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = gateChartY(p.n);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Conductance traces
  const maxG = Math.max(
    1,
    ...result.timeSeries.map((p) => Math.max(p.gNaEff, p.gKEff)),
  );

  const gNaPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = gateChartY(p.gNaEff / maxG);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const gKPath = result.timeSeries
    .map((p, i) => {
      const x = CHART_PADDING + p.t * xScale;
      const y = gateChartY(p.gKEff / maxG);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  function updateParam<K extends keyof ActionPotentialParams>(
    key: K,
    value: number,
  ) {
    if (Number.isNaN(value)) return;
    setParams((current) => ({ ...current, [key]: value }));
    setActivePreset("");
  }

  function applyPreset(presetId: string) {
    const preset = actionPotentialPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setParams({ ...defaultActionPotentialParams, ...preset.params });
    setActivePreset(presetId);
  }

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: "voltage", label: "Voltage" },
    { id: "currents", label: "Ionic Currents" },
    { id: "gates", label: "Gating Variables" },
    { id: "conductances", label: "Conductances" },
  ];

  const groups = ["stimulus", "conductance", "reversal", "pharmacology"] as const;
  const groupLabels: Record<(typeof groups)[number], string> = {
    stimulus: "Stimulus",
    conductance: "Conductances",
    reversal: "Reversal Potentials",
    pharmacology: "Pharmacology",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Ion Channel Biophysics
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hodgkin-Huxley Action Potential
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              The full ionic model: voltage-gated Na+ and K+ channels with
              gating variables (m, h, n), pharmacological blockade (TTX, TEA),
              and clinical correlates from pufferfish poisoning to
              demyelination.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setParams(defaultActionPotentialParams);
              setActivePreset("normal-ap");
            }}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
          </button>
        </div>
      </section>

      {/* Presets */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {actionPotentialPresets.map((preset) => (
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
      </section>

      {/* Parameters */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        {groups.map((group) => {
          const defs = actionPotentialParamDefinitions.filter(
            (d) => d.group === group,
          );
          if (defs.length === 0) return null;
          return (
            <div key={group} className="mb-4 last:mb-0">
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {groupLabels[group]}
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {defs.map((def) => (
                  <label key={def.key} className="block">
                    <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-400">
                      {def.label}
                      {def.unit ? ` (${def.unit})` : ""}
                    </span>
                    <input
                      type="number"
                      value={
                        def.key === "ttxBlock" || def.key === "teaBlock"
                          ? params[def.key]
                          : params[def.key]
                      }
                      min={def.min}
                      max={def.max}
                      step={def.step}
                      onChange={(e) =>
                        updateParam(def.key, Number(e.target.value))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* View mode selector + Chart */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {viewMode === "voltage"
                  ? "Membrane voltage"
                  : viewMode === "currents"
                    ? "Ionic currents"
                    : viewMode === "gates"
                      ? "Gating variables"
                      : "Effective conductances"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {viewMode === "voltage"
                  ? "Action Potential Waveform"
                  : viewMode === "currents"
                    ? "Na+ and K+ Currents"
                    : viewMode === "gates"
                      ? "m, h, n Gate Dynamics"
                      : "gNa and gK Over Time"}
              </h2>
            </div>
            <div className="flex gap-1">
              {viewModes.map((vm) => (
                <button
                  key={vm.id}
                  type="button"
                  onClick={() => setViewMode(vm.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    viewMode === vm.id
                      ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                      : "border border-white/6 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {vm.label}
                </button>
              ))}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            {/* Axes */}
            <line
              x1={CHART_PADDING}
              y1={10}
              x2={CHART_PADDING}
              y2={CHART_HEIGHT - 10}
              stroke="#1e2d4a"
            />
            <line
              x1={CHART_PADDING}
              y1={CHART_HEIGHT - 10}
              x2={CHART_WIDTH}
              y2={CHART_HEIGHT - 10}
              stroke="#1e2d4a"
            />

            {viewMode === "voltage" && (
              <>
                {/* Resting potential line */}
                <line
                  x1={CHART_PADDING}
                  y1={chartY(-65)}
                  x2={CHART_WIDTH}
                  y2={chartY(-65)}
                  stroke="#1e2d4a"
                  strokeDasharray="4 4"
                />
                <text
                  x={CHART_PADDING + 6}
                  y={chartY(-65) - 6}
                  fill="#7f95ad"
                  fontSize="10"
                >
                  resting (-65 mV)
                </text>
                {/* 0 mV line */}
                <line
                  x1={CHART_PADDING}
                  y1={chartY(0)}
                  x2={CHART_WIDTH}
                  y2={chartY(0)}
                  stroke="#1e2d4a"
                  strokeDasharray="2 4"
                />
                <text
                  x={CHART_PADDING + 6}
                  y={chartY(0) - 4}
                  fill="#4a5f7a"
                  fontSize="9"
                >
                  0 mV
                </text>
                <path
                  d={voltagePath}
                  fill="none"
                  stroke="#67d3ff"
                  strokeWidth="1.8"
                />
              </>
            )}

            {viewMode === "currents" && (
              <>
                {/* Zero line */}
                <line
                  x1={CHART_PADDING}
                  y1={CHART_HEIGHT / 2}
                  x2={CHART_WIDTH}
                  y2={CHART_HEIGHT / 2}
                  stroke="#1e2d4a"
                  strokeDasharray="4 4"
                />
                <path
                  d={iNaPath}
                  fill="none"
                  stroke="#67d3ff"
                  strokeWidth="1.5"
                />
                <path
                  d={iKPath}
                  fill="none"
                  stroke="#ff7c76"
                  strokeWidth="1.5"
                />
                <text
                  x={CHART_WIDTH - 80}
                  y={30}
                  fill="#67d3ff"
                  fontSize="11"
                >
                  I_Na (inward)
                </text>
                <text
                  x={CHART_WIDTH - 80}
                  y={48}
                  fill="#ff7c76"
                  fontSize="11"
                >
                  I_K (outward)
                </text>
              </>
            )}

            {viewMode === "gates" && (
              <>
                {/* 0 and 1 lines */}
                <line
                  x1={CHART_PADDING}
                  y1={gateChartY(0)}
                  x2={CHART_WIDTH}
                  y2={gateChartY(0)}
                  stroke="#1e2d4a"
                  strokeDasharray="4 4"
                />
                <line
                  x1={CHART_PADDING}
                  y1={gateChartY(1)}
                  x2={CHART_WIDTH}
                  y2={gateChartY(1)}
                  stroke="#1e2d4a"
                  strokeDasharray="4 4"
                />
                <text
                  x={CHART_PADDING - 10}
                  y={gateChartY(0) + 4}
                  fill="#4a5f7a"
                  fontSize="9"
                  textAnchor="end"
                >
                  0
                </text>
                <text
                  x={CHART_PADDING - 10}
                  y={gateChartY(1) + 4}
                  fill="#4a5f7a"
                  fontSize="9"
                  textAnchor="end"
                >
                  1
                </text>
                <path
                  d={mPath}
                  fill="none"
                  stroke="#67d3ff"
                  strokeWidth="1.5"
                />
                <path
                  d={hPath}
                  fill="none"
                  stroke="#ffb347"
                  strokeWidth="1.5"
                />
                <path
                  d={nPath}
                  fill="none"
                  stroke="#ff7c76"
                  strokeWidth="1.5"
                />
                <text
                  x={CHART_WIDTH - 60}
                  y={24}
                  fill="#67d3ff"
                  fontSize="11"
                >
                  m (Na+ act.)
                </text>
                <text
                  x={CHART_WIDTH - 60}
                  y={42}
                  fill="#ffb347"
                  fontSize="11"
                >
                  h (Na+ inact.)
                </text>
                <text
                  x={CHART_WIDTH - 60}
                  y={60}
                  fill="#ff7c76"
                  fontSize="11"
                >
                  n (K+ act.)
                </text>
              </>
            )}

            {viewMode === "conductances" && (
              <>
                <line
                  x1={CHART_PADDING}
                  y1={gateChartY(0)}
                  x2={CHART_WIDTH}
                  y2={gateChartY(0)}
                  stroke="#1e2d4a"
                  strokeDasharray="4 4"
                />
                <path
                  d={gNaPath}
                  fill="none"
                  stroke="#67d3ff"
                  strokeWidth="1.5"
                />
                <path
                  d={gKPath}
                  fill="none"
                  stroke="#ff7c76"
                  strokeWidth="1.5"
                />
                <text
                  x={CHART_WIDTH - 80}
                  y={24}
                  fill="#67d3ff"
                  fontSize="11"
                >
                  gNa effective
                </text>
                <text
                  x={CHART_WIDTH - 80}
                  y={42}
                  fill="#ff7c76"
                  fontSize="11"
                >
                  gK effective
                </text>
              </>
            )}

            <text
              x={CHART_WIDTH / 2}
              y={CHART_HEIGHT}
              textAnchor="middle"
              fill="#7f95ad"
              fontSize="10"
            >
              Time (ms)
            </text>
          </svg>
        </div>

        {/* Summary */}
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Summary
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Spike metrics
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Spikes
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {result.spikeCount}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Peak voltage
              </p>
              <p className="mt-2 text-3xl font-semibold text-cyan-100">
                {result.peakVoltage} mV
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Na+ block
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {params.ttxBlock}%
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                K+ block
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {params.teaBlock}%
              </p>
            </div>
          </div>

          {result.explanation.pharmacology.length > 0 && (
            <div className="mt-5 rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-300">
              <p className="font-semibold text-amber-100">Pharmacology</p>
              {result.explanation.pharmacology.map((note) => (
                <p key={note} className="mt-1">
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Phases + Analogies */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">
            Action potential phases
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {result.explanation.phases.map((phase) => (
              <div
                key={phase.name}
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="font-semibold text-cyan-100">{phase.name}</p>
                <p className="mt-1">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">What to notice</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {result.explanation.whatToNotice.map((note) => (
              <li
                key={note}
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
              >
                {note}
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-xl font-semibold text-white">
            Biological analogies
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {Object.entries(result.explanation.biologicalAnalogies).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <p className="font-semibold capitalize text-cyan-100">
                    {key}
                  </p>
                  <p className="mt-1">{value}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
