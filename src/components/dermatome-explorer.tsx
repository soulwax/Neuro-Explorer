"use client";

import { useMemo, useState } from "react";
import {
  dermatomes,
  sensoryModalities,
  sensoryTracts,
  sensoryLesionLevels,
  sensoryPresets,
  simulateSensoryLesion,
} from "~/lib/dermatome";

type TabMode = "lesion" | "dermatomes" | "tracts" | "modalities";

const CATEGORY_COLORS: Record<string, string> = {
  peripheral: "text-amber-100 border-amber-300/20 bg-amber-300/10",
  spinal: "text-cyan-100 border-cyan-300/20 bg-cyan-300/10",
  brainstem: "text-purple-100 border-purple-300/20 bg-purple-300/10",
  thalamic: "text-green-100 border-green-300/20 bg-green-300/10",
  cortical: "text-red-100 border-red-300/20 bg-red-300/10",
};

const STATUS_COLORS: Record<string, string> = {
  lost: "text-red-200 bg-red-300/10 border-red-300/20",
  preserved: "text-green-200 bg-green-300/10 border-green-300/20",
  diminished: "text-amber-200 bg-amber-300/10 border-amber-300/20",
  dissociated: "text-purple-200 bg-purple-300/10 border-purple-300/20",
};

export function DermatomeExplorer() {
  const [selectedLesion, setSelectedLesion] = useState("polyneuropathy");
  const [activePreset, setActivePreset] = useState("stocking-glove");
  const [tabMode, setTabMode] = useState<TabMode>("lesion");

  const result = useMemo(
    () => simulateSensoryLesion(selectedLesion),
    [selectedLesion],
  );

  const currentPreset = sensoryPresets.find((p) => p.id === activePreset);

  function applyPreset(presetId: string) {
    const preset = sensoryPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedLesion(preset.lesionId);
    setActivePreset(presetId);
    setTabMode("lesion");
  }

  function selectLesion(id: string) {
    setSelectedLesion(id);
    setActivePreset("");
  }

  const tabs: { id: TabMode; label: string }[] = [
    { id: "lesion", label: "Lesion Simulator" },
    { id: "dermatomes", label: "Dermatome Map" },
    { id: "tracts", label: "Sensory Tracts" },
    { id: "modalities", label: "Modalities" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Sensory System
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Dermatomes & Sensory Pathways
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              From receptor to cortex: dorsal columns vs spinothalamic tract,
              dermatome landmarks, and the clinical patterns that localize
              sensory lesions from peripheral nerve to parietal cortex.
            </p>
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabMode(tab.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tabMode === tab.id
                    ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                    : "border border-white/6 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Clinical Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {sensoryPresets.map((preset) => (
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

      {tabMode === "lesion" && (
        <LesionView
          result={result}
          selectedLesion={selectedLesion}
          currentPreset={currentPreset}
          onSelectLesion={selectLesion}
        />
      )}

      {tabMode === "dermatomes" && <DermatomeMapView />}
      {tabMode === "tracts" && <TractsView />}
      {tabMode === "modalities" && <ModalitiesView />}
    </div>
  );
}

function LesionView({
  result,
  selectedLesion,
  currentPreset,
  onSelectLesion,
}: {
  result: ReturnType<typeof simulateSensoryLesion>;
  selectedLesion: string;
  currentPreset: (typeof sensoryPresets)[number] | undefined;
  onSelectLesion: (id: string) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Lesion level selector */}
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Lesion Level
        </p>
        <div className="space-y-1">
          {sensoryLesionLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => onSelectLesion(level.id)}
              className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                selectedLesion === level.id
                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                  : "border-white/6 text-slate-300 hover:bg-white/6"
              }`}
            >
              <span className="flex-1">{level.label}</span>
              <span
                className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase ${CATEGORY_COLORS[level.category]}`}
              >
                {level.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Vignette */}
        {currentPreset && (
          <div className="rounded-[28px] border border-amber-300/18 bg-amber-200/8 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
              Clinical Vignette
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {currentPreset.clinicalVignette}
            </p>
          </div>
        )}

        {/* Lesion info */}
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-semibold text-white">
              {result.lesion.label}
            </h2>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs uppercase ${CATEGORY_COLORS[result.lesion.category]}`}
            >
              {result.lesion.category}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {result.lesion.anatomicalLevel}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {result.lesion.description}
          </p>
        </div>

        {/* Findings */}
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">
            Sensory Findings
          </h3>
          <p className="mt-1 text-sm text-cyan-100">{result.pattern}</p>
          <p className="mt-1 text-xs text-slate-400">
            Distribution: {result.distribution}
          </p>

          <div className="mt-4 space-y-3">
            {result.findings.map((finding) => (
              <div
                key={finding.modality}
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{finding.modality}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${STATUS_COLORS[finding.status]}`}
                  >
                    {finding.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {finding.territory}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  {finding.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Spared + Key distinctions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold text-green-200">
              Spared Modalities
            </h3>
            <ul className="mt-3 space-y-2">
              {result.sparedModalities.map((s) => (
                <li
                  key={s}
                  className="rounded-2xl border border-green-300/10 bg-green-200/6 p-3 text-sm text-slate-300"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">
              Key Distinctions
            </h3>
            <ul className="mt-3 space-y-2">
              {result.keyDistinctions.map((d) => (
                <li
                  key={d}
                  className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                >
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Clinical correlate: {result.clinicalCorrelate}
            </p>
          </div>
        </div>

        {/* Localization logic */}
        <div className="rounded-[28px] border border-amber-300/18 bg-amber-200/8 p-5 backdrop-blur">
          <h3 className="text-lg font-semibold text-amber-100">
            Localization Algorithm
          </h3>
          <ol className="mt-3 space-y-2">
            {result.explanation.localizationLogic.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl border border-amber-300/10 bg-amber-200/6 p-3 text-sm text-slate-200"
              >
                <span className="shrink-0 font-mono text-amber-200">
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function DermatomeMapView() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
      <h2 className="text-xl font-semibold text-white">
        Key Dermatome Landmarks
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        The landmarks that matter most for clinical localization. Every level
        has a myotome partner and (where applicable) a reflex.
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Landmark</th>
              <th className="px-3 py-2">How to test</th>
              <th className="px-3 py-2">Myotome partner</th>
              <th className="px-3 py-2">Reflex</th>
            </tr>
          </thead>
          <tbody>
            {dermatomes.map((d) => (
              <tr
                key={d.level}
                className="border-b border-white/6 text-slate-300 hover:bg-white/4"
              >
                <td className="px-3 py-2.5 font-mono font-semibold text-cyan-100">
                  {d.level}
                </td>
                <td className="px-3 py-2.5">{d.landmark}</td>
                <td className="px-3 py-2.5 text-slate-400">
                  {d.clinicalTest}
                </td>
                <td className="px-3 py-2.5">{d.myotomePartner}</td>
                <td className="px-3 py-2.5 text-xs text-slate-400">
                  {d.reflexPartner ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TractsView() {
  return (
    <section className="space-y-6">
      {sensoryTracts.map((tract) => (
        <div
          key={tract.id}
          className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur"
        >
          <h2 className="text-xl font-semibold text-white">{tract.name}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tract.modalities.map((m) => (
              <span
                key={m}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100"
              >
                {m}
              </span>
            ))}
          </div>

          <h3 className="mt-4 text-sm font-semibold uppercase text-slate-500">
            Course (step by step)
          </h3>
          <ol className="mt-2 space-y-1">
            {tract.course.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-xl border border-white/6 bg-slate-950/30 px-3 py-2 text-sm text-slate-300"
              >
                <span className="shrink-0 font-mono text-slate-600">
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-400">
            <span>
              Crossing:{" "}
              <span className="text-amber-200">{tract.crossingLevel}</span>
            </span>
            <span>
              Test: <span className="text-slate-200">{tract.clinicalTestMethod}</span>
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

function ModalitiesView() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {sensoryModalities.map((mod) => (
        <div
          key={mod.id}
          className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur"
        >
          <h2 className="text-lg font-semibold text-white">{mod.name}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl border border-white/6 bg-slate-950/30 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Receptor
              </p>
              <p className="mt-1 text-slate-300">{mod.receptor}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/30 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Fiber Type
              </p>
              <p className="mt-1 text-slate-300">{mod.fiberType}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/30 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Pathway
              </p>
              <p className="mt-1 text-slate-300">{mod.pathway}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/30 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Crossing Level
              </p>
              <p className="mt-1 text-amber-200">{mod.crossingLevel}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/30 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Cortical Destination
              </p>
              <p className="mt-1 text-slate-300">{mod.corticalDestination}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
