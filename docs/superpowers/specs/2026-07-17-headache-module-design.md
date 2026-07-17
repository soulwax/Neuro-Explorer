# Headache / Migraine module — design spec

## Goal

Add a new neurology curriculum module covering primary headache disorders and secondary-headache red-flag recognition — the highest-volume neurology outpatient complaint, currently absent from the platform's 22 modules. First of several planned gap-filling modules (autonomic dysfunction, neuromuscular/peripheral nerve/myopathy, memory/dementia are tracked as separate future spec→plan cycles, not part of this work).

## Scope

**In scope:**

- A new `/headache` page following this app's established "differential-reasoning localizer" architecture (the pattern used by `stroke`, `cranial-nerves`, `dermatome` — preset library + case mode, no live waveform/physics simulation).
- 5 clinical presets: migraine with aura, migraine without aura, tension-type headache, cluster headache, and a secondary/thunderclap red-flag preset (subarachnoid-hemorrhage mimic).
- 3 clinical teaching cases using the shared predict-before-reveal case engine.
- Curriculum metadata, nav entry, home-page module card, and cross-module handoffs.

**Out of scope:**

- The other four gap topics identified in the earlier curriculum-coverage review (autonomic dysfunction, NMJ/peripheral nerve/myopathy, memory/dementia, spinal cord syndromes) — each gets its own spec→plan cycle later.
- Any live simulation/waveform generation — headache teaching content is fundamentally differential-diagnosis reasoning, not a signal to simulate, matching how `stroke` and `vertigo` are built (no `core/`+`server/routes/` compute needed beyond serving static preset/case data).
- Medication/treatment-protocol depth (dosing, abortive/preventive drug selection) — this is a localization-and-recognition teaching tool, not a prescribing reference, consistent with how other modules stop at "next data requests" rather than management algorithms.

## Architecture

Follows the exact pattern established by `src/core/stroke.ts` / `src/core/cases/stroke.ts` / `src/lib/stroke.ts` / `src/server/routes/stroke.ts` / `src/components/stroke-explorer.tsx`:

- **`src/core/headache.ts`** (new) — pure TypeScript, no React: `HeadachePreset` interface and the 5 preset objects, plus any small pure helper functions the component needs (e.g. a red-flag-score-to-tone mapping, mirroring `riskTone()` in `vertigo-explorer.tsx`).
- **`src/core/cases.ts`** (modify) — add `HeadacheClinicalCase extends InstructionCase` with `expectedPresetId: string` and `startingPresetId: string`, matching `StrokeClinicalCase`'s shape exactly.
- **`src/core/cases/headache.ts`** (new) — 3 `HeadacheClinicalCase` objects.
- **`src/lib/headache.ts`** (new) — `export * from "~/core/headache";` (thin re-export, matching `src/lib/stroke.ts`).
- **`src/server/routes/headache.ts`** (new) — GET handler serving `{ presets, cases }` or a single preset by `?preset=<id>` query param, matching `handleStroke`'s shape in `src/server/routes/stroke.ts`.
- **`src/server/app.ts`** (modify) — register the new route, following the existing dispatch pattern.
- **`src/components/headache-explorer.tsx`** (new) — the page component: preset picker, metric-card visualization (intensity/duration/photophobia/phonophobia/autonomic-load/red-flag-score as numeric bars, matching `vertigo-explorer.tsx`'s `MetricCard`/`InsetCard` pattern), case mode via `CaseShell`/`CaseQuestionPanel`/`RevealPanel`/`CompareShell`/`ModuleHandoffBanner`, curriculum panel via `getCurriculumModule`, case progress via `useCaseProgress`.
- **`src/app/headache/page.tsx`** (new) — thin page wrapper rendering `<HeadacheExplorer />`, matching every other module's page file.
- **`src/lib/curriculum.ts`** (modify) — add a curriculum entry: learning goals, advanced objectives, prerequisites, linked modules, common misconceptions — matching the shape of the existing `stroke` entry.
- **`src/lib/site.ts`** (modify) — add `{ href: "/headache", label: "Headache" }` to `navItems`, and a `ModuleCard` entry to `moduleCards`.

## Data model

```ts
export interface HeadachePreset {
  id: string;
  label: string;
  frame: string;                    // one-line syndrome frame
  summary: string;                  // 1-2 sentence clinical picture
  mechanism: string;                // pathophysiology / network framing
  strongestLocalization: string;    // where/what is driving this pattern
  dominantClue: string;             // the single strongest discriminator
  weakerAlternative: string;        // why a competing diagnosis is weaker here
  historyDiscriminators: string[];  // bedside/history questions that separate this from mimics
  redFlagScore: number;             // 0-100, drives the tone/urgency visualization
  intensity: number;                // 0-100
  durationLabel: string;            // human-readable typical duration
  durationHours: number;            // numeric, for bar scaling
  photophobia: number;              // 0-100
  phonophobia: number;              // 0-100
  autonomicFeatures: number;        // 0-100 (lacrimation, ptosis, rhinorrhea — highest for cluster)
  nauseaSeverity: number;           // 0-100
  bedsideTasks: HeadacheTask[];
  teachingPearl: string;
}

export interface HeadacheTask {
  label: string;
  finding: string;
  implication: string;
}
```

`HeadacheClinicalCase` (in `src/core/cases.ts`, alongside the other module case types):

```ts
export interface HeadacheClinicalCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}
```

(`InstructionCase` already provides `id`, `title`, `oneLiner`, `chiefComplaint`, `history`, `syndromeFrame`, `examFindings`, `prompt`, `hints`, `localizationCues`, `differentialTraps`, `nextDataRequests`, `teachingPoints`, `followUpModules` — unchanged, reused as-is.)

## Content plan

**5 presets** (clinically accurate per standard migraine/headache teaching, ICHD-3-consistent framing without citing specific numeric ICHD-3 diagnostic thresholds as if they were exact quoted criteria):

1. **Migraine with aura** — unilateral throbbing headache preceded by a gradually-evolving, fully-reversible visual/sensory/speech aura (classically visual: scintillating scotoma, expanding fortification spectra); photophobia/phonophobia/nausea; aura is the dominant clue distinguishing it from TIA (gradual march and positive symptoms vs. sudden negative deficit) and from migraine without aura.
2. **Migraine without aura** — unilateral throbbing headache, moderate-severe intensity, worsened by routine physical activity, with photophobia, phonophobia, and nausea; the more common migraine phenotype; weaker-alternative discussion vs. tension-type hinges on unilaterality, throbbing quality, and associated autonomic/GI features.
3. **Tension-type headache** — bilateral, band-like/pressing (non-throbbing), mild-moderate intensity, NOT worsened by routine activity, no significant nausea, at most one of photophobia/phonophobia; dominant clue is the absence of migrainous features rather than a single positive finding.
4. **Cluster headache** — strictly unilateral, periorbital/temporal, severe-to-excruciating, short duration (15-180 min) with ipsilateral autonomic features (lacrimation, conjunctival injection, ptosis, miosis, rhinorrhea, nasal congestion) and characteristic restlessness/agitation (vs. migraine's preference to lie still); circadian/nocturnal clustering pattern; highest `autonomicFeatures` score of all presets.
5. **Secondary / thunderclap red flag** — sudden "worst headache of life" reaching maximum intensity within seconds to a minute, framed as a subarachnoid-hemorrhage mimic; teaches the SNOOP-style red-flag pattern (thunderclap onset, neurologic signs, older/new-onset, positional/precipitated, systemic symptoms) rather than a single fixed mnemonic quoted as gospel; highest `redFlagScore`.

**3 cases**: (a) a thunderclap-onset case mapping to the secondary/red-flag preset, testing whether the student correctly escalates rather than reflexively reaching for a migraine label; (b) a classic migraine-with-aura case with a visual aura vignette, testing aura-vs-TIA discrimination; (c) a cluster-headache case with the circadian/autonomic pattern, testing recognition against both migraine and trigeminal neuralgia mimics.

**Module handoffs**: `ask` (AI tutor, on every preset/case), `brain-atlas` (secondary-headache/mass-lesion localization context), `vertigo` (vestibular-migraine overlap — `vertigoPresets` already references migraine features), `sleep` (cluster headache's circadian pattern).

## Non-goals / risks

- Not a treatment/prescribing reference (see Out of scope).
- Content accuracy is the primary risk for a knowledge-heavy module like this — the plan should be reviewed for clinical accuracy before and after implementation (the user has explicitly requested a content review pass after building).
- No new shared components — `CaseShell`/`CaseQuestionPanel`/`RevealPanel`/`CompareShell`/`ModuleHandoffBanner`/`useCaseProgress`/`getCurriculumModule`/`buildCaseHandoffLinks` are all reused unmodified from existing modules.

## Verification plan

- `pnpm exec tsc --noEmit` after all edits.
- `pnpm exec vitest run` — existing suite should stay green. Note: `headache`'s closest architectural siblings (`stroke`, `cranial-nerves`, `dermatome`, `vertigo`) have no dedicated test files at all — this repo's per-module test coverage is inconsistent and only the older "atlas/overlay" style modules (e.g. `brain-atlas`) have one. Add a small `test/headache-teaching.spec.ts` anyway, matching `test/brain-atlas-teaching.spec.ts`'s lightweight referential-integrity style: assert every case's `expectedPresetId`/`startingPresetId` resolves to a real preset id, and that the curriculum entry exists.
- Visual check via a production build + Playwright screenshot of `/headache`, comparing against the established module layout (preset picker, metric cards, case mode) — same method used for the ECG bug fix and the milk-glass redesign this session.
- Content review pass (separate step after implementation, per the user's explicit request): re-read every preset and case against standard neurology teaching sources for factual accuracy, checking especially the aura-vs-TIA framing, cluster headache's autonomic features and circadian pattern, and the red-flag/thunderclap framing, and flag/fix anything imprecise or potentially misleading.
