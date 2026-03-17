"use client";

import { useState } from "react";
import {
  cranialNerves,
  cranialNerveSyndromes,
  cranialNervePresets,
  type CranialNerve,
  type CranialNerveSyndrome,
} from "~/lib/cranial-nerves";

const TYPE_COLORS: Record<string, string> = {
  sensory: "text-purple-100 border-purple-300/20 bg-purple-300/10",
  motor: "text-cyan-100 border-cyan-300/20 bg-cyan-300/10",
  mixed: "text-amber-100 border-amber-300/20 bg-amber-300/10",
};

const LEVEL_COLORS: Record<string, string> = {
  forebrain: "text-green-200",
  midbrain: "text-cyan-200",
  pons: "text-amber-200",
  medulla: "text-red-200",
};

type ViewMode = "nerve" | "syndrome";

export function CranialNervesExplorer() {
  const [selectedNerve, setSelectedNerve] = useState<number>(7);
  const [selectedSyndrome, setSelectedSyndrome] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("nerve");

  const nerve = cranialNerves.find((cn) => cn.number === selectedNerve);
  const syndrome = selectedSyndrome
    ? cranialNerveSyndromes.find((s) => s.id === selectedSyndrome) ?? null
    : null;

  function applyPreset(presetId: string) {
    const preset = cranialNervePresets.find((p) => p.id === presetId);
    if (!preset) return;
    if (preset.selectedNerve) {
      setSelectedNerve(preset.selectedNerve);
      setViewMode("nerve");
      setSelectedSyndrome(null);
    }
    if (preset.syndromeId) {
      setSelectedSyndrome(preset.syndromeId);
      setViewMode("syndrome");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Neurological Examination
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cranial Nerves I–XII
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Exam techniques, peripheral vs central lesion patterns, brainstem
              syndromes, and the clinical pearls that distinguish benign from
              dangerous presentations.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("nerve")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${viewMode === "nerve" ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 text-slate-300 hover:bg-white/6"}`}
            >
              By Nerve
            </button>
            <button
              type="button"
              onClick={() => setViewMode("syndrome")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${viewMode === "syndrome" ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 text-slate-300 hover:bg-white/6"}`}
            >
              By Syndrome
            </button>
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Clinical Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {cranialNervePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              title={preset.description}
              className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {viewMode === "nerve" ? (
        <NerveView
          nerve={nerve}
          selectedNerve={selectedNerve}
          onSelectNerve={setSelectedNerve}
        />
      ) : (
        <SyndromeView
          syndrome={syndrome}
          selectedSyndrome={selectedSyndrome}
          onSelectSyndrome={setSelectedSyndrome}
        />
      )}
    </div>
  );
}

function NerveView({
  nerve,
  selectedNerve,
  onSelectNerve,
}: {
  nerve: CranialNerve | undefined;
  selectedNerve: number;
  onSelectNerve: (n: number) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Nerve selector */}
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Select Nerve
        </p>
        <div className="space-y-1">
          {cranialNerves.map((cn) => (
            <button
              key={cn.number}
              type="button"
              onClick={() => onSelectNerve(cn.number)}
              className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                selectedNerve === cn.number
                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                  : "border-white/6 text-slate-300 hover:bg-white/6"
              }`}
            >
              <span className="w-8 text-right font-mono text-xs text-slate-500">
                {cn.numeral}
              </span>
              <span className="flex-1">{cn.name}</span>
              <span
                className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase ${TYPE_COLORS[cn.type]}`}
              >
                {cn.type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Nerve details */}
      {nerve && (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-cyan-100">
                {nerve.numeral}
              </span>
              <h2 className="text-2xl font-semibold text-white">
                {nerve.name}
              </h2>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs uppercase ${TYPE_COLORS[nerve.type]}`}
              >
                {nerve.type}
              </span>
              <span className={`text-xs ${LEVEL_COLORS[nerve.brainstemLevel]}`}>
                {nerve.brainstemLevel}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              <span>
                Exit: <span className="text-slate-200">{nerve.foramen}</span>
              </span>
              <span>
                Nuclei:{" "}
                <span className="text-slate-200">
                  {nerve.nuclei.join(", ")}
                </span>
              </span>
            </div>
          </div>

          {/* Functions + Exam */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Functions</h3>
              <ul className="mt-3 space-y-2">
                {nerve.functions.map((f) => (
                  <li
                    key={f}
                    className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">
                Exam Technique
              </h3>
              <ul className="mt-3 space-y-2">
                {nerve.examTechnique.map((t) => (
                  <li
                    key={t}
                    className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Normal: {nerve.normalFinding}
              </p>
            </div>
          </div>

          {/* Lesion patterns */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <h3 className="text-lg font-semibold text-amber-100">
                Peripheral Lesion
              </h3>
              <p className="mt-1 text-sm font-medium text-white">
                {nerve.peripheralLesion.label}
              </p>
              <ul className="mt-3 space-y-2">
                {nerve.peripheralLesion.signs.map((s) => (
                  <li
                    key={s}
                    className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                {nerve.peripheralLesion.mechanism}
              </p>
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Common causes
                </p>
                <ul className="mt-1 space-y-1">
                  {nerve.peripheralLesion.commonCauses.map((c) => (
                    <li key={c} className="text-xs text-slate-400">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {nerve.centralLesion ? (
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold text-cyan-100">
                  Central Lesion
                </h3>
                <p className="mt-1 text-sm font-medium text-white">
                  {nerve.centralLesion.label}
                </p>
                <ul className="mt-3 space-y-2">
                  {nerve.centralLesion.signs.map((s) => (
                    <li
                      key={s}
                      className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-400">
                  {nerve.centralLesion.mechanism}
                </p>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Common causes
                  </p>
                  <ul className="mt-1 space-y-1">
                    {nerve.centralLesion.commonCauses.map((c) => (
                      <li key={c} className="text-xs text-slate-400">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold text-slate-500">
                  Central Lesion
                </h3>
                <p className="mt-3 text-sm text-slate-500">
                  No distinct central lesion pattern for CN {nerve.numeral}.
                  This nerve is typically affected peripherally.
                </p>
              </div>
            )}
          </div>

          {/* Clinical pearls */}
          <div className="rounded-[28px] border border-amber-300/18 bg-amber-200/8 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold text-amber-100">
              Clinical Pearls
            </h3>
            <ul className="mt-3 space-y-3">
              {nerve.clinicalPearls.map((pearl) => (
                <li
                  key={pearl}
                  className="rounded-2xl border border-amber-300/10 bg-amber-200/6 p-3 text-sm leading-7 text-slate-200"
                >
                  {pearl}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function SyndromeView({
  syndrome,
  selectedSyndrome,
  onSelectSyndrome,
}: {
  syndrome: CranialNerveSyndrome | null;
  selectedSyndrome: string | null;
  onSelectSyndrome: (id: string) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Syndrome selector */}
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Brainstem Syndromes
        </p>
        <div className="space-y-1">
          {cranialNerveSyndromes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSyndrome(s.id)}
              className={`flex w-full flex-col rounded-2xl border px-3 py-2 text-left transition ${
                selectedSyndrome === s.id
                  ? "border-cyan-300/30 bg-cyan-300/12"
                  : "border-white/6 hover:bg-white/6"
              }`}
            >
              <span
                className={`text-sm font-medium ${selectedSyndrome === s.id ? "text-cyan-100" : "text-slate-200"}`}
              >
                {s.label}
              </span>
              <span className="mt-0.5 text-xs text-slate-500">
                {s.location}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Syndrome details */}
      {syndrome ? (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">
              {syndrome.label}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {syndrome.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
              <span>
                Location:{" "}
                <span className="text-slate-200">{syndrome.location}</span>
              </span>
              <span>
                Affected CNs:{" "}
                <span className="text-slate-200">
                  {syndrome.affectedNerves
                    .map(
                      (n) =>
                        cranialNerves.find((cn) => cn.number === n)?.numeral ??
                        `${n}`,
                    )
                    .join(", ")}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Clinical Signs</h3>
            <ul className="mt-3 space-y-2">
              {syndrome.signs.map((sign) => (
                <li
                  key={sign}
                  className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                >
                  {sign}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Mechanism</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {syndrome.mechanism}
              </p>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Differential Clues
              </h3>
              <ul className="mt-3 space-y-2">
                {syndrome.differentialClues.map((clue) => (
                  <li
                    key={clue}
                    className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                  >
                    {clue}
                  </li>
                ))}
              </ul>
            </div>

            {syndrome.emergencyFeatures.length > 0 && (
              <div className="rounded-[28px] border border-red-300/18 bg-red-200/8 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold text-red-100">
                  Emergency Features
                </h3>
                <ul className="mt-3 space-y-2">
                  {syndrome.emergencyFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-2xl border border-red-300/10 bg-red-200/6 p-3 text-sm text-slate-200"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-10 text-center backdrop-blur">
          <p className="text-slate-500">
            Select a syndrome from the sidebar to explore it.
          </p>
        </div>
      )}
    </section>
  );
}
