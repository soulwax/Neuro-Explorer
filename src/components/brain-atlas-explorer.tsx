"use client";

import { useMemo, useState } from "react";
import { CompareShell } from "~/components/compare-shell";
import { CaseQuestionPanel } from "~/components/case-question-panel";
import { CaseProgressPanel } from "~/components/case-progress-panel";
import { CaseShell } from "~/components/case-shell";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";
import { RevealPanel } from "~/components/reveal-panel";
import { brainAtlasCases } from "~/core/cases/brain-atlas";
import { buildCaseHandoffLinks } from "~/lib/case-handoff";
import { useCaseProgress } from "~/lib/case-progress";
import {
  atlasCategories,
  atlasChapters,
  atlasNetworkNotes,
  atlasOverlays,
  atlasRegions,
  getAtlasOverlay,
  type AtlasChapterId,
  type AtlasRegion,
} from "~/lib/brain-atlas";
import { getCurriculumModule } from "~/lib/curriculum";

const BRAIN_OUTLINE =
  "M58 136 C70 78 122 46 184 44 C258 42 320 78 332 128 C344 172 318 208 282 224 C248 240 214 242 188 244 C158 246 136 262 112 260 C94 258 80 244 78 222 C54 206 46 176 58 136Z";
const CEREBELLUM_OUTLINE =
  "M262 196 C278 180 304 180 318 198 C326 210 326 228 312 238 C296 250 270 246 258 228 C250 216 252 204 262 196Z";
const BRAINSTEM_OUTLINE =
  "M212 190 C228 188 238 198 240 212 C242 228 236 246 224 254 C214 260 200 256 198 242 C196 228 200 196 212 190Z";
const DEFAULT_REGION = atlasRegions.at(0) ?? (() => {
  throw new Error("Brain Atlas requires at least one region.");
})();

function regionById(regionId: string): AtlasRegion {
  const region = atlasRegions.find((item) => item.id === regionId);
  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }
  return region;
}

function categoryColor(region: AtlasRegion) {
  return (
    atlasCategories.find((category) => category.id === region.category)?.color ??
    "#ffffff"
  );
}

export function BrainAtlasExplorer() {
  const brainAtlasCurriculum = getCurriculumModule("brain-atlas");
  const [chapter, setChapter] = useState<AtlasChapterId>("functions");
  const [regionId, setRegionId] = useState<string>(DEFAULT_REGION.id);
  const [overlayId, setOverlayId] = useState<string>(atlasOverlays[0]!.id);
  const [compareRegionId, setCompareRegionId] = useState<string>(
    atlasOverlays[0]!.compareRegionId,
  );
  const [caseId, setCaseId] = useState<string>(brainAtlasCases[0]!.id);
  const [revealed, setRevealed] = useState(false);
  const {
    summary: caseProgressSummary,
    recordAttempt,
    resetProgress,
  } = useCaseProgress("brain-atlas", brainAtlasCases.length);
  const region = useMemo(() => regionById(regionId), [regionId]);
  const overlay = useMemo(
    () => getAtlasOverlay(overlayId) ?? atlasOverlays[0]!,
    [overlayId],
  );
  const compareRegion = useMemo(
    () => regionById(compareRegionId),
    [compareRegionId],
  );
  const activeCase = useMemo(
    () => brainAtlasCases.find((item) => item.id === caseId) ?? brainAtlasCases[0]!,
    [caseId],
  );
  const targetRegion = useMemo(
    () => regionById(activeCase.expectedRegionId),
    [activeCase],
  );
  const chapterMeta = atlasChapters.find((item) => item.id === chapter)!;
  const linkedIds = region.chapter2.interlinks.map((link) => link.target);
  const overlayRegionMap = useMemo(
    () =>
      new Map(
        overlay.regions.map((item) => [item.regionId, item] as const),
      ),
    [overlay],
  );
  const followUpLinks = buildCaseHandoffLinks(activeCase.followUpModules, {
    fromSlug: "brain-atlas",
    fromTitle: brainAtlasCurriculum?.title ?? "Brain Atlas",
    caseId: activeCase.id,
    caseTitle: activeCase.title,
    prompt: activeCase.prompt,
    selectedLabel: region.name,
    targetLabel: targetRegion.name,
  });
  const selectionMatchesCase = region.id === targetRegion.id;

  function revealCase() {
    recordAttempt({
      caseId: activeCase.id,
      caseTitle: activeCase.title,
      correct: selectionMatchesCase,
      selectedLabel: region.name,
      targetLabel: targetRegion.name,
    });
    setRevealed(true);
  }

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Brain Atlas
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Major regions first, interlinked circuits second
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {atlasChapters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChapter(item.id)}
                className={`inline-flex min-h-12 items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                  chapter === item.id
                    ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                    : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.id === "functions" ? "Chapter 1" : "Chapter 2"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          {chapterMeta.summary}
        </p>
      </section>

      <ModuleHandoffBanner />

      <section className="app-surface">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Convergence overlays
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Read anatomy as vascular, visual, brainstem, and loop systems
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            These overlays turn the atlas into a landing zone for the rest of
            the app rather than a list of isolated regions.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {atlasOverlays.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOverlayId(item.id);
                setCompareRegionId(item.compareRegionId);
              }}
              className={`inline-flex min-h-12 items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                item.id === overlay.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]"
                  : "border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_320px]">
          <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
              Clinical frame
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {overlay.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {overlay.summary}
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Why this overlay matters
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {overlay.clinicalFrame}
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Decisive next data
                </p>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
                  {overlay.decisiveNextData.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Overlay regions
            </p>
            <div className="mt-3 space-y-2.5">
              {overlay.regions.map((item) => {
                const target = regionById(item.regionId);
                return (
                  <div
                    key={item.regionId}
                    className="rounded-[18px] border border-white/10 bg-white/6 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {item.label} · {target.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {item.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <CaseShell
        eyebrow="Case Mode"
        title="Practice consult-level localization before the reveal"
        summary="Treat each vignette like senior consult rounds: formulate the syndrome, rank the localization hierarchy, name the most decisive next data, and then compare your working localization against the strongest network-level target."
        actions={
          <>
            {brainAtlasCases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCaseId(item.id);
                  setRegionId(item.startingRegionId);
                  setRevealed(false);
                  setChapter("functions");
                }}
                className={`inline-flex min-h-12 items-center rounded-full px-4 py-2 text-sm font-medium transition ${
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
        <div className="space-y-4">
          <CaseProgressPanel
            summary={caseProgressSummary}
            onReset={resetProgress}
          />

          {brainAtlasCurriculum ? (
            <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[18px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Training stage
                </p>
                <p className="mt-3 text-sm font-medium text-white">
                  {brainAtlasCurriculum.trainingStage}
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Post-clinical objectives
                </p>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
                  {brainAtlasCurriculum.advancedObjectives.map((objective) => (
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={revealCase}
              className="inline-flex min-h-12 items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5"
            >
              Reveal localization
            </button>
            <button
              type="button"
              onClick={() => {
                setRegionId(activeCase.startingRegionId);
                setRevealed(false);
              }}
              className="inline-flex min-h-12 items-center rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Reset selection
            </button>
            <p className="text-sm text-slate-300">
              Current pick: <span className="font-semibold text-white">{region.name}</span>
            </p>
          </div>

          {revealed ? (
            <>
              <RevealPanel
                correct={selectionMatchesCase}
                selectedLabel={region.name}
                targetLabel={targetRegion.name}
                explanation={targetRegion.chapter1.clinicalLink}
                teachingPoints={activeCase.teachingPoints}
                nextDataRequests={activeCase.nextDataRequests}
                followUpLinks={followUpLinks}
              />

              <CompareShell
                title="Your selection versus best-fit localization"
                leftLabel={`Your pick: ${region.shortLabel}`}
                rightLabel={`Target: ${targetRegion.shortLabel}`}
                left={
                  <>
                    <p className="font-semibold text-white">{region.name}</p>
                    <p className="mt-2">{region.chapter1.summary}</p>
                    <p className="mt-3">{region.chapter1.clinicalLink}</p>
                  </>
                }
                right={
                  <>
                    <p className="font-semibold text-white">{targetRegion.name}</p>
                    <p className="mt-2">{targetRegion.chapter1.summary}</p>
                    <p className="mt-3">{targetRegion.chapter1.clinicalLink}</p>
                  </>
                }
              />
            </>
          ) : null}
        </div>
      </CaseShell>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
        <div className="app-surface">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {chapter === "functions" ? "Functional map" : "Interlink map"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {chapter === "functions"
                  ? "Regional specialization"
                  : `Circuit view for ${region.shortLabel}`}
              </h2>
            </div>
            <div className="hidden flex-wrap gap-2 md:flex">
              {atlasCategories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          <svg
            viewBox="0 0 360 280"
            className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
          >
            <path d={BRAIN_OUTLINE} fill="#16243a" stroke="#274567" strokeWidth="1.2" />
            <path
              d={CEREBELLUM_OUTLINE}
              fill="#1a2a42"
              stroke="#315577"
              strokeWidth="1"
            />
            <path
              d={BRAINSTEM_OUTLINE}
              fill="#1a2a42"
              stroke="#315577"
              strokeWidth="1"
            />

            {chapter === "interlinks" &&
              region.chapter2.interlinks.map((link) => {
                const target = regionById(link.target);
                return (
                  <line
                    key={`${region.id}-${link.target}`}
                    x1={region.x}
                    y1={region.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="rgba(255,213,138,0.58)"
                    strokeDasharray="5 4"
                    strokeWidth="2"
                  />
                );
              })}

            {atlasRegions.map((item) => {
              const isActive = item.id === region.id;
              const isLinked = linkedIds.includes(item.id);
              const overlayRegion = overlayRegionMap.get(item.id);
              const fill = isActive
                ? categoryColor(item)
                : overlayRegion?.emphasis === "primary"
                  ? "rgba(103, 211, 255, 0.92)"
                  : overlayRegion?.emphasis === "supporting"
                    ? "rgba(255, 213, 138, 0.82)"
                    : isLinked
                  ? "rgba(255,213,138,0.94)"
                  : "rgba(226,232,240,0.22)";
              const stroke = isActive
                ? "#ffffff"
                : overlayRegion
                  ? overlayRegion.emphasis === "primary"
                    ? "#67d3ff"
                    : "#ffd58a"
                  : isLinked
                  ? "#ffd58a"
                  : "#315577";

              return (
                <g key={item.id}>
                  <circle
                    cx={item.x}
                    cy={item.y}
                    r={isActive ? 18 : 15}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive ? 2.4 : 1.2}
                  />
                  <text
                    x={item.x}
                    y={item.y + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#08111d"
                  >
                    {item.shortLabel}
                  </text>
                  {isActive ? (
                    <text
                      x={item.x}
                      y={item.y - 26}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#e2ecf7"
                    >
                      {item.name}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          <div className="mt-4 flex flex-wrap gap-2">
            {atlasRegions.map((item) => {
              const active = item.id === region.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRegionId(item.id)}
                  className={`inline-flex min-h-12 items-center rounded-full border px-3 py-2 text-sm transition ${
                    active
                      ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.shortLabel} {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="app-surface">
          <div
            className="inline-flex min-h-9 items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em]"
            style={{
              color: categoryColor(region),
              borderColor: `${categoryColor(region)}44`,
            }}
          >
            {region.lobe}
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-white">{region.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {chapter === "functions"
              ? region.chapter1.summary
              : region.chapter2.role}
          </p>

          {chapter === "functions" ? (
            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                  Core functions
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
                  {region.chapter1.functions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                  Signature tasks
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
                  {region.chapter1.signatureTasks.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                  Clinical link
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {region.chapter1.clinicalLink}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {region.chapter2.systems.map((system) => (
                  <span
                    key={system}
                    className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-200"
                  >
                    {system}
                  </span>
                ))}
              </div>

              <div className="space-y-2.5">
                {region.chapter2.interlinks.map((link) => {
                  const target = regionById(link.target);
                  return (
                    <div
                      key={link.target}
                      className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4"
                    >
                      <p className="text-sm font-semibold text-cyan-100">
                        {link.label} → {target.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {link.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <CompareShell
        title="Selected region versus anatomical rival"
        leftLabel={`Selected: ${region.shortLabel}`}
        rightLabel={`Compare to: ${compareRegion.shortLabel}`}
        left={
          <>
            <p className="font-semibold text-white">{region.name}</p>
            <p className="mt-2">{region.chapter1.summary}</p>
            <p className="mt-3">{region.chapter1.clinicalLink}</p>
          </>
        }
        right={
          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Compare region
                </span>
                <select
                  value={compareRegion.id}
                  onChange={(event) => setCompareRegionId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
                >
                  {atlasRegions
                    .filter((item) => item.id !== region.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="font-semibold text-white">{compareRegion.name}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {compareRegion.chapter1.summary}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {compareRegion.chapter1.clinicalLink}
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-100">
                Why the overlay prefers the selected network
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {overlay.whyAlternativeWeaker}
              </p>
            </div>
          </div>
        }
      />

      <section className="app-surface">
        <h2 className="text-xl font-semibold text-white">
          {chapter === "functions"
            ? "How to read Chapter 1"
            : "How to read Chapter 2"}
        </h2>
        {chapter === "functions" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {atlasNetworkNotes.map((note, index) => (
              <div
                key={note}
                className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="text-sm font-semibold text-amber-200/90">
                  Principle {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{note}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2.5 text-sm text-slate-300">
            {region.chapter2.interlinks.map((link) => {
              const target = regionById(link.target);
              return (
                <p
                  key={link.target}
                  className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4 leading-6"
                >
                  <span className="font-semibold text-white">{target.name}:</span>{" "}
                  {link.description}
                </p>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
