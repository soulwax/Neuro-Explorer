"use client";

import { useMemo, useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { getCurriculumModule } from "~/lib/curriculum";
import {
  defaultNeuronParams,
  neuronParamDefinitions,
  neuronPresets,
  simulateNeuron,
  type NeuronParams,
} from "~/lib/neuron";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 280;
const CHART_PADDING = 36;
const VOLTAGE_MIN = -85;
const VOLTAGE_MAX = 50;
const DETAIL_CHART_WIDTH = 240;
const DETAIL_CHART_HEIGHT = 150;
const DETAIL_CHART_PADDING_X = 28;
const DETAIL_CHART_PADDING_TOP = 16;
const DETAIL_CHART_PADDING_BOTTOM = 22;
const OCCUPANCY_BIN_COUNT = 6;
const CUSTOM_PRESET_ID = "custom";
const DEFAULT_PRESET_ID = neuronPresets[0]!.id;

function chartY(voltage: number) {
  const plotHeight = CHART_HEIGHT - 20;
  const yScale = plotHeight / (VOLTAGE_MAX - VOLTAGE_MIN);
  return CHART_HEIGHT - 10 - (voltage - VOLTAGE_MIN) * yScale;
}

function scaleLinear(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
) {
  if (domainMax === domainMin) {
    return (rangeMin + rangeMax) / 2;
  }

  return (
    rangeMin +
    ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin)
  );
}

function detailChartX(value: number, domainMin: number, domainMax: number) {
  return scaleLinear(
    value,
    domainMin,
    domainMax,
    DETAIL_CHART_PADDING_X,
    DETAIL_CHART_WIDTH - DETAIL_CHART_PADDING_X,
  );
}

function detailChartY(value: number, domainMin: number, domainMax: number) {
  return scaleLinear(
    value,
    domainMin,
    domainMax,
    DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM,
    DETAIL_CHART_PADDING_TOP,
  );
}

function buildLinePath<T>(
  points: T[],
  getX: (point: T) => number,
  getY: (point: T) => number,
) {
  return points
    .map((point, index) => {
      const x = getX(point);
      const y = getY(point);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatSigned(value: number, digits = 2) {
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

function TraceInsetCard({
  eyebrow,
  title,
  summary,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{summary}</p>
    </div>
  );
}

export function NeuronExplorer() {
  const [params, setParams] = useState<NeuronParams>(defaultNeuronParams);
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
  const result = useMemo(() => simulateNeuron(params), [params]);

  const xScale = (CHART_WIDTH - CHART_PADDING) / result.params.duration;
  const voltagePath = result.timeSeries
    .map((point, index) => {
      const x = CHART_PADDING + point.t * xScale;
      const y = chartY(point.voltage);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const restingY = chartY(result.params.restingPotential);
  const thresholdY = chartY(result.params.threshold);
  const meanIsiLabel =
    result.summary.meanIsiMs === null
      ? "n/a"
      : `${result.summary.meanIsiMs.toFixed(1)} ms`;
  const returnMapSeries = result.timeSeries
    .slice(1)
    .map((point, index) => ({
      currentVoltage: result.timeSeries[index]!.voltage,
      nextVoltage: point.voltage,
    }));
  const returnMapPath = buildLinePath(
    returnMapSeries,
    (point) => detailChartX(point.currentVoltage, VOLTAGE_MIN, VOLTAGE_MAX),
    (point) => detailChartY(point.nextVoltage, VOLTAGE_MIN, VOLTAGE_MAX),
  );
  const cumulativeSpikeSeries = (() => {
    let spikeIndex = 0;
    let spikeCount = 0;

    return result.timeSeries.map((point) => {
      while (
        spikeIndex < result.spikeTimes.length &&
        result.spikeTimes[spikeIndex]! <= point.t + Number.EPSILON
      ) {
        spikeCount += 1;
        spikeIndex += 1;
      }

      return { t: point.t, spikeCount };
    });
  })();
  const cumulativeSpikeMax = Math.max(1, result.summary.spikeCount);
  const cumulativeSpikePath = buildLinePath(
    cumulativeSpikeSeries,
    (point) => detailChartX(point.t, 0, result.params.duration),
    (point) => detailChartY(point.spikeCount, 0, cumulativeSpikeMax),
  );
  const occupancyBins = Array.from({ length: OCCUPANCY_BIN_COUNT }, (_, index) => {
    const start =
      VOLTAGE_MIN +
      (index * (VOLTAGE_MAX - VOLTAGE_MIN)) / OCCUPANCY_BIN_COUNT;
    const end =
      VOLTAGE_MIN +
      ((index + 1) * (VOLTAGE_MAX - VOLTAGE_MIN)) / OCCUPANCY_BIN_COUNT;
    const count = result.timeSeries.filter((point) => {
      if (index === OCCUPANCY_BIN_COUNT - 1) {
        return point.voltage >= start && point.voltage <= end;
      }

      return point.voltage >= start && point.voltage < end;
    }).length;

    return {
      start,
      end,
      count,
      label: `${Math.round(start)} to ${Math.round(end)} mV`,
    };
  });
  const occupancyMax = Math.max(
    1,
    ...occupancyBins.map((bin) => bin.count),
  );
  const dominantOccupancy =
    occupancyBins.reduce((best, bin) =>
      bin.count > best.count ? bin : best,
    ) ?? occupancyBins[0]!;
  const returnMapSummary =
    result.summary.spikeCount === 0
      ? "The trace hugs the identity line below threshold, so the membrane is integrating without ever entering a reset loop."
      : result.summary.refractoryLimited
        ? "The low reset loop is prominent, which is exactly what you expect when recovery time becomes the main output bottleneck."
        : "The loop away from the identity line turns threshold crossing and reset into one compact picture of each firing cycle.";
  const cumulativeOutputSummary =
    result.summary.spikeCount === 0
      ? "The flat staircase confirms that this parameter set never recruits output, even though the membrane still ramps upward."
      : result.summary.spikeCount === 1
        ? "A single jump marks first-spike recruitment without enough drive to sustain a repeating train."
        : `Plateaus between steps average ${meanIsiLabel}, so you can see how quickly each spike is recruited into the next one.`;
  const occupancySummary = `Most sampled points live between ${dominantOccupancy.label}, which is the band that actually defines the phenotype more than the brief spike apex does.`;
  const activePreset =
    neuronPresets.find((preset) => preset.id === activePresetId) ?? null;
  const handoffModules = ["action-potential", "plasticity", "ask"]
    .map((slug) => getCurriculumModule(slug))
    .filter(
      (
        module,
      ): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
        module !== undefined,
    );

  function applyPreset(presetId: string) {
    const preset = neuronPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setParams(preset.params);
    setActivePresetId(preset.id);
  }

  function updateParam<K extends keyof NeuronParams>(key: K, value: number) {
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
              Neuron Simulation
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Recruitable membranes, refractory bottlenecks, and firing
              phenotypes
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              The neuron lab now teaches more than a clean membrane trace. It
              frames the LIF model as a way to compare quiet reserve,
              near-threshold recruitment, stable repetitive firing, and
              refractory-limited high drive without pretending this is a full
              conductance-level disease simulator.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setParams(defaultNeuronParams);
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
              Start from an excitability phenotype
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Each preset is a teaching frame for a different recruitment story:
            silent reserve, borderline recruitment, regular spiking, or
            refractory-limited high drive.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {neuronPresets.map((preset) => (
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
              "You are outside the canned presets now. Use the phenotype summary below to see what recruitment story the current parameters are actually telling."}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {activePreset?.clinicalLens ?? result.interpretation.clinicalLens}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            {activePreset?.caution ??
              "Treat this as a recruitment scaffold rather than a full biophysical neuron identity."}
          </p>
        </div>
      </section>

      <section className="app-surface">
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_340px]">
        <div className="app-surface">
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
              {result.summary.firingPattern}
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

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TraceInsetCard
              eyebrow="State map"
              title="Return map"
              summary={returnMapSummary}
            >
              <svg
                viewBox={`0 0 ${DETAIL_CHART_WIDTH} ${DETAIL_CHART_HEIGHT}`}
                className="w-full rounded-[18px] border border-white/8 bg-slate-950/50"
              >
                <line
                  x1={detailChartX(VOLTAGE_MIN, VOLTAGE_MIN, VOLTAGE_MAX)}
                  y1={detailChartY(VOLTAGE_MIN, VOLTAGE_MIN, VOLTAGE_MAX)}
                  x2={detailChartX(VOLTAGE_MAX, VOLTAGE_MIN, VOLTAGE_MAX)}
                  y2={detailChartY(VOLTAGE_MAX, VOLTAGE_MIN, VOLTAGE_MAX)}
                  stroke="#1e2d4a"
                  strokeDasharray="4 4"
                />
                <line
                  x1={detailChartX(result.params.threshold, VOLTAGE_MIN, VOLTAGE_MAX)}
                  y1={DETAIL_CHART_PADDING_TOP}
                  x2={detailChartX(result.params.threshold, VOLTAGE_MIN, VOLTAGE_MAX)}
                  y2={DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM}
                  stroke="#ff7c76"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <line
                  x1={DETAIL_CHART_PADDING_X}
                  y1={detailChartY(result.params.threshold, VOLTAGE_MIN, VOLTAGE_MAX)}
                  x2={DETAIL_CHART_WIDTH - DETAIL_CHART_PADDING_X}
                  y2={detailChartY(result.params.threshold, VOLTAGE_MIN, VOLTAGE_MAX)}
                  stroke="#ff7c76"
                  strokeDasharray="4 4"
                  opacity="0.35"
                />
                <path
                  d={returnMapPath}
                  fill="none"
                  stroke="#67d3ff"
                  strokeWidth="1.5"
                />
                <text
                  x={DETAIL_CHART_WIDTH / 2}
                  y={DETAIL_CHART_HEIGHT - 4}
                  textAnchor="middle"
                  fill="#7f95ad"
                  fontSize="10"
                >
                  Current V (mV)
                </text>
                <text
                  x={12}
                  y={DETAIL_CHART_HEIGHT / 2}
                  transform={`rotate(-90 12 ${DETAIL_CHART_HEIGHT / 2})`}
                  fill="#7f95ad"
                  fontSize="10"
                >
                  Next V (mV)
                </text>
              </svg>
            </TraceInsetCard>

            <TraceInsetCard
              eyebrow="Output timing"
              title="Cumulative spikes"
              summary={cumulativeOutputSummary}
            >
              <svg
                viewBox={`0 0 ${DETAIL_CHART_WIDTH} ${DETAIL_CHART_HEIGHT}`}
                className="w-full rounded-[18px] border border-white/8 bg-slate-950/50"
              >
                <line
                  x1={DETAIL_CHART_PADDING_X}
                  y1={DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM}
                  x2={DETAIL_CHART_WIDTH - DETAIL_CHART_PADDING_X}
                  y2={DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM}
                  stroke="#1e2d4a"
                />
                <line
                  x1={DETAIL_CHART_PADDING_X}
                  y1={DETAIL_CHART_PADDING_TOP}
                  x2={DETAIL_CHART_PADDING_X}
                  y2={DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM}
                  stroke="#1e2d4a"
                />
                <path
                  d={cumulativeSpikePath}
                  fill="none"
                  stroke="#44d39a"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {result.spikeTimes.map((spikeTime, index) => (
                  <circle
                    key={spikeTime}
                    cx={detailChartX(spikeTime, 0, result.params.duration)}
                    cy={detailChartY(index + 1, 0, cumulativeSpikeMax)}
                    r="3"
                    fill="#44d39a"
                  />
                ))}
                <text
                  x={DETAIL_CHART_WIDTH / 2}
                  y={DETAIL_CHART_HEIGHT - 4}
                  textAnchor="middle"
                  fill="#7f95ad"
                  fontSize="10"
                >
                  Time (ms)
                </text>
                <text
                  x={12}
                  y={DETAIL_CHART_HEIGHT / 2}
                  transform={`rotate(-90 12 ${DETAIL_CHART_HEIGHT / 2})`}
                  fill="#7f95ad"
                  fontSize="10"
                >
                  Spike count
                </text>
              </svg>
            </TraceInsetCard>
          </div>

          <div className="mt-4">
            <TraceInsetCard
              eyebrow="Band occupancy"
              title="Where the membrane spends its time"
              summary={occupancySummary}
            >
              <svg
                viewBox={`0 0 ${DETAIL_CHART_WIDTH} ${DETAIL_CHART_HEIGHT}`}
                className="w-full rounded-[18px] border border-white/8 bg-slate-950/50"
              >
                <line
                  x1={DETAIL_CHART_PADDING_X}
                  y1={DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM}
                  x2={DETAIL_CHART_WIDTH - DETAIL_CHART_PADDING_X}
                  y2={DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM}
                  stroke="#1e2d4a"
                />
                {occupancyBins.map((bin, index) => {
                  const barWidth =
                    (DETAIL_CHART_WIDTH - DETAIL_CHART_PADDING_X * 2) /
                    OCCUPANCY_BIN_COUNT -
                    6;
                  const x =
                    DETAIL_CHART_PADDING_X +
                    index *
                      ((DETAIL_CHART_WIDTH - DETAIL_CHART_PADDING_X * 2) /
                        OCCUPANCY_BIN_COUNT) +
                    3;
                  const y = detailChartY(bin.count, 0, occupancyMax);
                  const height =
                    DETAIL_CHART_HEIGHT - DETAIL_CHART_PADDING_BOTTOM - y;
                  const midVoltage = (bin.start + bin.end) / 2;
                  const fill =
                    midVoltage >= result.params.threshold
                      ? "rgba(255,124,118,0.78)"
                      : midVoltage >= result.params.threshold - 10
                        ? "rgba(255,213,138,0.78)"
                        : midVoltage <= result.params.resetPotential + 4
                          ? "rgba(68,211,154,0.72)"
                          : "rgba(103,211,255,0.76)";

                  return (
                    <g key={bin.label}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx="8"
                        fill={fill}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={DETAIL_CHART_HEIGHT - 6}
                        textAnchor="middle"
                        fill="#7f95ad"
                        fontSize="9"
                      >
                        {Math.round(bin.start)}
                      </text>
                    </g>
                  );
                })}
                <text
                  x={DETAIL_CHART_WIDTH / 2}
                  y={DETAIL_CHART_PADDING_TOP - 2}
                  textAnchor="middle"
                  fill="#7f95ad"
                  fontSize="10"
                >
                  Sample count by voltage band
                </text>
              </svg>
            </TraceInsetCard>
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
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {result.summary.excitabilityClass}
            </span>
            {result.summary.refractoryLimited ? (
              <span className="rounded-full border border-amber-300/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                Refractory limited
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {result.interpretation.mechanism}
          </p>

          <div className="mt-5 grid gap-3">
            <SummaryCard
              label="Spikes"
              value={result.summary.spikeCount.toString()}
              accent="text-white"
              detail="Raw output count across the full simulation window."
            />
            <SummaryCard
              label="Firing rate"
              value={`${result.summary.firingRateHz.toFixed(1)} Hz`}
              accent="text-cyan-100"
              detail="A quick read on how strongly the neuron is recruited into repetitive output."
            />
            <SummaryCard
              label="Mean ISI"
              value={meanIsiLabel}
              accent="text-emerald-100"
              detail="Long intervals suggest sparse recruitment; short intervals suggest denser output."
            />
            <SummaryCard
              label="Steady-state V"
              value={`${result.summary.steadyStateVoltage.toFixed(1)} mV`}
              accent="text-sky-100"
              detail="The simple equilibrium estimate for how far drive would depolarize the membrane without spiking."
            />
            <SummaryCard
              label="Threshold slack"
              value={`${formatSigned(result.summary.thresholdSlackMv, 1)} mV`}
              accent="text-amber-100"
              detail="Positive means the drive wants to live above threshold; negative means it still settles below it."
            />
            <SummaryCard
              label="Refractory occupancy"
              value={`${(result.summary.refractoryFraction * 100).toFixed(1)}%`}
              accent="text-rose-100"
              detail="How much of the run is effectively spent in the recovery pause rather than integrating."
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
            What this regime teaches
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {result.interpretation.clinicalLens}
          </p>
        </div>

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Bedside signals
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What learners should notice
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {result.interpretation.bedsideSignals.map((item) => (
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

          <div className="app-surface">
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
              Carry this into channels, learning, and tutoring
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
