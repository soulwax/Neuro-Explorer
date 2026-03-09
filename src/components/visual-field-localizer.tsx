"use client";

import { useMemo, useState } from "react";
import { CompareShell } from "~/components/compare-shell";
import { CaseQuestionPanel } from "~/components/case-question-panel";
import { CaseShell } from "~/components/case-shell";
import { RevealPanel } from "~/components/reveal-panel";
import { visualFieldCases } from "~/core/cases/visual-field";
import {
  getVisualFieldPreset,
  visualFieldPresets,
  visualFieldReadingPrinciples,
  type EyeFieldPattern,
  type VisualFieldMaskId,
  type VisualFieldPreset,
} from "~/lib/visual-field";
import { getCurriculumModule } from "~/lib/curriculum";

const VIEWBOX_WIDTH = 420;
const VIEWBOX_HEIGHT = 220;
const EYE_RADIUS = 76;
const LEFT_EYE = { x: 118, y: 108 };
const RIGHT_EYE = { x: 302, y: 108 };
const DEFAULT_PRESET_ID = visualFieldPresets[0]!.id;

function tonePalette(pattern: EyeFieldPattern) {
  if (pattern.tone === "attention") {
    return {
      fill: "rgba(255, 209, 102, 0.26)",
      stroke: "#ffd166",
      dash: "6 5",
    };
  }

  return {
    fill: "rgba(251, 113, 133, 0.24)",
    stroke: "#fb7185",
    dash: undefined,
  };
}

function renderMaskShape(mask: VisualFieldMaskId, pattern: EyeFieldPattern) {
  const { fill, stroke, dash } = tonePalette(pattern);
  const commonProps = {
    fill,
    stroke,
    strokeWidth: 1.6,
    strokeDasharray: dash,
  };

  switch (mask) {
    case "none":
      return null;
    case "full":
      return (
        <rect
          x={-EYE_RADIUS}
          y={-EYE_RADIUS}
          width={EYE_RADIUS * 2}
          height={EYE_RADIUS * 2}
          {...commonProps}
        />
      );
    case "left-half":
      return (
        <rect
          x={-EYE_RADIUS}
          y={-EYE_RADIUS}
          width={EYE_RADIUS}
          height={EYE_RADIUS * 2}
          {...commonProps}
        />
      );
    case "right-half":
      return (
        <rect
          x={0}
          y={-EYE_RADIUS}
          width={EYE_RADIUS}
          height={EYE_RADIUS * 2}
          {...commonProps}
        />
      );
    case "upper-left-quadrant":
      return (
        <rect
          x={-EYE_RADIUS}
          y={-EYE_RADIUS}
          width={EYE_RADIUS}
          height={EYE_RADIUS}
          {...commonProps}
        />
      );
    case "upper-right-quadrant":
      return (
        <rect
          x={0}
          y={-EYE_RADIUS}
          width={EYE_RADIUS}
          height={EYE_RADIUS}
          {...commonProps}
        />
      );
    case "lower-left-quadrant":
      return (
        <rect
          x={-EYE_RADIUS}
          y={0}
          width={EYE_RADIUS}
          height={EYE_RADIUS}
          {...commonProps}
        />
      );
    case "lower-right-quadrant":
      return (
        <rect
          x={0}
          y={0}
          width={EYE_RADIUS}
          height={EYE_RADIUS}
          {...commonProps}
        />
      );
    case "left-half-macular-sparing":
      return (
        <>
          <rect
            x={-EYE_RADIUS}
            y={-EYE_RADIUS}
            width={EYE_RADIUS}
            height={EYE_RADIUS * 2}
            {...commonProps}
          />
          <circle
            cx={0}
            cy={0}
            r={18}
            fill="rgba(13, 20, 36, 0.92)"
            stroke="#67d3ff"
            strokeDasharray="4 4"
          />
        </>
      );
  }
}

function EyeDiagram({
  centerX,
  centerY,
  pattern,
  clipId,
  eyeLabel,
}: Readonly<{
  centerX: number;
  centerY: number;
  pattern: EyeFieldPattern;
  clipId: string;
  eyeLabel: string;
}>) {
  const palette = tonePalette(pattern);

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
      <circle
        cx="0"
        cy="0"
        r="2.8"
        fill="#e2ecf7"
        opacity="0.72"
      />
      <g clipPath={`url(#${clipId})`}>
        {renderMaskShape(pattern.mask, pattern)}
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

function BinocularFieldCard({
  preset,
  title,
  detail,
  idPrefix,
}: Readonly<{
  preset: VisualFieldPreset;
  title: string;
  detail: string;
  idPrefix: string;
}>) {
  const hasAttentionTone =
    preset.leftEye.tone === "attention" || preset.rightEye.tone === "attention";

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="mt-4 w-full rounded-[20px] border border-white/8 bg-[#0b1422]"
      >
        <text
          x={VIEWBOX_WIDTH / 2}
          y="20"
          textAnchor="middle"
          fill="#7b91ad"
          fontSize="10"
        >
          Visual field map
        </text>
        <EyeDiagram
          centerX={LEFT_EYE.x}
          centerY={LEFT_EYE.y}
          pattern={preset.leftEye}
          clipId={`${idPrefix}-left`}
          eyeLabel="Left eye"
        />
        <EyeDiagram
          centerX={RIGHT_EYE.x}
          centerY={RIGHT_EYE.y}
          pattern={preset.rightEye}
          clipId={`${idPrefix}-right`}
          eyeLabel="Right eye"
        />
      </svg>
      <div
        className={`mt-4 rounded-[18px] border px-4 py-3 text-sm leading-7 ${
          hasAttentionTone
            ? "border-amber-300/25 bg-amber-200/8 text-slate-300"
            : "border-rose-300/20 bg-rose-300/10 text-slate-300"
        }`}
      >
        {hasAttentionTone
          ? "This pattern behaves like an attentional hemispace bias rather than a fixed primary sensory cut."
          : "This pattern is rendered as a true field defect in shared visual space."}
      </div>
    </div>
  );
}

export function VisualFieldLocalizer() {
  const visualFieldCurriculum = getCurriculumModule("visual-field");
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>(DEFAULT_PRESET_ID);
  const [comparePresetId, setComparePresetId] = useState<string>(
    visualFieldPresets[0]!.comparePresetId,
  );
  const [caseId, setCaseId] = useState<string>(visualFieldCases[0]!.id);
  const [casePresetId, setCasePresetId] = useState<string>(
    visualFieldCases[0]!.startingPresetId,
  );
  const [revealed, setRevealed] = useState(false);

  const selectedPreset = useMemo(
    () =>
      getVisualFieldPreset(selectedPresetId) ?? getVisualFieldPreset(DEFAULT_PRESET_ID)!,
    [selectedPresetId],
  );
  const comparePreset = useMemo(
    () =>
      getVisualFieldPreset(comparePresetId) ??
      getVisualFieldPreset(selectedPreset.comparePresetId) ??
      selectedPreset,
    [comparePresetId, selectedPreset],
  );
  const activeCase = useMemo(
    () =>
      visualFieldCases.find((item) => item.id === caseId) ?? visualFieldCases[0]!,
    [caseId],
  );
  const casePreset = useMemo(
    () =>
      getVisualFieldPreset(casePresetId) ??
      getVisualFieldPreset(activeCase.startingPresetId)!,
    [casePresetId, activeCase],
  );
  const targetPreset = useMemo(
    () => getVisualFieldPreset(activeCase.expectedPresetId)!,
    [activeCase],
  );
  const followUpTitles = activeCase.followUpModules.map(
    (slug) => getCurriculumModule(slug)?.title ?? slug,
  );
  const caseMatches = casePreset.id === targetPreset.id;

  function applyPresetSelection(presetId: string) {
    const preset = getVisualFieldPreset(presetId);
    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    setComparePresetId(preset.comparePresetId);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Visual Field Localizer
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Localize the lesion before you name the disease
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              This module bridges retina, visual cortex, and neuroanatomy by
              turning field geometry into localization logic. The question is
              not just what the patient cannot see. The question is whether the
              pattern is monocular, chiasmal, retrochiasmal, posterior, or
              attentional.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
            No external AI required
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Lesion presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Read the pattern, then rank the pathway
            </h2>
          </div>
          {visualFieldCurriculum ? (
            <p className="text-sm text-slate-300">
              {visualFieldCurriculum.trainingStage}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {visualFieldPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPresetSelection(preset.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                preset.id === selectedPreset.id
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
              {selectedPreset.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {selectedPreset.syndromeFrame}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Strongest localization
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {selectedPreset.strongestLocalization}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {selectedPreset.whyItFits}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Decisive next data
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {selectedPreset.decisiveNextData.map((item) => (
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
                {selectedPreset.teachingPearls.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <BinocularFieldCard
            preset={selectedPreset}
            title={selectedPreset.lesionSite}
            detail="Each eye is shown separately so monocular, chiasmal, retrochiasmal, and attentional patterns stay visually distinct."
            idPrefix={`preset-${selectedPreset.id}`}
          />
        </div>
      </section>

      <CompareShell
        title="Best fit versus attractive wrong turn"
        leftLabel={`Best fit: ${selectedPreset.title}`}
        rightLabel={`Compare to: ${comparePreset.title}`}
        left={
          <div className="space-y-4">
            <BinocularFieldCard
              preset={selectedPreset}
              title={selectedPreset.strongestLocalization}
              detail={selectedPreset.whyItFits}
              idPrefix={`compare-left-${selectedPreset.id}`}
            />
          </div>
        }
        right={
          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Compare preset
                </span>
                <select
                  value={comparePreset.id}
                  onChange={(event) => setComparePresetId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
                >
                  {visualFieldPresets
                    .filter((preset) => preset.id !== selectedPreset.id)
                    .map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <BinocularFieldCard
              preset={comparePreset}
              title={comparePreset.strongestLocalization}
              detail={comparePreset.whyItFits}
              idPrefix={`compare-right-${comparePreset.id}`}
            />
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-100">
                Why the selected preset beats this alternative
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {selectedPreset.weakerAlternative === comparePreset.strongestLocalization
                  ? selectedPreset.whyAlternativeWeaker
                  : `Compared with ${comparePreset.title}, the selected pattern is stronger because ${selectedPreset.whyItFits.toLowerCase()}`}
              </p>
            </div>
          </div>
        }
      />

      <CaseShell
        eyebrow="Case Mode"
        title="Practice field localization before the reveal"
        summary="Treat these like consult questions. Decide whether the complaint is monocular, chiasmal, retrochiasmal, posterior, or attentional, then pick the best field pattern before you reveal the answer."
        actions={
          <>
            {visualFieldCases.map((item) => (
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
          {visualFieldCurriculum ? (
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Training stage
                </p>
                <p className="mt-3 text-sm font-medium text-white">
                  {visualFieldCurriculum.trainingStage}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Post-clinical objectives
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {visualFieldCurriculum.advancedObjectives.map((objective) => (
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
              Working pattern selection
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {visualFieldPresets.map((preset) => (
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
                title="Your working pattern versus strongest localization"
                leftLabel={`Your pick: ${casePreset.title}`}
                rightLabel={`Target: ${targetPreset.title}`}
                left={
                  <BinocularFieldCard
                    preset={casePreset}
                    title={casePreset.strongestLocalization}
                    detail={casePreset.whyItFits}
                    idPrefix={`case-left-${casePreset.id}`}
                  />
                }
                right={
                  <BinocularFieldCard
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
            Reading rules
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Four rules that prevent most localization errors
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {visualFieldReadingPrinciples.map((item, index) => (
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
            Where to go next
          </h2>
          <div className="mt-5 space-y-3">
            {["retina", "vision", "brain-atlas", "ask"].map((slug) => {
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
