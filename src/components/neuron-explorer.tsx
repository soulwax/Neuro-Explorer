"use client";

import { useMemo, useState } from "react";
import {
  defaultNeuronParams,
  neuronParamDefinitions,
  simulateNeuron,
  type NeuronParams,
} from "~/lib/neuron";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 280;
const CHART_PADDING = 36;
const VOLTAGE_MIN = -85;
const VOLTAGE_MAX = 50;

function describeFiringPattern(spikeCount: number, firingRate: number) {
  if (spikeCount === 0) {
    return "Subthreshold";
  }

  if (firingRate < 20) {
    return "Regular spiking";
  }

  if (firingRate < 60) {
    return "Rapid spiking";
  }

  return "High-frequency";
}

function meanInterSpikeInterval(spikeTimes: number[]) {
  if (spikeTimes.length < 2) {
    return null;
  }

  const intervals = spikeTimes
    .slice(1)
    .map((spikeTime, index) => spikeTime - spikeTimes[index]!);
  const mean =
    intervals.reduce((total, value) => total + value, 0) / intervals.length;
  return mean;
}

function chartY(voltage: number) {
  const plotHeight = CHART_HEIGHT - 20;
  const yScale = plotHeight / (VOLTAGE_MAX - VOLTAGE_MIN);
  return CHART_HEIGHT - 10 - (voltage - VOLTAGE_MIN) * yScale;
}

export function NeuronExplorer() {
  const [params, setParams] = useState<NeuronParams>(defaultNeuronParams);
  const result = useMemo(() => simulateNeuron(params), [params]);

  const plotWidth = CHART_WIDTH - CHART_PADDING;
  const xScale = plotWidth / result.params.duration;
  const voltagePath = result.timeSeries
    .map((point, index) => {
      const x = CHART_PADDING + point.t * xScale;
      const y = chartY(point.voltage);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const restingY = chartY(result.params.restingPotential);
  const thresholdY = chartY(result.params.threshold);
  const spikePattern = describeFiringPattern(
    result.spikeTimes.length,
    result.firingRate,
  );
  const meanIsi = meanInterSpikeInterval(result.spikeTimes);

  function updateParam<K extends keyof NeuronParams>(key: K, value: number) {
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
              Neuron Simulation
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Live leaky integrate-and-fire dynamics without the fetch loop
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Deterministic physiology, local computation, and a typed UI state
              model make this the cleanest baseline lab in the app.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setParams(defaultNeuronParams)}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset defaults
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {neuronParamDefinitions.map((definition) => (
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Membrane trace
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Voltage over time
              </h2>
            </div>
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
              {spikePattern}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
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
            <line
              x1={CHART_PADDING}
              y1={restingY}
              x2={CHART_WIDTH}
              y2={restingY}
              stroke="#1e2d4a"
              strokeDasharray="4 4"
            />
            <line
              x1={CHART_PADDING}
              y1={thresholdY}
              x2={CHART_WIDTH}
              y2={thresholdY}
              stroke="#ff7c76"
              strokeDasharray="4 4"
              opacity="0.65"
            />
            {result.spikeTimes.map((spikeTime) => {
              const spikeX = CHART_PADDING + spikeTime * xScale;
              return (
                <line
                  key={spikeTime}
                  x1={spikeX}
                  y1={10}
                  x2={spikeX}
                  y2={CHART_HEIGHT - 10}
                  stroke="#44d39a"
                  opacity="0.18"
                />
              );
            })}
            <path
              d={voltagePath}
              fill="none"
              stroke="#67d3ff"
              strokeWidth="1.5"
            />
            <text
              x={CHART_PADDING + 6}
              y={restingY - 6}
              fill="#7f95ad"
              fontSize="10"
            >
              resting
            </text>
            <text
              x={CHART_PADDING + 6}
              y={thresholdY - 6}
              fill="#ff7c76"
              fontSize="10"
            >
              threshold
            </text>
            <text
              x={CHART_WIDTH / 2}
              y={CHART_HEIGHT}
              textAnchor="middle"
              fill="#7f95ad"
              fontSize="10"
            >
              Time (ms)
            </text>
            <text
              x={14}
              y={CHART_HEIGHT / 2}
              transform={`rotate(-90 14 ${CHART_HEIGHT / 2})`}
              fill="#7f95ad"
              fontSize="10"
            >
              Membrane voltage (mV)
            </text>
          </svg>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Summary
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Firing regime
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Spikes
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {result.spikeTimes.length}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Firing rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-cyan-100">
                {result.firingRate.toFixed(1)} Hz
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Mean ISI
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {meanIsi ? `${meanIsi.toFixed(2)} ms` : "n/a"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-amber-100">What changes fastest</p>
            <p className="mt-2">
              <code>inputCurrent</code>, <code>threshold</code>, and{" "}
              <code>refractoryPeriod</code> dominate the phenotype.{" "}
              <code>tau</code> mostly changes how slowly the membrane ramps into
              that phenotype.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
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
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">
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
                  <p className="mt-2">{value}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
