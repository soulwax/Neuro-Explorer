"use client";

import { useState } from "react";
import {
  vascularTerritories,
  strokePresets,
  type VascularTerritory,
} from "~/lib/stroke";

const CIRC_COLORS: Record<string, string> = {
  anterior: "text-cyan-100 border-cyan-300/20 bg-cyan-300/10",
  posterior: "text-amber-100 border-amber-300/20 bg-amber-300/10",
};

export function StrokeExplorer() {
  const [selectedTerritory, setSelectedTerritory] = useState("mca-superior");
  const [activePreset, setActivePreset] = useState("mca-dominant");

  const territory = vascularTerritories.find(
    (t) => t.id === selectedTerritory,
  );

  const currentPreset = strokePresets.find((p) => p.id === activePreset);

  function applyPreset(presetId: string) {
    const preset = strokePresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedTerritory(preset.territoryId);
    setActivePreset(presetId);
  }

  function selectTerritory(id: string) {
    setSelectedTerritory(id);
    setActivePreset("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Neurovascular
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Stroke Vascular Territory Mapper
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Map symptoms to arterial territories. Each territory has a
              characteristic syndrome, sparing pattern, and acute management
              approach. The localization logic that separates anterior from
              posterior circulation saves lives.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical presets */}
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          Clinical Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {strokePresets.map((preset) => (
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

      {/* Territory selector + Details */}
      <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Selector */}
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            Vascular Territory
          </p>
          <div className="space-y-1">
            {vascularTerritories.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTerritory(t.id)}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                  selectedTerritory === t.id
                    ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                    : "border-white/6 text-slate-300 hover:bg-white/6"
                }`}
              >
                <span className="flex-1">{t.artery}</span>
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase ${CIRC_COLORS[t.circulation]}`}
                >
                  {t.circulation === "anterior" ? "ant" : "post"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        {territory && (
          <div className="space-y-6">
            {/* Clinical vignette */}
            {currentPreset && (
              <div className="rounded-[28px] border border-amber-300/18 bg-amber-200/8 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                    Clinical Vignette
                  </p>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>
                      NIHSS ~
                      <span className="font-mono text-amber-100">
                        {currentPreset.nihssEstimate}
                      </span>
                    </span>
                    <span>
                      Window:{" "}
                      <span className="text-amber-100">
                        {currentPreset.timeWindow}
                      </span>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {currentPreset.clinicalVignette}
                </p>
              </div>
            )}

            {/* Territory info */}
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-semibold text-white">
                  {territory.fullName}
                </h2>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs uppercase ${CIRC_COLORS[territory.circulation]}`}
                >
                  {territory.circulation}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Parent: {territory.parentArtery}
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Supplied structures
                </p>
                <ul className="mt-2 space-y-1">
                  {territory.suppliedStructures.map((s) => (
                    <li
                      key={s}
                      className="rounded-xl border border-white/6 bg-slate-950/30 px-3 py-2 text-sm text-slate-300"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Syndrome */}
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">
                {territory.syndrome.name}
              </h2>
              <p className="mt-2 text-sm leading-7 text-cyan-100">
                {territory.syndrome.classicPresentation}
              </p>

              <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Signs
              </h3>
              <div className="mt-3 space-y-3">
                {territory.syndrome.signs.map((sign) => (
                  <div
                    key={sign.finding}
                    className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-white">{sign.finding}</p>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                        {sign.laterality}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {sign.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sparings + Mimics + Management */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold text-green-200">
                  What is SPARED
                </h3>
                <ul className="mt-3 space-y-2">
                  {territory.syndrome.sparings.map((s) => (
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
                <h3 className="text-lg font-semibold text-amber-200">
                  Mimics
                </h3>
                <ul className="mt-3 space-y-2">
                  {territory.syndrome.mimics.map((m) => (
                    <li
                      key={m}
                      className="rounded-2xl border border-amber-300/10 bg-amber-200/6 p-3 text-sm text-slate-300"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-red-300/18 bg-red-200/8 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold text-red-100">
                  Acute Management
                </h3>
                <ul className="mt-3 space-y-2">
                  {territory.syndrome.acuteManagement.map((a) => (
                    <li
                      key={a}
                      className="rounded-2xl border border-red-300/10 bg-red-200/6 p-3 text-sm text-slate-200"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Variants */}
            {territory.variants.length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">Variants</h3>
                <ul className="mt-3 space-y-2">
                  {territory.variants.map((v) => (
                    <li
                      key={v}
                      className="rounded-2xl border border-white/6 bg-slate-950/30 p-3 text-sm text-slate-300"
                    >
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
