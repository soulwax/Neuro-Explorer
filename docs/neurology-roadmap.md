# Neurology Product Roadmap

## Goal

Move Neuro Explorer from a collection of strong mechanism demos to a true neurology teaching platform.

The next step is not adding random modules. The next step is adding instructional structure:

- prediction before reveal
- lesion and pathology presets
- case-based reasoning
- cross-module handoff between anatomy, physiology, and symptoms
- feedback that evaluates reasoning, not just answers

## Current Strengths

- Interactive simulations already exist for anatomy, neurons, retina, plasticity, dopamine, ECG, navigation, and AI tutoring.
- Shared TypeScript simulation cores make new teaching layers practical.
- The app already has a stable App Router and internal `/api/*` contract, so new modules can reuse one consistent architecture.

## Main Gaps

The current app is strong at "change a parameter and see what happens."

It is weaker at:

- clinical localization
- pathology comparison
- exam-style reasoning
- forcing hypothesis formation before explanation
- connecting one module to another in a meaningful teaching flow

## Product Priorities

### 1. Case-Based Reasoning Layer

Every major module should support a structured teaching flow:

1. present a vignette
2. ask the student to predict the physiology or lesion
3. let the student explore the simulator
4. reveal the explanation only after the prediction step
5. score the reasoning in terms of anatomy, physiology, localization, and clinical inference

This is the highest-value product feature because it upgrades the whole platform, not just one module.

### 2. Compare Mode

Each module should support side-by-side viewing for:

- normal vs pathology
- left lesion vs right lesion
- low vagal vs high sympathetic state
- intact pathway vs interrupted pathway

The compare view should use synchronized controls where possible and highlight the smallest set of parameters that explain the difference.

### 3. Lesion and Pathology Presets

Every module should ship with named teaching presets rather than only raw parameter controls.

Examples:

- `retina`: optic neuritis, glaucoma, retinal detachment, papilledema
- `vision`: hemianopia, neglect, agnosia, prosopagnosia, dorsal-stream failure
- `neuron`: demyelination, sodium-channel block, increased refractory period
- `dopamine`: Parkinsonian dopamine loss, medication-on state, reward omission uncertainty
- `plasticity`: impaired LTP, maladaptive pain sensitization, addiction-biased learning
- `ecg`: high vagal tone, sympathetic surge, dysautonomia, neurogenic cardiac stress

### 4. Tutor Scoring Instead of Tutor Chat Only

The AI tutor should evaluate student reasoning using a rubric instead of only generating explanations.

Suggested rubric dimensions:

- anatomy
- mechanism
- localization
- symptom interpretation
- confidence calibration

### 5. Cross-Module Pathways

The best teaching moments happen when one module can hand off into the next.

Recommended handoffs:

- `retina` -> `vision` -> `brain-atlas`
- `dopamine` -> `plasticity`
- `neuron` -> future `EEG`
- `brain-atlas` -> future `stroke-localizer`
- `ecg` -> future `autonomic-lab`

## Next 5 Modules

### 1. Visual Field Localizer

Why first:

- extremely high neurology yield
- naturally connects retina, vision, and anatomy
- easy to teach lesion localization
- visually intuitive and highly testable

Should include:

- monocular vs binocular defects
- optic nerve, chiasm, tract, radiations, occipital lesions
- neglect vs true field loss
- compare mode between lesion sites
- handoff into brain atlas

### 2. Stroke Syndromes Localizer

Why second:

- probably the highest-value bedside reasoning module in the app
- ideal for case mode
- maps symptoms directly onto vascular territories and anatomy

Should include:

- MCA, ACA, PCA, brainstem, lacunar patterns
- cortical vs subcortical signs
- visual, motor, sensory, language, neglect combinations
- localization confidence scoring

### 3. Cranial Nerve Exam Simulator

Why third:

- directly useful for students and junior trainees
- naturally structured around exam findings and lesion localization

Should include:

- pupils, ptosis, diplopia, facial weakness, hearing/balance, dysphagia, tongue deviation
- nuclear vs peripheral lesions
- multi-nerve syndromes

### 4. Basal Ganglia Loop Explorer

Why fourth:

- ties directly into the existing dopamine module
- gives a clearer bridge from reinforcement learning to movement disorders

Should include:

- direct vs indirect pathway balance
- dopamine depletion
- medication-on/off state
- bradykinesia, rigidity, hyperkinesia framing

### 5. EEG Rhythm and Seizure Explorer

Why fifth:

- very impressive visually
- high clinical relevance
- complements neuron-level and network-level teaching

Should include:

- normal rhythms by state
- focal vs generalized seizure patterns
- post-ictal slowing
- artifact vs pathology comparison

## First Implementation Target

Build the `Visual Field Localizer` first.

Reason:

- it reuses existing strengths in `retina`, `vision`, and `brain-atlas`
- it forces the platform to support lesion presets and cross-module linking
- it is clinically recognizable to students very early in training
- it can be done without needing new external AI dependencies

## Architecture Work Needed Before New Modules

### A. Case Engine

Add a shared instructional layer for cases.

Suggested files:

- `src/core/cases/*`
- `src/lib/cases.ts`
- `src/components/case-shell.tsx`
- `src/components/case-question-panel.tsx`
- `src/components/reveal-panel.tsx`

Core fields for each case:

- `id`
- `title`
- `chiefComplaint`
- `history`
- `examFindings`
- `expectedLocalization`
- `linkedModule`
- `presetId`
- `teachingPoints`

### B. Compare Shell

Add a reusable side-by-side comparison layout.

Suggested files:

- `src/components/compare-shell.tsx`
- `src/components/parameter-diff.tsx`

Use this in `retina`, `vision`, `ecg`, and future lesion-based modules.

### C. Tutor Evaluation Endpoint

Extend the existing tutor surface so it can score student reasoning.

Suggested direction:

- keep `ask` as the generic tutor
- add structured evaluation mode or a sibling route for rubric scoring
- return rubric dimensions plus short feedback

### D. Curriculum Metadata

Add a shared layer describing:

- module prerequisites
- linked downstream modules
- learning goals
- common misconceptions

Suggested file:

- `src/lib/curriculum.ts`

## Suggested Execution Order

### Phase 1. Instructional Infrastructure

- build case engine
- build compare shell
- add curriculum metadata
- extend tutor to support rubric scoring

### Phase 2. First Flagship Module

- build `Visual Field Localizer`
- connect it to `retina`, `vision`, and `brain-atlas`
- ship with lesion presets and case mode from day one

### Phase 3. Clinical Localization Expansion

- build `Stroke Syndromes Localizer`
- build `Cranial Nerve Exam Simulator`

### Phase 4. Systems and Network Teaching

- build `Basal Ganglia Loop Explorer`
- build `EEG Rhythm and Seizure Explorer`

## Definition of Success

This roadmap is working if the product starts to teach students how to think, not just what to tweak.

The app should make a student repeatedly answer:

- where is the lesion?
- what pathway failed?
- why do these symptoms cluster together?
- what would I expect to see before I reveal the answer?

That is the standard to design against.
