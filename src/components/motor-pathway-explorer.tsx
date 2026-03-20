"use client";

import { useMemo, useState } from "react";
import {
  motorLesionLevels,
  motorPathwayPresets,
  simulateMotorLesion,
  type MotorSign,
} from "~/lib/motor-pathway";

const PATHWAY_LEVELS = [
  { id: "motor-cortex", y: 0, label: "Motor Cortex" },
  { id: "internal-capsule", y: 1, label: "Internal Capsule" },
  { id: "cerebral-peduncle", y: 2, label: "Midbrain" },
  { id: "basilar-pons", y: 3, label: "Pons" },
  { id: "medullary-pyramid", y: 4, label: "Medulla" },
  { id: "pyramidal-decussation", y: 5, label: "Decussation" },
  { id: "lateral-corticospinal", y: 6, label: "Spinal Cord" },
  { id: "anterior-horn", y: 7, label: "Anterior Horn" },
  { id: "ventral-root", y: 8, label: "Nerve Root" },
  { id: "peripheral-nerve", y: 9, label: "Peripheral Nerve" },
  { id: "nmj", y: 10, label: "NMJ" },
  { id: "muscle", y: 11, label: "Muscle" },
];

function SignCard({ sign }: { sign: MotorSign }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold text-cyan-100">{sign.name}</p>
      </div>
      <p className="mt-1 text-sm font-medium text-white">{sign.value}</p>
      <p className="mt-2 text-xs leading-6 text-slate-400">
        {sign.explanation}
      </p>
    </div>
  );
}

export function MotorPathwayExplorer() {
  const [selectedLesion, setSelectedLesion] = useState("motor-cortex");
  const [activePreset, setActivePreset] = useState("mca-stroke");

  const result = useMemo(
    () => simulateMotorLesion(selectedLesion),
    [selectedLesion],
  );

  function applyPreset(presetId: string) {
    const preset = motorPathwayPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedLesion(preset.lesionId);
    setActivePreset(presetId);
  }

  function selectLevel(levelId: string) {
    setSelectedLesion(levelId);
    setActivePreset("");
  }

  const currentPreset = motorPathwayPresets.find(
    (p) => p.id === activePreset,
  );

  const categoryColors: Record<string, string> = {
    UMN: "text-cyan-100 border-cyan-300/20 bg-cyan-300/10",
    LMN: "text-amber-100 border-amber-300/20 bg-amber-300/10",
    mixed: "text-red-100 border-red-300/20 bg-red-300/10",
    NMJ: "text-purple-100 border-purple-300/20 bg-purple-300/10",
    myopathic: "text-green-100 border-green-300/20 bg-green-300/10",
  };

  return (
    <div className="app-page-stack">
      {/* Header */}
      <section className="app-surface app-surface--hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Motor System
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Corticospinal Tract & Motor Localization
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Select a lesion level along the motor pathway from cortex to
              muscle. See UMN vs LMN signs, brainstem crossed findings, and
              acute vs chronic presentations.
            </p>
          </div>
          <div
            className={`rounded-full border px-4 py-2 text-sm font-medium ${categoryColors[result.classification] ?? ""}`}
          >
            {result.classification}
          </div>
        </div>
      </section>

      {/* Clinical presets */}
      <section className="app-surface">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Clinical Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {motorPathwayPresets.map((preset) => (
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

      {/* Pathway diagram + Lesion selector */}
      <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Pathway */}
        <div className="app-surface">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            Lesion Level
          </p>
          <div className="space-y-1">
            {PATHWAY_LEVELS.map((level) => {
              const isSelected = selectedLesion === level.id;
              const lesionData = motorLesionLevels.find(
                (l) => l.id === level.id,
              );
              const isDecussation = level.id === "pyramidal-decussation";
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => selectLevel(level.id)}
                  className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                      : "border-white/6 bg-transparent text-slate-300 hover:bg-white/6"
                  }`}
                >
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      isSelected ? "bg-cyan-400" : "bg-slate-600"
                    }`}
                  />
                  <span className="flex-1">{level.label}</span>
                  {isDecussation && (
                    <span className="text-xs text-amber-300/70">X</span>
                  )}
                  {lesionData && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] uppercase ${
                        categoryColors[lesionData.category] ?? ""
                      }`}
                    >
                      {lesionData.category}
                    </span>
                  )}
                </button>
              );
            })}
            {/* Special entries */}
            <div className="mt-2 border-t border-white/6 pt-2">
              <button
                type="button"
                onClick={() => selectLevel("als-mixed")}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                  selectedLesion === "als-mixed"
                    ? "border-red-300/30 bg-red-300/12 text-red-100"
                    : "border-white/6 bg-transparent text-slate-300 hover:bg-white/6"
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    selectedLesion === "als-mixed"
                      ? "bg-red-400"
                      : "bg-slate-600"
                  }`}
                />
                <span className="flex-1">ALS (Mixed UMN + LMN)</span>
                <span className="rounded-full border border-red-300/20 bg-red-300/10 px-1.5 py-0.5 text-[10px] uppercase text-red-100">
                  mixed
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="app-page-stack">
          {/* Clinical vignette */}
          {currentPreset && (
            <div className="rounded-[28px] border border-amber-300/18 bg-amber-200/8 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                Clinical vignette
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {currentPreset.clinicalVignette}
              </p>
            </div>
          )}

          {/* Lesion info */}
          <div className="app-surface">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {result.lesion.anatomicalLevel}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {result.lesion.label}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {result.lesion.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
              <span>
                Crossing:{" "}
                <span className="text-slate-200">{result.lesion.crossedAt}</span>
              </span>
              <span>
                Distribution:{" "}
                <span className="text-slate-200">{result.distribution}</span>
              </span>
            </div>
          </div>

          {/* Signs */}
          {result.contralateral.length > 0 && (
            <div className="app-surface">
              <h2 className="text-lg font-semibold text-white">
                Contralateral signs
              </h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {result.contralateral.map((sign) => (
                  <SignCard key={sign.name} sign={sign} />
                ))}
              </div>
            </div>
          )}

          {result.ipsilateral.length > 0 && (
            <div className="app-surface">
              <h2 className="text-lg font-semibold text-white">
                Ipsilateral signs
              </h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {result.ipsilateral.map((sign) => (
                  <SignCard key={sign.name} sign={sign} />
                ))}
              </div>
            </div>
          )}

          {result.bilateral.length > 0 && (
            <div className="app-surface">
              <h2 className="text-lg font-semibold text-white">
                {result.classification === "NMJ" ||
                result.classification === "myopathic"
                  ? "Clinical signs"
                  : result.classification === "mixed"
                    ? "Mixed UMN + LMN signs"
                    : "Bilateral findings"}
              </h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {result.bilateral.map((sign) => (
                  <SignCard key={sign.name} sign={sign} />
                ))}
              </div>
            </div>
          )}

          {/* Acute vs Chronic + Red flags */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="app-surface">
              <h2 className="text-lg font-semibold text-white">
                Temporal evolution
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="font-semibold text-cyan-100">Acute</p>
                  <p className="mt-1">{result.acuteVsChronic.acute}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="font-semibold text-amber-100">Chronic</p>
                  <p className="mt-1">{result.acuteVsChronic.chronic}</p>
                </div>
              </div>
            </div>

            <div className="app-surface">
              <h2 className="text-lg font-semibold text-white">
                Key distinctions
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                {result.explanation.keyDistinctions.map((item) => (
                  <li
                    key={item}
                    className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {result.redFlags.length > 0 && (
                <div className="mt-4 rounded-3xl border border-red-300/18 bg-red-200/8 p-4 text-sm leading-7 text-slate-300">
                  <p className="font-semibold text-red-100">Red flags</p>
                  {result.redFlags.map((flag) => (
                    <p key={flag} className="mt-1">
                      {flag}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full pathway */}
          <div className="app-surface">
            <h2 className="text-lg font-semibold text-white">
              Complete motor pathway
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {result.explanation.pathway}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
