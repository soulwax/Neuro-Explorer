"use client";

import { useMemo, useState } from "react";
import { CompareShell } from "~/components/compare-shell";
import { CaseQuestionPanel } from "~/components/case-question-panel";
import { CaseProgressPanel } from "~/components/case-progress-panel";
import { CaseShell } from "~/components/case-shell";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { RevealPanel } from "~/components/reveal-panel";
import { headacheCases } from "~/core/cases/headache";
import { buildCaseHandoffLinks } from "~/lib/case-handoff";
import { useCaseProgress } from "~/lib/case-progress";
import {
  getHeadachePreset,
  headachePresets,
  redFlagTier,
  type HeadachePreset,
} from "~/lib/headache";
import { getCurriculumModule } from "~/lib/curriculum";

const DEFAULT_PRESET_ID = headachePresets[0]!.id;

const TIER_TONE: Record<"low" | "moderate" | "high", string> = {
  low: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  moderate: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  high: "border-rose-300/20 bg-rose-300/10 text-rose-100",
};

const BAR_TONE: Record<"low" | "moderate" | "high", string> = {
  low: "bg-gradient-to-r from-emerald-300 to-cyan-300",
  moderate: "bg-gradient-to-r from-amber-300 to-orange-300",
  high: "bg-gradient-to-r from-rose-300 to-red-400",
};

function nextPresetId(currentId: string) {
  const index = headachePresets.findIndex((preset) => preset.id === currentId);
  const nextIndex = (index + 1) % headachePresets.length;
  return headachePresets[nextIndex]!.id;
}

function MetricBar({
  label,
  value,
  tone,
}: Readonly<{ label: string; value: number; tone: string }>) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>
        <span className="text-sm font-semibold text-white">
          {Math.round(value)}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function PresetMetricPanel({ preset }: Readonly<{ preset: HeadachePreset }>) {
  const tier = redFlagTier(preset.redFlagScore);
  const barTone = BAR_TONE[tier];

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Red flag score
        </p>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${TIER_TONE[tier]}`}
        >
          {tier}
        </span>
      </div>
      <div className="mt-3 space-y-4">
        <MetricBar label="Red flag score" value={preset.redFlagScore} tone={barTone} />
        <MetricBar label="Intensity" value={preset.intensity} tone={barTone} />
        <MetricBar label="Photophobia" value={preset.photophobia} tone={barTone} />
        <MetricBar label="Phonophobia" value={preset.phonophobia} tone={barTone} />
        <MetricBar
          label="Autonomic features"
          value={preset.autonomicFeatures}
          tone={barTone}
        />
        <MetricBar label="Nausea" value={preset.nauseaSeverity} tone={barTone} />
      </div>
      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/6 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Typical duration
        </p>
        <p className="mt-1 text-sm font-medium text-white">
          {preset.durationLabel}
        </p>
      </div>
    </div>
  );
}

export function HeadacheExplorer() {
  const headacheCurriculum = getCurriculumModule("headache");
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>(DEFAULT_PRESET_ID);
  const [comparePresetId, setComparePresetId] = useState<string>(
    nextPresetId(DEFAULT_PRESET_ID),
  );
  const [caseId, setCaseId] = useState<string>(headacheCases[0]!.id);
  const [casePresetId, setCasePresetId] = useState<string>(
    headacheCases[0]!.startingPresetId,
  );
  const [revealed, setRevealed] = useState(false);
  const {
    summary: caseProgressSummary,
    recordAttempt,
    resetProgress,
  } = useCaseProgress("headache", headacheCases.length);

  const selectedPreset = useMemo(
    () => getHeadachePreset(selectedPresetId) ?? getHeadachePreset(DEFAULT_PRESET_ID)!,
    [selectedPresetId],
  );
  const comparePreset = useMemo(
    () =>
      getHeadachePreset(comparePresetId) ??
      getHeadachePreset(nextPresetId(selectedPreset.id))!,
    [comparePresetId, selectedPreset],
  );
  const activeCase = useMemo(
    () => headacheCases.find((item) => item.id === caseId) ?? headacheCases[0]!,
    [caseId],
  );
  const casePreset = useMemo(
    () =>
      getHeadachePreset(casePresetId) ??
      getHeadachePreset(activeCase.startingPresetId)!,
    [casePresetId, activeCase],
  );
  const targetPreset = useMemo(
    () => getHeadachePreset(activeCase.expectedPresetId)!,
    [activeCase],
  );
  const followUpLinks = buildCaseHandoffLinks(activeCase.followUpModules, {
    fromSlug: "headache",
    fromTitle: headacheCurriculum?.title ?? "Headache & Migraine Localizer",
    caseId: activeCase.id,
    caseTitle: activeCase.title,
    prompt: activeCase.prompt,
    selectedLabel: casePreset.label,
    targetLabel: targetPreset.label,
  });
  const caseMatches = casePreset.id === targetPreset.id;

  function applyPresetSelection(presetId: string) {
    const preset = getHeadachePreset(presetId);
    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    setComparePresetId(nextPresetId(preset.id));
  }

  function revealCase() {
    recordAttempt({
      caseId: activeCase.id,
      caseTitle: activeCase.title,
      correct: caseMatches,
      selectedLabel: casePreset.label,
      targetLabel: targetPreset.label,
    });
    setRevealed(true);
  }

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Headache & Migraine Localizer
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Read the pattern before you name the headache
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
              Headache is the highest-volume complaint in neurology. The
              question is never just how bad the pain is - it is whether the
              timing, quality, and associated features point toward a primary
              headache disorder or toward a red flag that changes everything.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
            No external AI required
          </div>
        </div>
      </section>

      <ModuleHandoffBanner />

      <section className="app-surface">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Headache presets
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Read the history, then rank the differential
            </h2>
          </div>
          {headacheCurriculum ? (
            <p className="text-sm text-slate-300">
              {headacheCurriculum.trainingStage}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {headachePresets.map((preset) => (
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
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
              Syndrome frame
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {selectedPreset.label}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-cyan-100">
              {selectedPreset.frame}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {selectedPreset.summary}
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
                  {selectedPreset.dominantClue}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  History discriminators
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {selectedPreset.historyDiscriminators.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Mechanism
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {selectedPreset.mechanism}
              </p>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Bedside tasks
              </p>
              <div className="mt-3 space-y-3">
                {selectedPreset.bedsideTasks.map((task) => (
                  <div
                    key={task.label}
                    className="rounded-2xl border border-white/8 bg-slate-950/30 p-3"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                      {task.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {task.finding}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {task.implication}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border border-cyan-300/15 bg-cyan-300/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                Teaching pearl
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                {selectedPreset.teachingPearl}
              </p>
            </div>
          </div>

          <PresetMetricPanel preset={selectedPreset} />
        </div>
      </section>

      <CompareShell
        title="Best fit versus attractive wrong turn"
        leftLabel={`Best fit: ${selectedPreset.label}`}
        rightLabel={`Compare to: ${comparePreset.label}`}
        left={
          <div className="space-y-4">
            <PresetMetricPanel preset={selectedPreset} />
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
                  {headachePresets
                    .filter((preset) => preset.id !== selectedPreset.id)
                    .map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <PresetMetricPanel preset={comparePreset} />
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-100">
                Why the selected preset beats this alternative
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {selectedPreset.weakerAlternative}
              </p>
            </div>
          </div>
        }
      />

      <CaseShell
        eyebrow="Case Mode"
        title="Practice headache localization before the reveal"
        summary="Treat these like consult questions. Decide whether the history points toward migraine with or without aura, tension-type, cluster, or a secondary red flag before you reveal the answer."
        actions={
          <>
            {headacheCases.map((item) => (
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
          <CaseProgressPanel
            summary={caseProgressSummary}
            onReset={resetProgress}
          />

          {headacheCurriculum ? (
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Training stage
                </p>
                <p className="mt-3 text-sm font-medium text-white">
                  {headacheCurriculum.trainingStage}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Advanced objectives
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {headacheCurriculum.advancedObjectives.map((objective) => (
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
              {headachePresets.map((preset) => (
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
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Current pick:{" "}
              <span className="font-semibold text-white">{casePreset.label}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={revealCase}
              className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5"
            >
              Reveal diagnosis
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
                selectedLabel={casePreset.label}
                targetLabel={targetPreset.label}
                explanation={`${targetPreset.strongestLocalization}. ${targetPreset.dominantClue}`}
                teachingPoints={activeCase.teachingPoints}
                nextDataRequests={activeCase.nextDataRequests}
                followUpLinks={followUpLinks}
              />

              <CompareShell
                title="Your working pattern versus strongest localization"
                leftLabel={`Your pick: ${casePreset.label}`}
                rightLabel={`Target: ${targetPreset.label}`}
                left={<PresetMetricPanel preset={casePreset} />}
                right={<PresetMetricPanel preset={targetPreset} />}
              />
            </>
          ) : null}
        </div>
      </CaseShell>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Reading rules
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Four rules that prevent most headache localization errors
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Time-to-maximal-intensity separates thunderclap headache from every primary headache disorder - seconds to a minute is the threshold that matters, not pain severity alone.",
              "Unilateral throbbing plus activity worsening plus nausea or photophobia/phonophobia is migraine; bilateral pressing without those features is tension-type.",
              "Ipsilateral autonomic signs plus restlessness during a brief, severe, strictly unilateral attack is cluster headache, not migraine.",
              "A first-ever aura, a headache that has changed in character, or any new focal deficit deserves red-flag screening before a benign label is applied.",
            ].map((item, index) => (
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

        <div className="app-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Module handoff
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Where to go next
          </h2>
          <div className="mt-5 space-y-3">
            {["brain-atlas", "vertigo", "sleep", "ask"].map((slug) => {
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
