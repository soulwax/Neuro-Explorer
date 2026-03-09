"use client";

import { useEffect, useState } from "react";
import { CaseQuestionPanel } from "~/components/case-question-panel";
import { CaseShell } from "~/components/case-shell";
import { CompareShell } from "~/components/compare-shell";
import { RevealPanel } from "~/components/reveal-panel";
import { ecgCases } from "~/core/cases/ecg";
import {
  buildApiUrl,
  describeApiTarget,
  extractApiError,
  type ApiErrorInfo,
} from "~/lib/api";
import {
  defaultEcgParams,
  ecgConsultFrames,
  ecgControlGroups,
  ecgLeadNames,
  ecgParamDefinitions,
  ecgPresets,
  type ECGBeatLandmarks,
  type ECGLeadName,
  type ECGParams,
  type ECGResult,
} from "~/lib/ecg";
import { getCurriculumModule } from "~/lib/curriculum";

const LEAD_WIDTH = 280;
const LEAD_HEIGHT = 118;
const LEAD_PAD_X = 18;
const LEAD_PAD_Y = 14;
const LEAD_MIN = -2.2;
const LEAD_MAX = 2.2;
const RHYTHM_WIDTH = 1180;
const RHYTHM_HEIGHT = 220;
const ACTIVATION_W = 360;
const ACTIVATION_H = 280;
const DEFAULT_PRESET_ID = ecgPresets[0]!.id;
const CUSTOM_PRESET_ID = "custom";
const DEFAULT_CONSULT_FRAME_ID = ecgConsultFrames[0]!.id;

const clinicalLeadRows: readonly (readonly ECGLeadName[])[] = [
  ["I", "aVR", "V1", "V4"],
  ["II", "aVL", "V2", "V5"],
  ["III", "aVF", "V3", "V6"],
];

const definitionByKey = Object.fromEntries(
  ecgParamDefinitions.map((definition) => [definition.key, definition]),
) as Record<(typeof ecgParamDefinitions)[number]["key"], (typeof ecgParamDefinitions)[number]>;

type PaperSpeed = 25 | 50;
type LeadLayout = "clinical" | "stacked";

interface DisplayOptions {
  graphPaper: boolean;
  calibrationPulse: boolean;
  beatAnnotations: boolean;
  vectorTrail: boolean;
  paperSpeed: PaperSpeed;
  leadLayout: LeadLayout;
}

interface PaperLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone: "major" | "minor";
}

const defaultDisplayOptions: DisplayOptions = {
  graphPaper: true,
  calibrationPulse: true,
  beatAnnotations: true,
  vectorTrail: true,
  paperSpeed: 25,
  leadLayout: "clinical",
};

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
    color: [255, 159, 67],
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
    isRecord(payload.beat) &&
    isRecord(payload.neurocardiac) &&
    Array.isArray((payload.activation as ECGResult["activation"]).frames)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function getVisibleDuration(durationMs: number, paperSpeed: PaperSpeed) {
  return Math.min(durationMs, Math.max(1000, Math.round(durationMs * (25 / paperSpeed))));
}

function buildPaperLines(
  width: number,
  height: number,
  durationMs: number,
  paperSpeed: PaperSpeed,
) {
  const lines: PaperLine[] = [];
  const plotWidth = width - LEAD_PAD_X * 2;
  const plotHeight = height - LEAD_PAD_Y * 2;
  const minorTime = paperSpeed === 25 ? 40 : 20;
  const majorTime = paperSpeed === 25 ? 200 : 100;
  const minorMv = 0.1;
  const majorMv = 0.5;
  const xScale = plotWidth / Math.max(durationMs, 1);
  const yScale = plotHeight / (LEAD_MAX - LEAD_MIN);

  for (let t = 0; t <= durationMs; t += minorTime) {
    const x = LEAD_PAD_X + t * xScale;
    lines.push({
      x1: x,
      y1: LEAD_PAD_Y,
      x2: x,
      y2: height - LEAD_PAD_Y,
      tone: t % majorTime === 0 ? "major" : "minor",
    });
  }

  const lowerBound = Math.floor(LEAD_MIN / minorMv) * minorMv;
  for (let mv = lowerBound; mv <= LEAD_MAX; mv += minorMv) {
    const y = height - LEAD_PAD_Y - (mv - LEAD_MIN) * yScale;
    const isMajor = Math.abs(mv / majorMv - Math.round(mv / majorMv)) < 1e-6;
    lines.push({
      x1: LEAD_PAD_X,
      y1: y,
      x2: width - LEAD_PAD_X,
      y2: y,
      tone: isMajor ? "major" : "minor",
    });
  }

  return lines;
}

function mvToY(value: number, height: number) {
  const plotHeight = height - LEAD_PAD_Y * 2;
  const yScale = plotHeight / (LEAD_MAX - LEAD_MIN);
  return height - LEAD_PAD_Y - (value - LEAD_MIN) * yScale;
}

function timeToX(timeMs: number, startMs: number, endMs: number, width: number) {
  const plotWidth = width - LEAD_PAD_X * 2;
  const xScale = plotWidth / Math.max(endMs - startMs, 1);
  return LEAD_PAD_X + (timeMs - startMs) * xScale;
}

function leadPathWindow(
  points: ECGResult["leads"][keyof ECGResult["leads"]],
  startMs: number,
  endMs: number,
  width: number,
  height: number,
) {
  const plotWidth = width - LEAD_PAD_X * 2;
  const plotHeight = height - LEAD_PAD_Y * 2;
  const xScale = plotWidth / Math.max(endMs - startMs, 1);
  const yScale = plotHeight / (LEAD_MAX - LEAD_MIN);
  const visiblePoints = points.filter(
    (point) => point.t >= startMs && point.t <= endMs,
  );

  if (!visiblePoints.length) {
    return "";
  }

  return visiblePoints
    .map((point, index) => {
      const x = LEAD_PAD_X + (point.t - startMs) * xScale;
      const y = height - LEAD_PAD_Y - (point.mv - LEAD_MIN) * yScale;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function calibrationPulsePath(width: number, height: number) {
  const x = LEAD_PAD_X + 8;
  const y = mvToY(1, height);
  const baseY = mvToY(0, height);
  const pulseWidth = Math.min(36, width * 0.12);
  return `M${x} ${baseY} L${x} ${y} L${x + pulseWidth} ${y} L${x + pulseWidth} ${baseY}`;
}

function beatWindows(landmarks: ECGBeatLandmarks) {
  return [
    {
      key: "p",
      label: "P",
      start: landmarks.pOnset,
      end: landmarks.pOffset,
      fill: "rgba(103, 211, 255, 0.13)",
      stroke: "#67d3ff",
    },
    {
      key: "qrs",
      label: "QRS",
      start: landmarks.qrsOnset,
      end: landmarks.qrsOffset,
      fill: "rgba(255, 209, 102, 0.16)",
      stroke: "#ffd166",
    },
    {
      key: "t",
      label: "T",
      start: landmarks.tOnset,
      end: landmarks.tOffset,
      fill: "rgba(255, 159, 67, 0.14)",
      stroke: "#ff9f43",
    },
  ] as const;
}

function NeuroMetricCard({
  label,
  value,
  accent,
  detail,
}: Readonly<{
  label: string;
  value: number;
  accent: string;
  detail: string;
}>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <span className="text-sm font-medium text-white">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accent}`}
          style={{ width: `${Math.max(6, value * 100)}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function AutonomicMap({ result }: Readonly<{ result: ECGResult }>) {
  const vagalStroke = 2 + result.neurocardiac.vagalTone * 7;
  const sympatheticStroke = 2 + result.neurocardiac.sympatheticDrive * 7;
  const respiratoryStroke = 1.5 + result.neurocardiac.respiratoryCoupling * 6;
  const avNodeRadius = 10 + result.neurocardiac.avNodalBrake * 8;

  return (
    <svg
      viewBox="0 0 380 280"
      className="w-full rounded-[24px] border border-white/6 bg-slate-950/45"
    >
      <defs>
        <linearGradient id="vagal-flow" x1="0" x2="1">
          <stop offset="0%" stopColor="#67d3ff" />
          <stop offset="100%" stopColor="#44e0b2" />
        </linearGradient>
        <linearGradient id="symp-flow" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#ff7f50" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="356" height="256" rx="18" fill="#0d1424" stroke="#1f2f49" />

      <rect x="145" y="28" width="90" height="34" rx="12" fill="#14203a" stroke="#29405f" />
      <text x="190" y="50" textAnchor="middle" fill="#d6e1f0" fontSize="12">
        Brainstem
      </text>
      <text x="190" y="66" textAnchor="middle" fill="#7b91ad" fontSize="10">
        NTS / vagal nuclei
      </text>

      <rect x="42" y="76" width="48" height="98" rx="16" fill="#111c31" stroke="#2a3f60" />
      <text x="66" y="105" textAnchor="middle" fill="#d6e1f0" fontSize="11">
        Symp
      </text>
      <text x="66" y="120" textAnchor="middle" fill="#7b91ad" fontSize="10">
        chain
      </text>

      <rect x="290" y="76" width="48" height="98" rx="16" fill="#111c31" stroke="#2a3f60" />
      <text x="314" y="105" textAnchor="middle" fill="#d6e1f0" fontSize="11">
        Symp
      </text>
      <text x="314" y="120" textAnchor="middle" fill="#7b91ad" fontSize="10">
        chain
      </text>

      <path
        d="M190 62 C165 92 146 116 136 154"
        fill="none"
        stroke="url(#vagal-flow)"
        strokeWidth={vagalStroke}
        strokeLinecap="round"
      />
      <path
        d="M190 62 C216 92 236 116 244 154"
        fill="none"
        stroke="url(#vagal-flow)"
        strokeWidth={vagalStroke}
        strokeLinecap="round"
      />
      <path
        d="M66 134 C98 134 120 142 136 156"
        fill="none"
        stroke="url(#symp-flow)"
        strokeWidth={sympatheticStroke}
        strokeLinecap="round"
      />
      <path
        d="M314 134 C282 134 260 142 244 156"
        fill="none"
        stroke="url(#symp-flow)"
        strokeWidth={sympatheticStroke}
        strokeLinecap="round"
      />

      <path
        d="M110 224 C150 202 232 202 270 224"
        fill="none"
        stroke="#67d3ff"
        strokeWidth={respiratoryStroke}
        strokeLinecap="round"
        opacity="0.75"
      />
      <text x="190" y="245" textAnchor="middle" fill="#7b91ad" fontSize="10">
        Respiratory coupling
      </text>

      <path
        d="M190 95 C150 60 98 88 98 146 C98 190 130 208 154 224 C168 234 180 246 190 260 C200 246 212 234 226 224 C250 208 282 190 282 146 C282 88 230 60 190 95Z"
        fill="#141f35"
        stroke="#233557"
        strokeWidth="1.2"
      />
      <circle cx="212" cy="126" r="9" fill="#ffd166" />
      <text x="228" y="130" fill="#d6e1f0" fontSize="11">
        SA
      </text>
      <circle cx="190" cy="164" r={avNodeRadius} fill="#67d3ff" />
      <text x="210" y="168" fill="#d6e1f0" fontSize="11">
        AV
      </text>
      <text x="190" y="34" textAnchor="middle" fill="#6f86a4" fontSize="10">
        Brain-heart axis
      </text>
    </svg>
  );
}

export function ECGExplorer() {
  const ecgCurriculum = getCurriculumModule("ecg");
  const [params, setParams] = useState<ECGParams>(defaultEcgParams);
  const [result, setResult] = useState<ECGResult | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>(DEFAULT_PRESET_ID);
  const [selectedConsultFrameId, setSelectedConsultFrameId] =
    useState<string>(DEFAULT_CONSULT_FRAME_ID);
  const [caseId, setCaseId] = useState<string>(ecgCases[0]!.id);
  const [caseConsultFrameId, setCaseConsultFrameId] = useState<string>(
    ecgCases[0]!.startingConsultFrameId,
  );
  const [revealedCase, setRevealedCase] = useState(false);
  const [display, setDisplay] =
    useState<DisplayOptions>(defaultDisplayOptions);

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

    setSelectedPresetId(CUSTOM_PRESET_ID);
    setParams((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyPreset(presetId: string) {
    const preset = ecgPresets.find((candidate) => candidate.id === presetId);
    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    setParams(preset.params);
    void loadEcg(preset.params);
  }

  function applyConsultFrame(frameId: string) {
    const frame = ecgConsultFrames.find((item) => item.id === frameId);
    if (!frame) {
      return;
    }

    setSelectedConsultFrameId(frame.id);
    applyPreset(frame.linkedPresetId);
  }

  function applyCaseConsultFrame(frameId: string) {
    setCaseConsultFrameId(frameId);
    applyConsultFrame(frameId);
  }

  function selectCase(nextCaseId: string) {
    const nextCase = ecgCases.find((item) => item.id === nextCaseId);
    if (!nextCase) {
      return;
    }

    setCaseId(nextCase.id);
    setRevealedCase(false);
    applyCaseConsultFrame(nextCase.startingConsultFrameId);
  }

  const activeFrame = result?.activation.frames[frameIndex] ?? null;
  const activationFrames = result?.activation.frames ?? [];
  const leadAxes = result?.activation.leadAxes ?? [];
  const paperDuration = getVisibleDuration(
    result?.params.duration ?? params.duration,
    display.paperSpeed,
  );
  const clinicalSegmentDuration = paperDuration / 4;
  const rhythmLead = result?.beat.rhythmStripLead ?? "II";
  const rhythmPoints = result?.leads[rhythmLead] ?? [];
  const rhythmBaseY = mvToY(0, RHYTHM_HEIGHT);
  const presetLabel =
    selectedPresetId === CUSTOM_PRESET_ID
      ? "Custom physiology"
      : ecgPresets.find((preset) => preset.id === selectedPresetId)?.label ??
        "Custom physiology";
  const activeConsultFrame =
    ecgConsultFrames.find((item) => item.id === selectedConsultFrameId) ??
    ecgConsultFrames[0]!;
  const activeCase =
    ecgCases.find((item) => item.id === caseId) ?? ecgCases[0]!;
  const caseConsultFrame =
    ecgConsultFrames.find((item) => item.id === caseConsultFrameId) ??
    ecgConsultFrames[0]!;
  const targetCaseConsultFrame =
    ecgConsultFrames.find((item) => item.id === activeCase.expectedConsultFrameId) ??
    ecgConsultFrames[0]!;
  const caseMatches = caseConsultFrame.id === targetCaseConsultFrame.id;
  const ecgFollowUpTitles = activeCase.followUpModules.map(
    (slug) => getCurriculumModule(slug)?.title ?? slug,
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(103,211,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,209,102,0.12),transparent_26%),rgba(255,255,255,0.05)] p-6 shadow-[0_18px_50px_rgba(3,10,20,0.22)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
              Neurocardiac ECG Lab
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Read the ECG as a brain-heart interface
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              The surface tracing is now framed through autonomic tone,
              respiratory coupling, and AV nodal braking. Instead of only
              tweaking voltages, you can move through realistic vagal and
              sympathetic teaching states, then inspect how those shifts alter
              the ECG paper, rhythm strip, and cardiac vector.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                Active preset
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {presetLabel}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/35 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                API target
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {describeApiTarget()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Autonomic presets
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Shift the tracing through realistic physiological states
              </h2>
            </div>
            <p className="text-sm text-slate-300">
              Choose a preset, then fine-tune the grouped controls below.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ecgPresets.map((preset) => {
              const active = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    active
                      ? "border-cyan-300/35 bg-cyan-300/10"
                      : "border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-slate-950/45"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                    {preset.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {preset.description}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {preset.neuroFocus}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Display toggles
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            ECG-paper realism
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["graphPaper", "Graph paper"],
              ["calibrationPulse", "Calibration pulse"],
              ["beatAnnotations", "Beat annotations"],
              ["vectorTrail", "Vector trail"],
            ].map(([key, label]) => {
              const optionKey = key as Exclude<
                keyof DisplayOptions,
                "paperSpeed" | "leadLayout"
              >;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setDisplay((current) => ({
                      ...current,
                      [optionKey]: !current[optionKey],
                    }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    display[optionKey]
                      ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Paper speed
            </p>
            <div className="mt-3 flex gap-2">
              {[25, 50].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() =>
                    setDisplay((current) => ({
                      ...current,
                      paperSpeed: speed as PaperSpeed,
                    }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    display.paperSpeed === speed
                      ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {speed} mm/s
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Lead layout
            </p>
            <div className="mt-3 flex gap-2">
              {[
                ["clinical", "Clinical sheet"],
                ["stacked", "Stacked leads"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setDisplay((current) => ({
                      ...current,
                      leadLayout: value as LeadLayout,
                    }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    display.leadLayout === value
                      ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-300">
            Faster paper speeds show fewer milliseconds across the same screen
            width, which makes interval inspection feel much closer to bedside
            ECG review.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Consult frames
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Read the strip through neurocardiac scenarios
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              These frames push the lab beyond parameter twiddling. Pick the
              consult scenario, load the aligned physiology, and then decide
              what the strip is really saying versus what it could be mistaken
              for.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {ecgConsultFrames.map((frame) => (
            <button
              key={frame.id}
              type="button"
              onClick={() => applyConsultFrame(frame.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                frame.id === activeConsultFrame.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {frame.title}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
              Syndrome frame
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {activeConsultFrame.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {activeConsultFrame.syndromeFrame}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Highest-yield next data
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
              {activeConsultFrame.nextData.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => applyPreset(activeConsultFrame.linkedPresetId)}
              className="mt-5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/18"
            >
              Load linked preset
            </button>
          </div>
        </div>

        <div className="mt-6">
          <CompareShell
            title="Best mechanism versus attractive misread"
            leftLabel="Best mechanism"
            rightLabel="Weaker alternative"
            left={
              <>
                <p className="font-semibold text-white">
                  {activeConsultFrame.strongestMechanism}
                </p>
                <ul className="mt-3 space-y-2">
                  {activeConsultFrame.teachingPearls.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </>
            }
            right={
              <>
                <p className="font-semibold text-white">
                  {activeConsultFrame.weakerAlternative}
                </p>
                <p className="mt-3">{activeConsultFrame.whyAlternativeWeaker}</p>
              </>
            }
          />
        </div>
      </section>

      <CaseShell
        eyebrow="Case Mode"
        title="Practice neurocardiac consult framing before the reveal"
        summary={
          ecgCurriculum
            ? `${ecgCurriculum.trainingStage}. ${ecgCurriculum.advancedObjectives[0]}`
            : "Choose the best consult frame, reject the tempting misread, and decide which neurological data would most change your mind."
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setRevealedCase((current) => !current)}
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/18"
            >
              {revealedCase ? "Hide reveal" : "Reveal best frame"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRevealedCase(false);
                applyCaseConsultFrame(activeCase.startingConsultFrameId);
              }}
              className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Reset case
            </button>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          {ecgCases.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectCase(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                item.id === activeCase.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
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

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Your consult frame
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ecgConsultFrames.map((frame) => (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => applyCaseConsultFrame(frame.id)}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      frame.id === caseConsultFrame.id
                        ? "bg-cyan-300 text-slate-950"
                        : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {frame.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                Current frame read
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {caseConsultFrame.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {caseConsultFrame.syndromeFrame}
              </p>
              <div className="mt-4 rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Strongest mechanism
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {caseConsultFrame.strongestMechanism}
                </p>
              </div>
              <div className="mt-4 rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Follow-up modules
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ecgFollowUpTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {revealedCase ? (
          <div className="mt-6">
            <RevealPanel
              correct={caseMatches}
              selectedLabel={caseConsultFrame.title}
              targetLabel={targetCaseConsultFrame.title}
              explanation={`${targetCaseConsultFrame.strongestMechanism} ${targetCaseConsultFrame.whyAlternativeWeaker}`}
              teachingPoints={activeCase.teachingPoints}
              nextDataRequests={activeCase.nextDataRequests}
              linkedModules={ecgFollowUpTitles}
            />
          </div>
        ) : null}

        <div className="mt-6">
          <CompareShell
            title="Your frame versus the best-fit frame"
            leftLabel={`Selected: ${caseConsultFrame.title}`}
            rightLabel={`Best fit: ${targetCaseConsultFrame.title}`}
            left={
              <>
                <p className="font-semibold text-white">
                  {caseConsultFrame.strongestMechanism}
                </p>
                <p className="mt-3">{caseConsultFrame.whyAlternativeWeaker}</p>
              </>
            }
            right={
              <>
                <p className="font-semibold text-white">
                  {targetCaseConsultFrame.strongestMechanism}
                </p>
                <ul className="mt-3 space-y-2">
                  {targetCaseConsultFrame.nextData.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </>
            }
          />
        </div>
      </CaseShell>

      <section className="grid gap-4 xl:grid-cols-3">
        {ecgControlGroups.map((group) => (
          <article
            key={group.id}
            className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {group.label}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {group.description}
            </p>
            <div className="mt-5 space-y-4">
              {group.keys.map((key) => {
                const definition = definitionByKey[key];
                return (
                  <label key={key} className="block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-white">
                        {definition.label}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {params[key]}
                        {definition.unit ? ` ${definition.unit}` : ""}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={definition.min}
                      max={definition.max}
                      step={definition.step}
                      value={params[key]}
                      onChange={(event) =>
                        updateParam(key, Number(event.target.value))
                      }
                      className="mt-3 w-full accent-cyan-300"
                    />
                    <input
                      type="number"
                      value={params[key]}
                      min={definition.min}
                      max={definition.max}
                      step={definition.step}
                      onChange={(event) =>
                        updateParam(key, Number(event.target.value))
                      }
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
                    />
                  </label>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
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
              setSelectedPresetId(DEFAULT_PRESET_ID);
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
              {result.neurocardiac.autonomicState} | QTc{" "}
              {result.summary.qtcBazettMs.toFixed(1)} ms | PR{" "}
              {result.beat.intervals.prMs.toFixed(0)} ms
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
                {display.vectorTrail ? (
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
                ) : null}
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
                {display.vectorTrail ? (
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
                ) : null}
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

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Surface ECG
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {display.leadLayout === "clinical"
                ? "Clinical 12-lead sheet"
                : "Stacked lead overview"}
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Showing {paperDuration} ms at {display.paperSpeed} mm/s with a
            10 mm/mV teaching reference.
          </p>
        </div>

        {result ? (
          display.leadLayout === "clinical" ? (
            <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/8 bg-[#120f16] p-4">
              <svg
                viewBox={`0 0 ${LEAD_WIDTH * 4} ${LEAD_HEIGHT * 3}`}
                className="min-w-[980px] w-full"
              >
                {clinicalLeadRows.map((row, rowIndex) =>
                  row.map((lead, colIndex) => {
                    const xOffset = colIndex * LEAD_WIDTH;
                    const yOffset = rowIndex * LEAD_HEIGHT;
                    const startMs = colIndex * clinicalSegmentDuration;
                    const endMs = startMs + clinicalSegmentDuration;
                    const path = leadPathWindow(
                      result.leads[lead],
                      startMs,
                      endMs,
                      LEAD_WIDTH,
                      LEAD_HEIGHT,
                    );
                    const baselineY = mvToY(0, LEAD_HEIGHT);

                    return (
                      <g
                        key={`${lead}-${rowIndex}-${colIndex}`}
                        transform={`translate(${xOffset} ${yOffset})`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width={LEAD_WIDTH}
                          height={LEAD_HEIGHT}
                          fill="#18121c"
                          stroke="rgba(255,255,255,0.06)"
                        />
                        {display.graphPaper
                          ? buildPaperLines(
                              LEAD_WIDTH,
                              LEAD_HEIGHT,
                              clinicalSegmentDuration,
                              display.paperSpeed,
                            ).map((line, lineIndex) => (
                              <line
                                key={`${lead}-grid-${lineIndex}`}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke={
                                  line.tone === "major"
                                    ? "rgba(205, 92, 92, 0.28)"
                                    : "rgba(205, 92, 92, 0.12)"
                                }
                                strokeWidth={line.tone === "major" ? "0.8" : "0.45"}
                              />
                            ))
                          : null}
                        <line
                          x1={LEAD_PAD_X}
                          y1={baselineY}
                          x2={LEAD_WIDTH - LEAD_PAD_X}
                          y2={baselineY}
                          stroke="rgba(160, 80, 80, 0.4)"
                          strokeWidth="0.8"
                        />
                        {display.calibrationPulse && colIndex === 0 ? (
                          <path
                            d={calibrationPulsePath(LEAD_WIDTH, LEAD_HEIGHT)}
                            fill="none"
                            stroke="rgba(255,245,245,0.78)"
                            strokeWidth="1.2"
                          />
                        ) : null}
                        <path
                          d={path}
                          fill="none"
                          stroke="#fff1f2"
                          strokeWidth="1.55"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <text
                          x="18"
                          y="18"
                          fill="#fce7f3"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {lead}
                        </text>
                      </g>
                    );
                  }),
                )}
              </svg>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ecgLeadNames.map((leadName) => {
                const baselineY = mvToY(0, LEAD_HEIGHT);
                const path = leadPathWindow(
                  result.leads[leadName],
                  0,
                  paperDuration,
                  LEAD_WIDTH,
                  LEAD_HEIGHT,
                );

                return (
                  <article
                    key={leadName}
                    className="rounded-[24px] border border-white/10 bg-[#120f16] p-3"
                  >
                    <p className="text-sm font-semibold text-rose-50">
                      {leadName}
                    </p>
                    <svg
                      viewBox={`0 0 ${LEAD_WIDTH} ${LEAD_HEIGHT}`}
                      className="mt-3 w-full rounded-[18px] border border-white/5"
                    >
                      {display.graphPaper
                        ? buildPaperLines(
                            LEAD_WIDTH,
                            LEAD_HEIGHT,
                            paperDuration,
                            display.paperSpeed,
                          ).map((line, lineIndex) => (
                            <line
                              key={`${leadName}-line-${lineIndex}`}
                              x1={line.x1}
                              y1={line.y1}
                              x2={line.x2}
                              y2={line.y2}
                              stroke={
                                line.tone === "major"
                                  ? "rgba(205, 92, 92, 0.28)"
                                  : "rgba(205, 92, 92, 0.12)"
                              }
                              strokeWidth={line.tone === "major" ? "0.8" : "0.45"}
                            />
                          ))
                        : null}
                      <line
                        x1={LEAD_PAD_X}
                        y1={baselineY}
                        x2={LEAD_WIDTH - LEAD_PAD_X}
                        y2={baselineY}
                        stroke="rgba(160, 80, 80, 0.4)"
                        strokeWidth="0.8"
                      />
                      {display.calibrationPulse ? (
                        <path
                          d={calibrationPulsePath(LEAD_WIDTH, LEAD_HEIGHT)}
                          fill="none"
                          stroke="rgba(255,245,245,0.78)"
                          strokeWidth="1.1"
                        />
                      ) : null}
                      <path
                        d={path}
                        fill="none"
                        stroke="#fff1f2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </article>
                );
              })}
            </div>
          )
        ) : null}

        {result ? (
          <div className="mt-6 rounded-[24px] border border-white/8 bg-[#120f16] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-rose-100/70">
                  Rhythm strip
                </p>
                <h3 className="mt-1 text-lg font-semibold text-rose-50">
                  Lead {rhythmLead} with interval landmarks
                </h3>
              </div>
              <p className="text-sm text-rose-100/75">
                PR {result.beat.intervals.prMs.toFixed(0)} ms | QRS{" "}
                {result.beat.intervals.qrsMs.toFixed(0)} ms | QT{" "}
                {result.beat.intervals.qtMs.toFixed(0)} ms
              </p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <svg
                viewBox={`0 0 ${RHYTHM_WIDTH} ${RHYTHM_HEIGHT}`}
                className="min-w-[980px] w-full rounded-[20px] border border-white/5"
              >
                {display.graphPaper
                  ? buildPaperLines(
                      RHYTHM_WIDTH,
                      RHYTHM_HEIGHT,
                      paperDuration,
                      display.paperSpeed,
                    ).map((line, index) => (
                      <line
                        key={`rhythm-grid-${index}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={
                          line.tone === "major"
                            ? "rgba(205, 92, 92, 0.28)"
                            : "rgba(205, 92, 92, 0.12)"
                        }
                        strokeWidth={line.tone === "major" ? "0.8" : "0.45"}
                      />
                    ))
                  : null}
                <line
                  x1={LEAD_PAD_X}
                  y1={rhythmBaseY}
                  x2={RHYTHM_WIDTH - LEAD_PAD_X}
                  y2={rhythmBaseY}
                  stroke="rgba(160, 80, 80, 0.4)"
                  strokeWidth="0.8"
                />
                {display.beatAnnotations
                  ? beatWindows(result.beat.landmarks).map((window) => {
                      const x = timeToX(window.start, 0, paperDuration, RHYTHM_WIDTH);
                      const width =
                        timeToX(window.end, 0, paperDuration, RHYTHM_WIDTH) - x;
                      return (
                        <g key={window.key}>
                          <rect
                            x={x}
                            y={18}
                            width={width}
                            height={RHYTHM_HEIGHT - 36}
                            fill={window.fill}
                            stroke={window.stroke}
                            strokeDasharray="5 4"
                          />
                          <text
                            x={x + width / 2}
                            y="34"
                            textAnchor="middle"
                            fill={window.stroke}
                            fontSize="11"
                            fontWeight="600"
                          >
                            {window.label}
                          </text>
                        </g>
                      );
                    })
                  : null}
                {display.calibrationPulse ? (
                  <path
                    d={calibrationPulsePath(RHYTHM_WIDTH, RHYTHM_HEIGHT)}
                    fill="none"
                    stroke="rgba(255,245,245,0.78)"
                    strokeWidth="1.2"
                  />
                ) : null}
                <path
                  d={leadPathWindow(
                    rhythmPoints,
                    0,
                    paperDuration,
                    RHYTHM_WIDTH,
                    RHYTHM_HEIGHT,
                  )}
                  fill="none"
                  stroke="#fff1f2"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ) : null}
      </section>

      {result ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Neurological perspective
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {result.neurocardiac.autonomicState}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {result.neurocardiac.narrative}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <NeuroMetricCard
                  label="Vagal tone"
                  value={result.neurocardiac.vagalTone}
                  accent="from-cyan-300 to-emerald-300"
                  detail="Higher values emphasize medullary vagal braking of SA and AV nodal tissue."
                />
                <NeuroMetricCard
                  label="Sympathetic drive"
                  value={result.neurocardiac.sympatheticDrive}
                  accent="from-amber-300 to-rose-300"
                  detail="Higher values emphasize catecholaminergic acceleration and a more metronomic strip."
                />
                <NeuroMetricCard
                  label="Respiratory coupling"
                  value={result.neurocardiac.respiratoryCoupling}
                  accent="from-sky-300 to-cyan-200"
                  detail="Models how strongly breathing-linked variability is allowed to surface."
                />
                <NeuroMetricCard
                  label="AV nodal brake"
                  value={result.neurocardiac.avNodalBrake}
                  accent="from-emerald-300 to-cyan-300"
                  detail="A teaching estimate of how much vagal influence is appearing as PR delay."
                />
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                      Neurocritical context
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        result.neurocardiac.hemodynamicRisk === "high"
                          ? "bg-rose-300/18 text-rose-100"
                          : result.neurocardiac.hemodynamicRisk === "moderate"
                            ? "bg-amber-300/18 text-amber-100"
                            : "bg-emerald-300/18 text-emerald-100"
                      }`}
                    >
                      {result.neurocardiac.hemodynamicRisk} hemodynamic risk
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {result.neurocardiac.neurocriticalContext}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">
                        Monitoring priorities
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                        {result.neurocardiac.monitoringPriorities.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-rose-100">
                        Red flags
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                        {result.neurocardiac.redFlags.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                    Consult pearls
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                    {result.neurocardiac.consultPearls.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-100">
                    Mimics to avoid
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                    {result.neurocardiac.mimicsToAvoid.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">
                    Next data
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                    {result.neurocardiac.nextData.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
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
                {[...result.neurocardiac.notes, ...result.explanation.notes].map((note) => (
                  <li
                    key={note}
                    className="rounded-3xl border border-white/10 bg-slate-950/35 px-4 py-3"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Brain-heart map
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Autonomic pathways shaping the strip
              </h2>
              <div className="mt-5">
                <AutonomicMap result={result} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This graphic encodes the teaching relationship between medullary
                vagal output, sympathetic recruitment, respiratory coupling, and
                nodal behavior. It is a physiology map, not literal tractography.
              </p>
            </div>

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
          </div>
        </section>
      ) : null}
    </div>
  );
}
