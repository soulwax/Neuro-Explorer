"use client";

import { useMemo, useState } from "react";
import { CaseQuestionPanel } from "~/components/case-question-panel";
import { CaseShell } from "~/components/case-shell";
import { CompareShell } from "~/components/compare-shell";
import { RevealPanel } from "~/components/reveal-panel";
import { retinaCases } from "~/core/cases/retina";
import {
  defaultRetinaParams,
  getRetinaClinicalPreset,
  getRetinaPhysiologyPreset,
  retinaClinicalPresets,
  retinaLocalizationRules,
  retinaParamDefinitions,
  retinaPhysiologyPresets,
  retinaStimulusTypes,
  simulateRetina,
  type CurvePoint,
  type MatrixPoint,
  type RetinaClinicalMaskId,
  type RetinaClinicalPattern,
  type RetinaClinicalPreset,
  type RetinaParams,
} from "~/lib/retina";
import { getCurriculumModule } from "~/lib/curriculum";

const MATRIX_SIZE = 340;
const MATRIX_PADDING = 18;
const CURVE_WIDTH = 360;
const CURVE_HEIGHT = 210;
const CURVE_PADDING = 26;
const FIELD_WIDTH = 420;
const FIELD_HEIGHT = 220;
const EYE_RADIUS = 76;
const LEFT_EYE = { x: 118, y: 108 };
const RIGHT_EYE = { x: 302, y: 108 };
const DEFAULT_PHYSIOLOGY_PRESET_ID = "balanced-on-center";
const DEFAULT_CLINICAL_PRESET_ID = retinaClinicalPresets[0]!.id;

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

function clinicalTonePalette(pattern: RetinaClinicalPattern) {
  switch (pattern.tone) {
    case "retina":
      return {
        fill: "rgba(103, 211, 255, 0.24)",
        stroke: "#67d3ff",
        accent: "#d8f7ff",
        dash: undefined,
      };
    case "disc":
      return {
        fill: "rgba(255, 209, 102, 0.24)",
        stroke: "#ffd166",
        accent: "#fff1c2",
        dash: "5 4",
      };
    case "optic-nerve":
      return {
        fill: "rgba(251, 113, 133, 0.24)",
        stroke: "#fb7185",
        accent: "#ffd4db",
        dash: undefined,
      };
  }
}

function MatrixHeatmap({
  points,
  mode,
}: Readonly<{
  points: MatrixPoint[];
  mode: "field" | "stimulus";
}>) {
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
}: Readonly<{
  points: CurvePoint[];
  color: string;
  label: string;
}>) {
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

function renderClinicalMask(
  mask: RetinaClinicalMaskId,
  pattern: RetinaClinicalPattern,
  eyeSide: "left" | "right",
) {
  const palette = clinicalTonePalette(pattern);
  const blindSpotX = eyeSide === "left" ? -24 : 24;
  const commonProps = {
    fill: palette.fill,
    stroke: palette.stroke,
    strokeWidth: 1.6,
    strokeDasharray: palette.dash,
  };

  switch (mask) {
    case "none":
      return null;
    case "central-scotoma":
      return <circle cx="0" cy="0" r="20" {...commonProps} />;
    case "central-distortion":
      return (
        <>
          <circle
            cx="0"
            cy="0"
            r="23"
            fill="none"
            stroke={palette.stroke}
            strokeWidth="1.8"
            strokeDasharray="5 4"
          />
          <path
            d="M -18 -4 C -10 -12, -4 8, 4 -2 S 16 -14, 18 6"
            fill="none"
            stroke={palette.accent}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M -14 12 C -8 4, 0 18, 10 8"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      );
    case "blind-spot-enlarged":
      return <circle cx={blindSpotX} cy="-8" r="18" {...commonProps} />;
    case "arcuate-loss":
      return eyeSide === "left" ? (
        <path
          d="M -28 -18 C -54 -60, 14 -74, 52 -16 L 52 6 C 18 -18, -10 -12, -28 2 Z"
          {...commonProps}
        />
      ) : (
        <path
          d="M 28 -18 C 54 -60, -14 -74, -52 -16 L -52 6 C -18 -18, 10 -12, 28 2 Z"
          {...commonProps}
        />
      );
    case "superior-curtain":
      return (
        <path
          d={`M ${-EYE_RADIUS} ${-EYE_RADIUS} Q 0 -24 ${EYE_RADIUS} ${-EYE_RADIUS} L ${EYE_RADIUS} -2 Q 16 18 -18 6 L ${-EYE_RADIUS} 10 Z`}
          {...commonProps}
        />
      );
  }
}

function ClinicalEyeDiagram({
  centerX,
  centerY,
  pattern,
  clipId,
  eyeLabel,
  eyeSide,
}: Readonly<{
  centerX: number;
  centerY: number;
  pattern: RetinaClinicalPattern;
  clipId: string;
  eyeLabel: string;
  eyeSide: "left" | "right";
}>) {
  const palette = clinicalTonePalette(pattern);

  return (
    <g transform={`translate(${centerX} ${centerY})`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r={EYE_RADIUS} />
        </clipPath>
      </defs>
      <circle
        cx="0"
        cy="0"
        r={EYE_RADIUS}
        fill="#0d1424"
        stroke="#2a3f60"
        strokeWidth="1.4"
      />
      <line
        x1={-EYE_RADIUS}
        y1="0"
        x2={EYE_RADIUS}
        y2="0"
        stroke="rgba(202,214,229,0.18)"
        strokeDasharray="4 4"
      />
      <line
        x1="0"
        y1={-EYE_RADIUS}
        x2="0"
        y2={EYE_RADIUS}
        stroke="rgba(202,214,229,0.18)"
        strokeDasharray="4 4"
      />
      <circle cx="0" cy="0" r="2.8" fill="#e2ecf7" opacity="0.72" />
      <g clipPath={`url(#${clipId})`}>
        {renderClinicalMask(pattern.mask, pattern, eyeSide)}
      </g>
      <text
        x="0"
        y={EYE_RADIUS + 24}
        textAnchor="middle"
        fill="#d7e2ef"
        fontSize="12"
        fontWeight="600"
      >
        {eyeLabel}
      </text>
      <text
        x="0"
        y={EYE_RADIUS + 40}
        textAnchor="middle"
        fill={palette.stroke}
        fontSize="10"
      >
        {pattern.label}
      </text>
    </g>
  );
}

function RetinaClinicalCard({
  preset,
  title,
  detail,
  idPrefix,
}: Readonly<{
  preset: RetinaClinicalPreset;
  title: string;
  detail: string;
  idPrefix: string;
}>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
      <svg
        viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
        className="mt-4 w-full rounded-[20px] border border-white/8 bg-[#0b1422]"
      >
        <text
          x={FIELD_WIDTH / 2}
          y="20"
          textAnchor="middle"
          fill="#7b91ad"
          fontSize="10"
        >
          Monocular perceptual consequence map
        </text>
        <ClinicalEyeDiagram
          centerX={LEFT_EYE.x}
          centerY={LEFT_EYE.y}
          pattern={preset.leftEye}
          clipId={`${idPrefix}-left`}
          eyeLabel="Left eye"
          eyeSide="left"
        />
        <ClinicalEyeDiagram
          centerX={RIGHT_EYE.x}
          centerY={RIGHT_EYE.y}
          pattern={preset.rightEye}
          clipId={`${idPrefix}-right`}
          eyeLabel="Right eye"
          eyeSide="right"
        />
      </svg>
      <div className="mt-4 grid gap-3">
        <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Strongest localization
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {preset.strongestLocalization}
          </p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Exam clues
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {preset.examClues.map((clue) => (
              <li key={clue}>• {clue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function RetinaExplorer() {
  const retinaCurriculum = getCurriculumModule("retina");
  const [params, setParams] = useState<RetinaParams>(
    getRetinaPhysiologyPreset(DEFAULT_PHYSIOLOGY_PRESET_ID)?.params ??
      defaultRetinaParams,
  );
  const [selectedPhysiologyPresetId, setSelectedPhysiologyPresetId] =
    useState<string>(DEFAULT_PHYSIOLOGY_PRESET_ID);
  const [selectedClinicalPresetId, setSelectedClinicalPresetId] =
    useState<string>(DEFAULT_CLINICAL_PRESET_ID);
  const [compareClinicalPresetId, setCompareClinicalPresetId] = useState<string>(
    retinaClinicalPresets[0]!.comparePresetId,
  );
  const [caseId, setCaseId] = useState<string>(retinaCases[0]!.id);
  const [casePresetId, setCasePresetId] = useState<string>(
    retinaCases[0]!.startingPresetId,
  );
  const [revealed, setRevealed] = useState(false);

  const result = useMemo(() => simulateRetina(params), [params]);
  const selectedPhysiologyPreset = useMemo(
    () =>
      getRetinaPhysiologyPreset(selectedPhysiologyPresetId) ??
      getRetinaPhysiologyPreset(DEFAULT_PHYSIOLOGY_PRESET_ID)!,
    [selectedPhysiologyPresetId],
  );
  const selectedClinicalPreset = useMemo(
    () =>
      getRetinaClinicalPreset(selectedClinicalPresetId) ??
      getRetinaClinicalPreset(DEFAULT_CLINICAL_PRESET_ID)!,
    [selectedClinicalPresetId],
  );
  const compareClinicalPreset = useMemo(
    () =>
      getRetinaClinicalPreset(compareClinicalPresetId) ??
      getRetinaClinicalPreset(selectedClinicalPreset.comparePresetId) ??
      selectedClinicalPreset,
    [compareClinicalPresetId, selectedClinicalPreset],
  );
  const activeCase = useMemo(
    () => retinaCases.find((item) => item.id === caseId) ?? retinaCases[0]!,
    [caseId],
  );
  const casePreset = useMemo(
    () =>
      getRetinaClinicalPreset(casePresetId) ??
      getRetinaClinicalPreset(activeCase.startingPresetId)!,
    [casePresetId, activeCase],
  );
  const targetPreset = useMemo(
    () => getRetinaClinicalPreset(activeCase.expectedPresetId)!,
    [activeCase],
  );
  const caseMatches = casePreset.id === targetPreset.id;
  const followUpTitles = activeCase.followUpModules.map(
    (slug) => getCurriculumModule(slug)?.title ?? slug,
  );

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

  function applyPhysiologyPreset(presetId: string) {
    const preset = getRetinaPhysiologyPreset(presetId);
    if (!preset) {
      return;
    }

    setSelectedPhysiologyPresetId(preset.id);
    setParams(preset.params);
  }

  function applyClinicalPreset(presetId: string) {
    const preset = getRetinaClinicalPreset(presetId);
    if (!preset) {
      return;
    }

    setSelectedClinicalPresetId(preset.id);
    setCompareClinicalPresetId(preset.comparePresetId);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Retina and Prechiasmal Input Lab
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Teach the retina as the start of localization, not just a camera
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              This module now does two jobs at once. It still shows the
              mechanistic center-surround computation, but it also teaches how
              retinal, disc, and optic-nerve patterns create the first split in
              neuro-ophthalmic reasoning before you ever name cortex.
            </p>
          </div>
          {retinaCurriculum ? (
            <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
              {retinaCurriculum.trainingStage}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Physiology presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Use deterministic retinal computation as the first teaching layer
            </h2>
          </div>
          <button
            type="button"
            onClick={() => applyPhysiologyPreset(DEFAULT_PHYSIOLOGY_PRESET_ID)}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Reset physiology preset
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {retinaPhysiologyPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPhysiologyPreset(preset.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                preset.id === selectedPhysiologyPreset.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_320px]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
              Teaching focus
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {selectedPhysiologyPreset.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {selectedPhysiologyPreset.summary}
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Why this preset exists
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {selectedPhysiologyPreset.teachingFocus}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  What to watch
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {selectedPhysiologyPreset.whatToWatch.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Mechanistic summary
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Operating mode
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {result.summary.operatingMode}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Preferred spot radius
                </p>
                <p className="mt-2 text-2xl font-semibold text-cyan-100">
                  {result.summary.preferredSpotRadius.toFixed(1)} cells
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Edge versus annulus
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Edge response {result.summary.edgeResponse.toFixed(3)} and
                  annulus response {result.summary.annulusResponse.toFixed(3)}.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Center versus surround mass
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Center {result.summary.centerMass.toFixed(2)} and surround{" "}
                  {result.summary.surroundMass.toFixed(2)}.
                </p>
              </div>
            </div>
          </div>
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
            Why this matters clinically
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Retinal preprocessing shapes later localization
          </h2>
          <div className="mt-5 rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-300">
            A clean cortical label is weak if you have not first decided whether
            the input is eye-specific, central versus peripheral, or disc-level.
            The retina does not diagnose disease alone, but it tells you where
            the reasoning must begin.
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
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

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Neuro-ophthalmology presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Compare prechiasmal syndromes before you escalate to cortex
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Select the best-fit prechiasmal syndrome, then compare it to the
            attractive wrong turn.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {retinaClinicalPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyClinicalPreset(preset.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                preset.id === selectedClinicalPreset.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
              Syndrome frame
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {selectedClinicalPreset.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {selectedClinicalPreset.syndromeFrame}
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Why it fits
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {selectedClinicalPreset.whyItFits}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Decisive next data
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {selectedClinicalPreset.decisiveNextData.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Teaching pearls
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                {selectedClinicalPreset.teachingPearls.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <RetinaClinicalCard
            preset={selectedClinicalPreset}
            title={selectedClinicalPreset.lesionSite}
            detail="These maps stay eye-specific on purpose. The clinical question is whether the complaint is still retinal, disc, or optic-nerve level before it becomes a shared-space field problem."
            idPrefix={`clinical-${selectedClinicalPreset.id}`}
          />
        </div>
      </section>

      <CompareShell
        title="Best fit versus attractive wrong turn"
        leftLabel={`Best fit: ${selectedClinicalPreset.title}`}
        rightLabel={`Compare to: ${compareClinicalPreset.title}`}
        left={
          <RetinaClinicalCard
            preset={selectedClinicalPreset}
            title={selectedClinicalPreset.strongestLocalization}
            detail={selectedClinicalPreset.whyItFits}
            idPrefix={`compare-left-${selectedClinicalPreset.id}`}
          />
        }
        right={
          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Compare preset
                </span>
                <select
                  value={compareClinicalPreset.id}
                  onChange={(event) =>
                    setCompareClinicalPresetId(event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
                >
                  {retinaClinicalPresets
                    .filter((preset) => preset.id !== selectedClinicalPreset.id)
                    .map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <RetinaClinicalCard
              preset={compareClinicalPreset}
              title={compareClinicalPreset.strongestLocalization}
              detail={compareClinicalPreset.whyItFits}
              idPrefix={`compare-right-${compareClinicalPreset.id}`}
            />
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-100">
                Why the selected preset beats this alternative
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {selectedClinicalPreset.weakerAlternative ===
                compareClinicalPreset.strongestLocalization
                  ? selectedClinicalPreset.whyAlternativeWeaker
                  : `Compared with ${compareClinicalPreset.title}, the selected syndrome is stronger because ${selectedClinicalPreset.whyItFits.toLowerCase()}`}
              </p>
            </div>
          </div>
        }
      />

      <CaseShell
        eyebrow="Case Mode"
        title="Practice retinal and optic-disc triage before the reveal"
        summary="Use these cases like a neuro-ophthalmology intake decision. Decide whether the complaint is retinal, optic-disc, or optic-nerve level before you reveal the best fit."
        actions={
          <>
            {retinaCases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCaseId(item.id);
                  setCasePresetId(item.startingPresetId);
                  setRevealed(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  item.id === activeCase.id
                    ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                    : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.title}
              </button>
            ))}
          </>
        }
      >
        <div className="space-y-5">
          {retinaCurriculum ? (
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Training stage
                </p>
                <p className="mt-3 text-sm font-medium text-white">
                  {retinaCurriculum.trainingStage}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Advanced objectives
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {retinaCurriculum.advancedObjectives.map((objective) => (
                    <li key={objective}>• {objective}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <CaseQuestionPanel
            title={activeCase.title}
            oneLiner={activeCase.oneLiner}
            chiefComplaint={activeCase.chiefComplaint}
            history={activeCase.history}
            syndromeFrame={activeCase.syndromeFrame}
            examFindings={activeCase.examFindings}
            prompt={activeCase.prompt}
            hints={activeCase.hints}
            localizationCues={activeCase.localizationCues}
            differentialTraps={activeCase.differentialTraps}
            nextDataRequests={activeCase.nextDataRequests}
          />

          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Working syndrome selection
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {retinaClinicalPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCasePresetId(preset.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    preset.id === casePreset.id
                      ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                      : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Current pick:{" "}
              <span className="font-semibold text-white">{casePreset.title}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5"
            >
              Reveal localization
            </button>
            <button
              type="button"
              onClick={() => {
                setCasePresetId(activeCase.startingPresetId);
                setRevealed(false);
              }}
              className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Reset selection
            </button>
          </div>

          {revealed ? (
            <>
              <RevealPanel
                correct={caseMatches}
                selectedLabel={casePreset.title}
                targetLabel={targetPreset.title}
                explanation={`${targetPreset.lesionSite}. ${targetPreset.whyItFits}`}
                teachingPoints={activeCase.teachingPoints}
                nextDataRequests={activeCase.nextDataRequests}
                linkedModules={followUpTitles}
              />

              <CompareShell
                title="Your working syndrome versus strongest fit"
                leftLabel={`Your pick: ${casePreset.title}`}
                rightLabel={`Target: ${targetPreset.title}`}
                left={
                  <RetinaClinicalCard
                    preset={casePreset}
                    title={casePreset.strongestLocalization}
                    detail={casePreset.whyItFits}
                    idPrefix={`case-left-${casePreset.id}`}
                  />
                }
                right={
                  <RetinaClinicalCard
                    preset={targetPreset}
                    title={targetPreset.strongestLocalization}
                    detail={targetPreset.whyItFits}
                    idPrefix={`case-right-${targetPreset.id}`}
                  />
                }
              />
            </>
          ) : null}
        </div>
      </CaseShell>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Localization rules
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Five rules that prevent most prechiasmal mistakes
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {retinaLocalizationRules.map((item, index) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                  Rule {index + 1}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Module handoff
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Continue the visual pathway
          </h2>
          <div className="mt-5 space-y-3">
            {["visual-field", "vision", "brain-atlas", "ask"].map((slug) => {
              const module = getCurriculumModule(slug);
              if (!module) {
                return null;
              }

              return (
                <div
                  key={slug}
                  className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {module.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {module.trainingStage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
