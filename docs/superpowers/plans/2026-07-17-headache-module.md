# Headache / Migraine Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/headache` curriculum module (5 presets, 3 predict-before-reveal cases) covering primary headache disorders and secondary-headache red-flag recognition, following this app's established differential-reasoning-localizer architecture.

**Architecture:** Pure data in `src/core/headache.ts` + `src/core/cases/headache.ts`, a thin client re-export in `src/lib/headache.ts`, curriculum/nav wiring, and a page component (`src/components/headache-explorer.tsx`) that composes the shared case-mode components (`CaseShell`, `CaseQuestionPanel`, `RevealPanel`, `CompareShell`, `CaseProgressPanel`, `ModuleHandoffBanner`) exactly as `src/components/visual-field-localizer.tsx` does.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, vitest.

## Global Constraints

- No live simulation/waveform compute — this is a static differential-reasoning module, matching `stroke` and `vertigo`, not `ecg`/`eeg`.
- **Deviation from the approved spec, flagged here:** the spec proposed a `src/server/routes/headache.ts` API route matching `stroke`'s pattern. Investigation during planning found that several existing sibling modules with the identical architecture shape — `visual-field`, `vertigo`, `aphasia`, `neglect`, `gait`, `basal-ganglia` — have **no server route at all** and are registered in neither `ROUTES` nor the dispatch `switch` in `src/server/app.ts`; they serve preset/case data straight from `src/lib/*.ts` re-exports and `src/core/cases/*.ts` on the client. Since headache has no server-side compute need (no AI call, no generated waveform), this plan follows the simpler `visual-field`/`vertigo` precedent and skips the server route and `app.ts` registration entirely. If you disagree, say so before Task 1 — reversing this later only costs one small additional task (see Task 3 for exactly what a route would need).
- Cyan (`cyan-300`/`cyan-100`) is this app's interactive accent color; module chrome uses the shared `.app-surface` class — do not invent new colors or radii, reuse the classes already visible in `src/components/visual-field-localizer.tsx`.
- Content accuracy matters — every clinical claim below has been written to be standard, defensible neurology teaching content, not placeholder text. After implementation, the user has explicitly asked for a follow-up content-accuracy review pass (not part of this plan's tasks — do that afterward, separately, by re-reading the shipped content critically).
- This repo indents with **tabs** in newer files that use them (e.g. `src/server/app.ts`, `src/lib/site.ts` use tabs; `src/core/cases.ts` and `src/lib/curriculum.ts` use **2-space** indentation — check the actual file before editing, file by file, they are not uniform). The code blocks below are written to match each target file's real style; preserve it exactly when editing.

---

## File Structure

- **Create `src/core/headache.ts`** — `HeadacheTask`, `HeadachePreset` interfaces; `headachePresets` (5 items); `getHeadachePreset(id)`; `redFlagTier(score)`. Pure TypeScript, no React, no UI strings.
- **Modify `src/core/cases.ts`** — add `HeadacheClinicalCase extends InstructionCase`.
- **Create `src/core/cases/headache.ts`** — `headacheCases` (3 `HeadacheClinicalCase` items).
- **Create `src/lib/headache.ts`** — `export * from "~/core/headache";` (thin client re-export, matching `src/lib/stroke.ts`).
- **Modify `src/lib/curriculum.ts`** — add the `headache` curriculum entry.
- **Modify `src/lib/site.ts`** — add nav item + module card.
- **Create `src/components/headache-explorer.tsx`** — the page component.
- **Create `src/app/headache/page.tsx`** — thin page wrapper.
- **Create `test/headache-teaching.spec.ts`** — referential-integrity test (matching `test/brain-atlas-teaching.spec.ts`'s style).

## Interfaces

- **Produces** (for later tasks to consume):
  - `HeadacheTask { label: string; finding: string; implication: string }`
  - `HeadachePreset { id, label, frame, summary, mechanism, strongestLocalization, dominantClue, weakerAlternative, historyDiscriminators: string[], redFlagScore: number, intensity: number, durationLabel: string, durationHours: number, photophobia: number, phonophobia: number, autonomicFeatures: number, nauseaSeverity: number, bedsideTasks: HeadacheTask[], teachingPearl: string }`
  - `getHeadachePreset(id: string): HeadachePreset | undefined`
  - `redFlagTier(score: number): "low" | "moderate" | "high"` — `< 35` → `"low"`, `< 70` → `"moderate"`, else `"high"`.
  - `HeadacheClinicalCase extends InstructionCase { expectedPresetId: string; startingPresetId: string }`
  - `headacheCases: HeadacheClinicalCase[]` (3 items, ids: `"sudden-worst-headache"`, `"visual-aura-before-headache"`, `"nightly-eye-pain-with-tearing"`)

---

### Task 1: Core data model and presets

**Files:**
- Create: `src/core/headache.ts`
- Modify: `src/core/cases.ts` (add one interface at the end)

**Interfaces:**
- Produces: `HeadacheTask`, `HeadachePreset`, `headachePresets`, `getHeadachePreset`, `redFlagTier` (all consumed by Tasks 2, 4, 5); `HeadacheClinicalCase` (consumed by Task 2).

- [ ] **Step 1: Create `src/core/headache.ts`**

```ts
export interface HeadacheTask {
  label: string;
  finding: string;
  implication: string;
}

export interface HeadachePreset {
  id: string;
  label: string;
  frame: string;
  summary: string;
  mechanism: string;
  strongestLocalization: string;
  dominantClue: string;
  weakerAlternative: string;
  historyDiscriminators: string[];
  redFlagScore: number;
  intensity: number;
  durationLabel: string;
  durationHours: number;
  photophobia: number;
  phonophobia: number;
  autonomicFeatures: number;
  nauseaSeverity: number;
  bedsideTasks: HeadacheTask[];
  teachingPearl: string;
}

export const headachePresets: HeadachePreset[] = [
  {
    id: "migraine-with-aura",
    label: "Migraine with aura",
    frame:
      "Cortical spreading depression with fully reversible neurological aura",
    summary:
      "Unilateral throbbing headache preceded by a gradually evolving visual aura, typically scintillating scotoma or expanding fortification spectra, followed by photophobia, phonophobia, and nausea.",
    mechanism:
      "Cortical spreading depression - a slow wave of neuronal and glial depolarization followed by suppression - propagates across the cortex (classically occipital, producing visual aura) and is thought to activate trigeminovascular afferents, producing the headache phase.",
    strongestLocalization:
      "Occipital/visual cortex spreading depression producing a gradually marching positive visual phenomenon, not a fixed structural lesion.",
    dominantClue:
      "The aura's gradual march (5-60 minutes) and positive symptoms (scintillations, zigzag lines), not a sudden negative deficit, is what separates it from TIA.",
    weakerAlternative:
      "TIA becomes weaker when the deficit evolves gradually with positive visual phenomena rather than an abrupt negative visual field cut, and when headache and photophobia follow the aura.",
    historyDiscriminators: [
      "Aura duration 5 to 60 minutes with gradual march across the visual field",
      "Positive visual phenomena (scintillations, fortification spectra) rather than a sudden field cut",
      "Headache begins during or within 60 minutes of aura resolution",
      "Personal or family history of similar stereotyped episodes",
    ],
    redFlagScore: 15,
    intensity: 75,
    durationLabel: "4 to 72 hours untreated",
    durationHours: 24,
    photophobia: 85,
    phonophobia: 80,
    autonomicFeatures: 20,
    nauseaSeverity: 70,
    bedsideTasks: [
      {
        label: "Aura timeline",
        finding:
          "Symptoms build gradually over 5 to 60 minutes rather than appearing instantly.",
        implication:
          "A gradual march is reassuring against an acute vascular event; a sudden-onset deficit should redirect toward TIA/stroke workup.",
      },
      {
        label: "Visual phenomenology",
        finding:
          "Scintillating scotoma or fortification spectra spreading across the visual field.",
        implication:
          "Positive visual phenomena are typical of cortical spreading depression, not of an ischemic negative field cut.",
      },
      {
        label: "Headache-aura relationship",
        finding: "Headache follows the aura, usually within an hour.",
        implication:
          "An aura without any subsequent headache still counts as migraine aura but should prompt closer scrutiny if this is a first episode.",
      },
    ],
    teachingPearl:
      "A gradually marching, fully reversible positive visual phenomenon followed by headache is migraine aura until proven otherwise - but a first-ever aura after age 50, or a deficit that doesn't fully reverse, should be treated as a red flag.",
  },
  {
    id: "migraine-without-aura",
    label: "Migraine without aura",
    frame: "Recurrent unilateral throbbing headache with migrainous features",
    summary:
      "Moderate-to-severe unilateral throbbing headache lasting hours, worsened by routine physical activity, accompanied by photophobia, phonophobia, and nausea, without a preceding aura.",
    mechanism:
      "Activation and sensitization of the trigeminovascular system with meningeal vasodilation and release of vasoactive neuropeptides (e.g. CGRP), modulated by brainstem and hypothalamic pain-processing nuclei.",
    strongestLocalization:
      "Trigeminovascular system and its central modulating pathways rather than a single fixed anatomic lesion.",
    dominantClue:
      "Unilateral throbbing pain that worsens with routine activity, paired with photophobia, phonophobia, and nausea, in a patient with a stereotyped prior pattern.",
    weakerAlternative:
      "Tension-type headache becomes weaker as the pain becomes more unilateral, more throbbing, and more activity-limiting, and as nausea and photophobia become prominent rather than absent.",
    historyDiscriminators: [
      "Unilateral, throbbing quality",
      "Worsened by routine physical activity (climbing stairs, walking)",
      "Moderate to severe intensity that limits activity",
      "Associated nausea and/or photophobia and phonophobia",
      "Stereotyped recurrence pattern over months to years",
    ],
    redFlagScore: 10,
    intensity: 70,
    durationLabel: "4 to 72 hours untreated",
    durationHours: 18,
    photophobia: 75,
    phonophobia: 70,
    autonomicFeatures: 15,
    nauseaSeverity: 65,
    bedsideTasks: [
      {
        label: "Activity impact",
        finding:
          "Routine physical activity such as climbing stairs makes the pain worse.",
        implication:
          "Activity-worsening pain is a core migrainous feature that tension-type headache lacks.",
      },
      {
        label: "Associated symptom count",
        finding:
          "Nausea plus photophobia and phonophobia are present together.",
        implication:
          "The combination of GI and sensory-sensitivity features separates migraine from tension-type headache more than pain location alone.",
      },
      {
        label: "Pattern stability",
        finding: "The patient recognizes this as their usual headache pattern.",
        implication:
          "A stereotyped, recurring pattern is reassuring; a headache that has changed in character or frequency deserves red-flag screening.",
      },
    ],
    teachingPearl:
      "Migraine without aura is a clinical diagnosis built on pattern recognition - unilateral, throbbing, activity-limiting pain plus nausea or photophobia/phonophobia - not on a single defining test.",
  },
  {
    id: "tension-type",
    label: "Tension-type headache",
    frame: "Bilateral pressing headache without migrainous features",
    summary:
      "Bilateral, band-like or pressing headache of mild-to-moderate intensity, not worsened by routine activity, without significant nausea and with at most mild photophobia or phonophobia (not both).",
    mechanism:
      "Thought to involve peripheral myofascial nociception (pericranial muscle tenderness) in episodic cases and central pain-processing sensitization in chronic/frequent cases, distinct from the vascular/trigeminal mechanism of migraine.",
    strongestLocalization:
      "Diffuse pericranial myofascial and central pain-modulation pathways rather than a lateralized vascular process.",
    dominantClue:
      "Bilateral, non-throbbing, pressing quality that does not limit routine activity and lacks significant nausea.",
    weakerAlternative:
      "Migraine without aura is weaker when the pain stays bilateral and pressing rather than unilateral and throbbing, and when the patient can continue routine activity without significant nausea.",
    historyDiscriminators: [
      "Bilateral location, band-like or pressing (non-pulsatile) quality",
      "Mild to moderate intensity that does not prevent routine activity",
      "No significant nausea or vomiting",
      "At most one of photophobia or phonophobia, not both",
      "Often associated with stress or pericranial muscle tenderness",
    ],
    redFlagScore: 8,
    intensity: 40,
    durationLabel: "30 minutes to 7 days",
    durationHours: 6,
    photophobia: 25,
    phonophobia: 25,
    autonomicFeatures: 5,
    nauseaSeverity: 10,
    bedsideTasks: [
      {
        label: "Pain quality and distribution",
        finding:
          "Bilateral pressing or band-like discomfort rather than unilateral throbbing.",
        implication:
          "Bilateral, non-pulsatile pain is the single strongest feature pulling the diagnosis away from migraine.",
      },
      {
        label: "Activity tolerance",
        finding: "The patient can continue routine activity despite the headache.",
        implication:
          "Preserved function during the headache argues against migraine, which characteristically worsens with activity.",
      },
      {
        label: "Pericranial palpation",
        finding:
          "Tenderness to palpation over the frontalis, temporalis, or trapezius muscles.",
        implication:
          "Pericranial tenderness supports a myofascial contribution, though its absence does not exclude tension-type headache.",
      },
    ],
    teachingPearl:
      "Tension-type headache is defined as much by what is absent - no significant nausea, no activity limitation, no severe unilateral throbbing - as by what is present.",
  },
  {
    id: "cluster-headache",
    label: "Cluster headache",
    frame: "Trigeminal autonomic cephalalgia with strictly unilateral periorbital pain",
    summary:
      "Excruciating strictly unilateral periorbital or temporal pain lasting 15 to 180 minutes, accompanied by ipsilateral autonomic features (lacrimation, conjunctival injection, ptosis, miosis, rhinorrhea, nasal congestion), with the patient restless or agitated rather than lying still, often in clusters with circadian or nocturnal timing.",
    mechanism:
      "Hypothalamic activation (linked to the circadian pattern) driving trigeminal-autonomic reflex activation via the trigeminocervical complex and cranial parasympathetic outflow, producing the ipsilateral autonomic signs alongside severe trigeminal pain.",
    strongestLocalization:
      "Trigeminal-autonomic reflex arc with hypothalamic circadian pacemaker involvement, ipsilateral to the pain.",
    dominantClue:
      "Strictly unilateral periorbital pain with ipsilateral autonomic signs and restlessness or agitation, occurring in a clustering, often nocturnal pattern.",
    weakerAlternative:
      "Migraine becomes weaker when the attacks are much shorter (minutes, not hours), strictly unilateral and side-locked, accompanied by prominent ipsilateral autonomic signs, and the patient paces or rocks rather than seeking a dark, still room.",
    historyDiscriminators: [
      "Strictly unilateral, periorbital/temporal, always the same side within a cluster bout",
      "Duration 15 to 180 minutes per attack, untreated",
      "Ipsilateral autonomic signs: lacrimation, conjunctival injection, ptosis, miosis, rhinorrhea, or nasal congestion",
      "Restlessness or agitation during the attack rather than lying still",
      "Clustering pattern with circadian or nocturnal predominance, remission periods between bouts",
    ],
    redFlagScore: 20,
    intensity: 95,
    durationLabel: "15 to 180 minutes per attack, clustering over weeks",
    durationHours: 1,
    photophobia: 40,
    phonophobia: 35,
    autonomicFeatures: 90,
    nauseaSeverity: 30,
    bedsideTasks: [
      {
        label: "Autonomic sign check",
        finding:
          "Ipsilateral tearing, conjunctival redness, eyelid droop, or nasal congestion on the same side as the pain.",
        implication:
          "Prominent ipsilateral autonomic signs are the hallmark that separates trigeminal autonomic cephalalgias from migraine.",
      },
      {
        label: "Behavior during attack",
        finding:
          "The patient paces, rocks, or presses on the head rather than lying still in a dark room.",
        implication:
          "Restlessness during severe unilateral pain is a classic cluster-headache behavioral clue, opposite to migraine's still, quiet-room preference.",
      },
      {
        label: "Attack timing pattern",
        finding:
          "Attacks cluster over weeks with a similar time of day, often waking the patient at night.",
        implication:
          "Circadian clustering points toward hypothalamic involvement and is rarely seen in migraine or tension-type headache.",
      },
    ],
    teachingPearl:
      "When severe unilateral pain comes with ipsilateral autonomic signs and a restless, pacing patient, think trigeminal autonomic cephalalgia - cluster headache is the prototype, and its brief duration and clustering pattern are what set it apart from migraine.",
  },
  {
    id: "thunderclap-red-flag",
    label: "Thunderclap headache (secondary red flag)",
    frame:
      "Sudden maximal-intensity headache requiring urgent exclusion of subarachnoid hemorrhage and other dangerous secondary causes",
    summary:
      "Headache reaching maximal intensity within seconds to a minute - the 'worst headache of life' - framed as a subarachnoid hemorrhage mimic, with any new neurologic sign, altered consciousness, or exertional/positional trigger raising urgency further.",
    mechanism:
      "Not a single mechanism - thunderclap onset is a presentation pattern that can reflect subarachnoid hemorrhage, cerebral venous sinus thrombosis, reversible cerebral vasoconstriction syndrome, cervical artery dissection, or (after those are excluded) a primary thunderclap headache; the teaching point is the onset pattern itself, which demands urgent structural and vascular exclusion before any benign label is applied.",
    strongestLocalization:
      "No fixed localization - the pattern (sudden maximal-intensity onset) is what places this in the 'must-exclude-secondary-cause' category, not a specific anatomic site.",
    dominantClue:
      "Time-to-maximal-intensity of seconds to about a minute, described as the worst or a distinctly different headache from the patient's usual pattern.",
    weakerAlternative:
      "Migraine and other primary headaches become far weaker whenever the onset is truly abrupt (seconds, not minutes-to-hours) or the headache is described as clearly different from the patient's typical pattern - those features should not be explained away as 'just a bad migraine' until secondary causes are excluded.",
    historyDiscriminators: [
      "Time-to-maximal intensity of seconds to about a minute",
      "Description as 'the worst headache of my life' or clearly different from usual headaches",
      "New neurologic signs: neck stiffness, altered consciousness, focal deficit, seizure",
      "Onset during exertion, Valsalva, or sexual activity",
      "New headache after age 50, or in pregnancy/postpartum",
    ],
    redFlagScore: 95,
    intensity: 98,
    durationLabel: "Reaches maximal intensity within seconds to about a minute",
    durationHours: 2,
    photophobia: 50,
    phonophobia: 45,
    autonomicFeatures: 15,
    nauseaSeverity: 75,
    bedsideTasks: [
      {
        label: "Onset timing",
        finding:
          "The patient reports the pain reached its worst point within seconds to roughly a minute.",
        implication:
          "Time-to-maximal-intensity, not pain severity alone, is the discriminator that should trigger urgent secondary-headache workup.",
      },
      {
        label: "Meningismus and neuro exam",
        finding:
          "Neck stiffness, photophobia out of proportion to a typical migraine, or any new focal deficit.",
        implication:
          "Any of these substantially raises concern for subarachnoid hemorrhage or another structural cause and should not be attributed to migraine without exclusion.",
      },
      {
        label: "Trigger context",
        finding: "Onset during exertion, straining, or sexual activity.",
        implication:
          "Exertional or Valsalva-associated onset is classically associated with subarachnoid hemorrhage and reversible cerebral vasoconstriction syndrome.",
      },
    ],
    teachingPearl:
      "The single most important discriminator in headache medicine is not how severe the pain is, but how fast it got there - a headache that is maximal within seconds to a minute is a thunderclap headache until proven otherwise, regardless of how it later behaves.",
  },
];

export function getHeadachePreset(id: string): HeadachePreset | undefined {
  return headachePresets.find((preset) => preset.id === id);
}

export function redFlagTier(score: number): "low" | "moderate" | "high" {
  if (score < 35) {
    return "low";
  }

  if (score < 70) {
    return "moderate";
  }

  return "high";
}
```

- [ ] **Step 2: Add `HeadacheClinicalCase` to `src/core/cases.ts`**

Open `src/core/cases.ts`. It uses 2-space indentation. Find the last interface in the file:

```ts
export interface DermatomeClinicalCase extends InstructionCase {
  expectedLesionId: string;
  startingLesionId: string;
}
```

Add immediately after it (end of file):

```ts

export interface HeadacheClinicalCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean). (`src/core/headache.ts` is not imported anywhere yet, so this only confirms the new file and the `cases.ts` addition are syntactically and structurally valid TypeScript.)

- [ ] **Step 4: Commit**

```bash
git add src/core/headache.ts src/core/cases.ts
git commit -m "feat: add headache module data model and clinical presets"
```

---

### Task 2: Case data

**Files:**
- Create: `src/core/cases/headache.ts`

**Interfaces:**
- Consumes: `HeadacheClinicalCase` (Task 1, from `~/core/cases`).
- Produces: `headacheCases: HeadacheClinicalCase[]` (consumed by Task 5's component and Task 5's test).

- [ ] **Step 1: Create `src/core/cases/headache.ts`**

```ts
import type { HeadacheClinicalCase } from "~/core/cases";

export const headacheCases: HeadacheClinicalCase[] = [
  {
    id: "sudden-worst-headache",
    title: "Sudden 'worst headache of my life' during exertion",
    oneLiner:
      "A 44-year-old develops instantaneous, maximal-intensity headache while lifting weights, with neck stiffness on exam.",
    chiefComplaint:
      "It felt like someone hit me in the back of the head. It was the worst pain I've ever had, and it was full-blown within seconds.",
    history:
      "Onset during a heavy deadlift. Pain reached maximal intensity almost immediately. Brief loss of awareness reported by a gym partner. No prior history of similar headaches. No fever.",
    syndromeFrame:
      "Thunderclap onset (seconds to maximal intensity) plus exertional trigger plus transient loss of awareness is the classic subarachnoid hemorrhage presentation until proven otherwise - this pattern, not the pain severity alone, is what demands urgent neuroimaging and, if CT is negative, further workup.",
    examFindings: [
      "Neck stiffness (nuchal rigidity) on exam",
      "Photophobia",
      "No focal motor or sensory deficit",
      "Alert but appears distressed",
      "Blood pressure mildly elevated",
    ],
    prompt:
      "Why does the speed of onset matter more than the severity of pain here, and what does the exertional trigger add to your concern?",
    hints: [
      "Compare time-to-maximal-intensity here with how migraine or tension-type headaches typically build.",
      "Think about what structural event an exertional/Valsalva trigger with sudden severe head pain classically produces.",
    ],
    localizationCues: [
      "Seconds-to-maximal-intensity onset points to a vascular/structural event, not a primary headache disorder.",
      "Nuchal rigidity suggests meningeal irritation, consistent with subarachnoid blood.",
    ],
    differentialTraps: [
      "Do not label this 'a bad migraine' because the patient has had headaches before - the onset pattern here is categorically different from a prior stereotyped pattern.",
      "A normal neurologic exam does not exclude subarachnoid hemorrhage; the onset pattern alone is enough to mandate urgent imaging.",
    ],
    nextDataRequests: [
      "Non-contrast CT head immediately",
      "If CT negative and clinical suspicion remains, lumbar puncture (looking for xanthochromia) or CT angiography per local protocol",
      "Blood pressure management and neurosurgical consultation if hemorrhage confirmed",
    ],
    teachingPoints: [
      "Time-to-maximal-intensity, not pain severity, is the single most important historical discriminator for thunderclap headache.",
      "Exertional or Valsalva-associated onset raises concern specifically for subarachnoid hemorrhage and reversible cerebral vasoconstriction syndrome.",
      "A first severe headache in a patient without a prior headache history should never be assumed to be a primary headache disorder.",
    ],
    followUpModules: ["brain-atlas", "ask"],
    expectedPresetId: "thunderclap-red-flag",
    startingPresetId: "migraine-without-aura",
  },
  {
    id: "visual-aura-before-headache",
    title: "Zigzag lights before a one-sided throbbing headache",
    oneLiner:
      "A 27-year-old reports a slowly expanding shimmering zigzag pattern in her vision for 25 minutes, followed by a right-sided throbbing headache with light sensitivity.",
    chiefComplaint:
      "I see these shimmering zigzag lines that slowly spread across my vision, and then about 20 minutes later I get this awful throbbing headache on one side.",
    history:
      "Episodes recur roughly monthly, always with the same visual pattern preceding the headache. Visual symptoms last 20 to 30 minutes and gradually enlarge before resolving completely. Headache follows within an hour, right-sided, throbbing, worse with activity, with nausea and photophobia. No headache-free visual episodes. Family history of similar episodes in her mother.",
    syndromeFrame:
      "A visual aura that gradually marches and expands over 20 to 30 minutes, is fully reversible, and is followed by a typical migrainous headache is migraine with aura - the gradual, positive, fully-reversible nature of the visual phenomenon is what separates this from a vascular event like TIA or ocular pathology.",
    examFindings: [
      "Normal visual acuity and visual fields between episodes",
      "Normal fundoscopic exam",
      "No focal neurologic deficit",
      "Normal cranial nerve exam",
    ],
    prompt:
      "What features of this visual phenomenon argue for migraine aura over a TIA, and why does the stereotyped, recurring pattern matter?",
    hints: [
      "Consider the timeline: how fast did the visual symptom appear, and did it grow or spread?",
      "Positive phenomena (shimmering, zigzag lines) versus negative phenomena (a blank or missing area) point in different directions.",
    ],
    localizationCues: [
      "A gradually marching, expanding positive visual phenomenon over 20 to 30 minutes is characteristic of cortical spreading depression, not embolic occlusion.",
      "Full, complete resolution of the visual symptom before headache onset supports a functional (spreading depression) rather than ischemic process.",
    ],
    differentialTraps: [
      "Do not dismiss recurrent stereotyped visual auras as anxiety or eye strain without considering migraine.",
      "Do not assume every visual aura needs an urgent stroke workup - the gradual march and positive quality, plus a stereotyped recurring pattern, are reassuring, though a first-ever aura or one that behaves differently deserves more scrutiny.",
    ],
    nextDataRequests: [
      "Detailed headache diary to confirm the stereotyped pattern",
      "Ophthalmologic exam if this is a new or atypical visual symptom",
      "Vascular risk factor assessment if the pattern changes or red flags emerge",
    ],
    teachingPoints: [
      "Migraine aura is defined by gradual onset (5 to 60 minutes), positive phenomena, and full reversibility - all three matter, not just the visual symptom itself.",
      "A stereotyped, recurring aura pattern with a family history is reassuring for migraine, but any change in pattern should prompt reassessment.",
      "Aura can occur with or without a subsequent headache, and either presentation is still classified as migraine aura.",
    ],
    followUpModules: ["vision", "visual-field", "ask"],
    expectedPresetId: "migraine-with-aura",
    startingPresetId: "migraine-without-aura",
  },
  {
    id: "nightly-eye-pain-with-tearing",
    title: "Nightly excruciating eye pain with tearing and restlessness",
    oneLiner:
      "A 38-year-old man reports three weeks of nightly, severe one-sided eye pain lasting about 45 minutes, with tearing and a droopy eyelid, during which he paces the room.",
    chiefComplaint:
      "It's always the same eye, always around 2am, and it's so bad I can't sit still - I have to get up and pace or I feel like I'll lose my mind.",
    history:
      "Nightly attacks for three weeks, always right-sided, periorbital, lasting 30 to 60 minutes, resolving spontaneously. During attacks: right eye tearing, redness, and a droopy eyelid, plus nasal congestion on the right. No visual aura. No significant nausea. Between attacks he feels entirely normal. A similar bout occurred about a year ago, also lasting several weeks, then resolved completely for months.",
    syndromeFrame:
      "Strictly unilateral, brief, severe periorbital attacks with ipsilateral autonomic signs (tearing, ptosis, nasal congestion), a restless or agitated behavior pattern, and circadian clustering with a prior remitting-relapsing bout is the classic presentation of episodic cluster headache - a trigeminal autonomic cephalalgia, not migraine.",
    examFindings: [
      "Mild right ptosis and miosis interictally (partial Horner-like findings can persist between attacks in some patients)",
      "Normal visual acuity and visual fields",
      "No focal motor or sensory deficit",
      "Normal extraocular movements",
    ],
    prompt:
      "What combination of features here points to a trigeminal autonomic cephalalgia rather than migraine, and why does the patient's behavior during the attack matter?",
    hints: [
      "Compare the attack duration and the presence of ipsilateral autonomic signs to what you'd expect from migraine.",
      "Think about what a patient does during a migraine attack versus what this patient is doing.",
    ],
    localizationCues: [
      "Ipsilateral autonomic signs (tearing, ptosis, nasal congestion) localize to trigeminal-autonomic reflex activation, not a purely cortical process.",
      "The circadian, clustering pattern implicates hypothalamic involvement in triggering the bouts.",
    ],
    differentialTraps: [
      "Do not label this migraine because it is severe and one-sided - the short duration, ipsilateral autonomic signs, and restlessness argue strongly against migraine.",
      "Do not mistake the interictal ptosis/miosis for a new structural lesion without correlating it to the classic cluster pattern; however, a first presentation like this still warrants imaging to exclude a structural mimic before settling on the diagnosis.",
    ],
    nextDataRequests: [
      "MRI brain (with attention to the pituitary/cavernous sinus region) to exclude a structural mimic, especially given interictal findings",
      "Headache diary to confirm clustering pattern and circadian timing",
      "Consider a high-flow oxygen trial for acute attacks, which is classically effective in cluster headache",
    ],
    teachingPoints: [
      "Cluster headache attacks are short (15 to 180 minutes) compared to migraine's hours, which is one of the most useful timing discriminators.",
      "Ipsilateral autonomic signs plus restlessness or agitation during the attack are the behavioral and exam hallmarks of trigeminal autonomic cephalalgias.",
      "A structural mimic should be excluded on first presentation of a trigeminal autonomic cephalalgia pattern, even when the history is classic.",
    ],
    followUpModules: ["cranial-nerves", "sleep", "ask"],
    expectedPresetId: "cluster-headache",
    startingPresetId: "migraine-with-aura",
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add src/core/cases/headache.ts
git commit -m "feat: add headache module clinical cases"
```

---

### Task 3: Client re-export, curriculum entry, nav/site wiring

**Files:**
- Create: `src/lib/headache.ts`
- Modify: `src/lib/curriculum.ts`
- Modify: `src/lib/site.ts`

**Interfaces:**
- Consumes: everything from Task 1 (`src/core/headache.ts` exports).
- Produces: `~/lib/headache` re-export (consumed by Task 5); the `headache` curriculum entry retrievable via `getCurriculumModule("headache")` (consumed by Task 5); nav item and module card (no code consumes these directly — they render on `/` and in `AppShell`).

- [ ] **Step 1: Create `src/lib/headache.ts`**

```ts
export * from "~/core/headache";
```

- [ ] **Step 2: Add the curriculum entry to `src/lib/curriculum.ts`**

This file uses 2-space indentation. Find the end of the file:

```ts
    commonMisconceptions: [
      "Numbness always means a peripheral nerve problem — spinal, brainstem, thalamic, and cortical lesions all cause numbness.",
      "The Romberg test detects cerebellar disease — it detects proprioceptive loss.",
      "Dissociated sensory loss is rare — it is common and highly localizing (cord, brainstem).",
    ],
  },
];

export function getCurriculumModule(slug: string) {
  return curriculumModules.find((module) => module.slug === slug);
}
```

Replace with (adds a new entry before the closing `];`, leaves `getCurriculumModule` untouched):

```ts
    commonMisconceptions: [
      "Numbness always means a peripheral nerve problem — spinal, brainstem, thalamic, and cortical lesions all cause numbness.",
      "The Romberg test detects cerebellar disease — it detects proprioceptive loss.",
      "Dissociated sensory loss is rare — it is common and highly localizing (cord, brainstem).",
    ],
  },
  {
    slug: "headache",
    title: "Headache & Migraine Localizer",
    trainingStage: "Primary headache and red-flag recognition",
    learningGoals: [
      "Differentiate migraine, tension-type, and cluster headache using history and associated features",
      "Recognize thunderclap onset and other red flags that mandate urgent secondary-headache workup",
      "Use the timing, quality, and associated-symptom pattern of a headache to build a differential before naming a diagnosis",
    ],
    advancedObjectives: [
      "Distinguish migraine aura from TIA using onset speed, symptom polarity (positive vs negative), and full reversibility.",
      "Recognize the ipsilateral autonomic signs and restless behavior that separate cluster headache from migraine.",
      "Treat time-to-maximal-intensity, not pain severity alone, as the decisive discriminator for thunderclap headache.",
    ],
    prerequisites: ["Basic neuroanatomy"],
    linkedModules: ["ask", "brain-atlas", "vertigo", "sleep"],
    commonMisconceptions: [
      "All severe headaches are migraines — cluster headache and secondary causes can be just as severe or more severe.",
      "A normal neurologic exam excludes subarachnoid hemorrhage — the onset pattern alone can mandate urgent imaging.",
      "Migraine aura is always visual — sensory and speech auras occur too, and the defining features are the gradual march, positive phenomena, and full reversibility, not the modality.",
    ],
  },
];

export function getCurriculumModule(slug: string) {
  return curriculumModules.find((module) => module.slug === slug);
}
```

- [ ] **Step 3: Add nav item to `src/lib/site.ts`**

This file uses tabs. Find:

```ts
	{ href: "/sleep", label: "Sleep" },
	{ href: "/ask", label: "Ask" },
] as const;
```

Replace with:

```ts
	{ href: "/sleep", label: "Sleep" },
	{ href: "/headache", label: "Headache" },
	{ href: "/ask", label: "Ask" },
] as const;
```

- [ ] **Step 4: Add module card to `src/lib/site.ts`**

Find the last entry in `moduleCards` (the `sleep` entry, immediately before the closing `];`):

```ts
  {
    slug: "sleep",
    title: "Sleep Architecture",
    description:
      "Hypnogram generation with realistic stage cycling, EEG characteristics per stage, and clinical sleep disorder presets from narcolepsy to RBD.",
    badge: "Sleep Medicine",
    href: "/sleep",
  },
];
```

Replace with:

```ts
  {
    slug: "sleep",
    title: "Sleep Architecture",
    description:
      "Hypnogram generation with realistic stage cycling, EEG characteristics per stage, and clinical sleep disorder presets from narcolepsy to RBD.",
    badge: "Sleep Medicine",
    href: "/sleep",
  },
  {
    slug: "headache",
    title: "Headache & Migraine Localizer",
    description:
      "Differentiate migraine, tension-type, and cluster headache through bedside history patterns, then practice recognizing the thunderclap red flags that mandate urgent secondary-headache workup.",
    badge: "Primary Headache",
    href: "/headache",
  },
];
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
git add src/lib/headache.ts src/lib/curriculum.ts src/lib/site.ts
git commit -m "feat: wire headache module into curriculum and site metadata"
```

---

### Task 4: Page component

**Files:**
- Create: `src/components/headache-explorer.tsx`

**Interfaces:**
- Consumes: `headachePresets`, `getHeadachePreset`, `redFlagTier`, `type HeadachePreset` (from `~/lib/headache`, Task 1/3); `headacheCases` (from `~/core/cases/headache`, Task 2); `getCurriculumModule` (from `~/lib/curriculum`, Task 3); `useCaseProgress` (from `~/lib/case-progress`, pre-existing); `buildCaseHandoffLinks` (from `~/lib/case-handoff`, pre-existing); `CaseShell`, `CaseQuestionPanel`, `CaseProgressPanel`, `RevealPanel`, `CompareShell`, `ModuleHandoffBanner` (pre-existing shared components, same imports as `src/components/visual-field-localizer.tsx`).
- Produces: `HeadacheExplorer` React component (consumed by Task 5's page wrapper).

- [ ] **Step 1: Create `src/components/headache-explorer.tsx`**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean). This is the step most likely to reveal a mismatch — pay attention to prop-shape errors from `CaseShell`/`CaseQuestionPanel`/`RevealPanel`/`CompareShell`/`CaseProgressPanel`; if any prop name doesn't match, open the actual component file under `src/components/` to confirm its real prop names before guessing.

- [ ] **Step 3: Commit**

```bash
git add src/components/headache-explorer.tsx
git commit -m "feat: add headache explorer page component"
```

---

### Task 5: Page route and test

**Files:**
- Create: `src/app/headache/page.tsx`
- Create: `test/headache-teaching.spec.ts`

**Interfaces:**
- Consumes: `HeadacheExplorer` (Task 4); `headachePresets`, `getHeadachePreset` (Task 1, via `~/core/headache`); `headacheCases` (Task 2, via `~/core/cases/headache`); `getCurriculumModule` (Task 3, via `~/lib/curriculum`).

- [ ] **Step 1: Create `src/app/headache/page.tsx`**

```tsx
import { HeadacheExplorer } from "~/components/headache-explorer";

export default function HeadachePage() {
  return <HeadacheExplorer />;
}
```

- [ ] **Step 2: Create `test/headache-teaching.spec.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { getHeadachePreset, headachePresets } from '../src/core/headache';
import { headacheCases } from '../src/core/cases/headache';
import { getCurriculumModule } from '../src/lib/curriculum';

describe('headache teaching layer', () => {
	it('keeps every case wired to valid presets', () => {
		const presetIds = new Set(headachePresets.map((preset) => preset.id));

		for (const clinicalCase of headacheCases) {
			expect(presetIds.has(clinicalCase.expectedPresetId)).toBe(true);
			expect(presetIds.has(clinicalCase.startingPresetId)).toBe(true);
		}
	});

	it('allows presets to be retrieved by id', () => {
		expect(getHeadachePreset('migraine-with-aura')?.label).toContain('Migraine with aura');
		expect(getHeadachePreset('cluster-headache')?.autonomicFeatures).toBeGreaterThan(80);
		expect(getHeadachePreset('thunderclap-red-flag')?.redFlagScore).toBeGreaterThan(90);
		expect(getHeadachePreset('does-not-exist')).toBeUndefined();
	});

	it('registers the module in the curriculum', () => {
		const module = getCurriculumModule('headache');

		expect(module?.title).toContain('Headache');
		expect(module?.linkedModules).toContain('ask');
	});

	it('gives every case a title, prompt, and at least one hint', () => {
		for (const clinicalCase of headacheCases) {
			expect(clinicalCase.title.length).toBeGreaterThan(0);
			expect(clinicalCase.prompt.length).toBeGreaterThan(0);
			expect(clinicalCase.hints.length).toBeGreaterThan(0);
		}
	});
});
```

This file uses tabs, matching `test/brain-atlas-teaching.spec.ts`'s indentation — check that file's real indentation before saving if your editor auto-converts.

- [ ] **Step 3: Run the new test**

Run: `pnpm exec vitest run test/headache-teaching.spec.ts`
Expected: `4 tests`, all passing.

- [ ] **Step 4: Typecheck and full suite**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

Run: `pnpm exec vitest run`
Expected: all tests pass except the one pre-existing, unrelated failure in `test/basal-ganglia-teaching.spec.ts` (a simulation-math assertion that also fails on a clean `main` checkout — not caused by this work).

- [ ] **Step 5: Commit**

```bash
git add src/app/headache/page.tsx test/headache-teaching.spec.ts
git commit -m "feat: add headache page route and teaching-layer test"
```

---

### Task 6: Visual verification

**Files:** none (verification only)

**Interfaces:** none.

This repo has no automated visual-regression suite. Verify with a real production-build render, same method used for the ECG bug fix and the milk-glass redesign earlier this session.

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: prints `✓ Generating static pages (N/N)` including a new `/headache` route in the output. (This sandbox has previously shown an unrelated `sharp`/`EACCES` failure at the final "Collecting build traces" step on some runs — that's fine as long as static page generation completed.)

- [ ] **Step 2: Serve the build on a free port**

Run (background): `pnpm exec next start -p 3103`
Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3103/headache` returns `200`.

- [ ] **Step 3: Screenshot `/headache` and check it against the design intent**

Using Playwright (`browser_navigate` to `http://localhost:3103/headache`, `browser_resize` to 1920x1200, `browser_take_screenshot` with `fullPage: true`), confirm:
- Hero, preset picker, syndrome-frame panel, and metric-bar panel all render without layout breakage.
- Clicking through all 5 presets updates the syndrome frame, metric bars, and teaching pearl.
- The Compare panel's dropdown lets you pick any other preset and updates both sides.
- Case Mode: switching between the 3 cases resets the working-pattern selection; clicking "Reveal diagnosis" shows the `RevealPanel` and a second `CompareShell` with the student's pick versus the target preset; the correct/incorrect state matches whether the selected preset id equals the case's `expectedPresetId`.
- The "Where to go next" handoff section renders `brain-atlas`, `vertigo`, `sleep`, and `ask` cards.

- [ ] **Step 4: Confirm nav and home page**

Screenshot `/` and confirm the sidebar now shows a "Headache" nav item and the module grid shows the new "Headache & Migraine Localizer" card with the "Primary Headache" badge.

- [ ] **Step 5: Stop the preview server**

Stop the background `next start` task from Step 2 and free the port.

---

## Non-Goals (this plan)

- Treatment/prescribing content (abortive or preventive medication selection, dosing) — explicitly out of scope per the design spec.
- The other four previously-identified curriculum gaps (autonomic dysfunction, NMJ/peripheral nerve/myopathy, memory/dementia, spinal cord syndromes) — separate future spec→plan cycles.
- A dedicated `/api/headache` server route — see the Global Constraints deviation note above; add one later only if a real server-side need emerges (e.g. if this module ever needs AI-tutor-style dynamic generation).
