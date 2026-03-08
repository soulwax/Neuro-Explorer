"use client";

import { useMemo, useState } from "react";
import {
  atlasCategories,
  atlasChapters,
  atlasNetworkNotes,
  atlasRegions,
  type AtlasChapterId,
  type AtlasRegion,
} from "~/lib/brain-atlas";

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
  const [chapter, setChapter] = useState<AtlasChapterId>("functions");
  const [regionId, setRegionId] = useState<string>(DEFAULT_REGION.id);
  const region = useMemo(() => regionById(regionId), [regionId]);
  const chapterMeta = atlasChapters.find((item) => item.id === chapter)!;
  const linkedIds = region.chapter2.interlinks.map((link) => link.target);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          {chapterMeta.summary}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
              const fill = isActive
                ? categoryColor(item)
                : isLinked
                  ? "rgba(255,213,138,0.94)"
                  : "rgba(226,232,240,0.22)";
              const stroke = isActive
                ? "#ffffff"
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

          <div className="mt-5 flex flex-wrap gap-2">
            {atlasRegions.map((item) => {
              const active = item.id === region.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRegionId(item.id)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
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

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div
            className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em]"
            style={{
              color: categoryColor(region),
              borderColor: `${categoryColor(region)}44`,
            }}
          >
            {region.lobe}
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-white">{region.name}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {chapter === "functions"
              ? region.chapter1.summary
              : region.chapter2.role}
          </p>

          {chapter === "functions" ? (
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                  Core functions
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {region.chapter1.functions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                  Signature tasks
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {region.chapter1.signatureTasks.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                  Clinical link
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {region.chapter1.clinicalLink}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                {region.chapter2.systems.map((system) => (
                  <span
                    key={system}
                    className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-200"
                  >
                    {system}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {region.chapter2.interlinks.map((link) => {
                  const target = regionById(link.target);
                  return (
                    <div
                      key={link.target}
                      className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <p className="text-sm font-semibold text-cyan-100">
                        {link.label} → {target.name}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
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

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">
          {chapter === "functions"
            ? "How to read Chapter 1"
            : "How to read Chapter 2"}
        </h2>
        {chapter === "functions" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {atlasNetworkNotes.map((note, index) => (
              <div
                key={note}
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="text-sm font-semibold text-amber-200/90">
                  Principle {index + 1}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{note}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {region.chapter2.interlinks.map((link) => {
              const target = regionById(link.target);
              return (
                <p
                  key={link.target}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 leading-7"
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
