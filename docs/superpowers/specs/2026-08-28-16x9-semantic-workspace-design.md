# 16:9 semantic workspace — design spec

## Goal

Turn Neuro Explorer from a vertically stacked collection of equal-weight panels into a high-density clinical learning workspace that uses desktop 16:9 screens deliberately. The design is for medical students preparing for exams: it must make the clinical question, decisive evidence, current choice, and next action visible together without reducing the clinical content to unexplained fragments.

## Product stance

- The primary desktop experience is a clinical workspace, not a reading page.
- The learning task is always placed ahead of background explanation.
- Semantic importance controls screen position. A student should not have to scroll past teaching metadata to see the patient data or the visual evidence needed to answer.
- Density comes from hierarchy, shorter labels, and progressive disclosure. It does not come from shrinking every font or removing rationale.
- Mobile remains a linear reading order. The desktop composition activates at `xl` width and gains only modestly at `lg` width.

## Scope

### In scope

- Shared desktop layout utilities and density tokens in `src/styles/globals.css`.
- A reusable semantic workspace composition for case-driven modules.
- The shared `CaseShell`, `CaseProgressPanel`, `CaseQuestionPanel`, and `CompareShell` components.
- The home page, Visual Field Localizer, and Brain Atlas as the first product pages to adopt the system.
- Compact labels, evidence rows, action strips, and supporting-detail disclosure patterns.

### Out of scope

- Changing the medical content, scoring logic, case data, or simulation engines.
- Reworking every specialist lab in one pass.
- Adding authentication, persistence, timers, or adaptive study logic.
- Altering clinical visualizations, their meaningful data colours, or risk semantics.

## Layout system

At `xl`, pages use a twelve-column content grid inside the existing app-stage width.

| Area | Columns | Responsibility |
| --- | ---: | --- |
| Primary workspace | 7–8 | Main image, simulation, question, or visual reasoning surface. |
| Clinical rail | 4–5 | Working diagnosis, key cues, choice controls, progress, and next action. |
| Evidence strip | full width or workspace | Short labelled rows for facts that support the current task. |
| Deep explanation | full width, after action | Teaching pearls, mechanisms, rivals, and curriculum context. |

The rail is sticky only when its content fits within the viewport; otherwise it remains in normal flow. This avoids trapping long case content in a scrollable mini-panel.

On `lg`, the grid may resolve into a 3:2 workspace/rail split. Below that it stacks in this exact semantic order: task, visual evidence, answer control, decisive findings, rationale, supporting material.

## Information hierarchy

Each learning screen follows the same five-level hierarchy:

1. **Task** — one question and the current action, visible immediately.
2. **Evidence** — the visual, exam findings, or trace needed to answer.
3. **Commitment** — the student selects an answer or changes the relevant parameter.
4. **Reasoning feedback** — the best fit, why it fits, and the most tempting rival.
5. **Reference** — learning objectives, broader teaching pearls, and related modules.

Levels 1–3 must coexist in the first 16:9 viewport on the flagship case flows. Levels 4–5 can begin immediately below it, but must not displace the decision from its evidence.

## Shared primitives

The CSS layer introduces a small vocabulary rather than a page-specific arrangement:

- `.semantic-workspace`: responsive twelve-column grid with a defined workspace and rail.
- `.semantic-workspace__main` and `.semantic-workspace__rail`: desktop placement plus mobile source order.
- `.semantic-panel`: compact nested panel with smaller padding, stronger section label, and a low-noise border.
- `.evidence-list` / `.evidence-row`: label-value rows that scan faster and consume less height than a stack of cards.
- `.action-strip`: compact selector/action area that wraps only when needed.
- `.supporting-details`: a low-emphasis disclosure pattern for hints, traps, deeper mechanisms, and curriculum notes.

These primitives use the premium dark neuro-tech token system already established in `globals.css`; they do not introduce another visual language.

## First-page application

### Home

The home screen changes from a flat three-column catalogue to a desktop learning dashboard:

- Hero: product purpose and three immediate exam-study starts.
- Main column: selected pathway or high-yield start cards.
- Rail: module count, clinical categories, and a concise “how to use this for exams” guide.
- The complete catalogue remains available below, but its card descriptions are compacted to preserve scanning speed.

### Visual Field Localizer

- Put the field map and current lesion preset in the main workspace.
- Put the syndrome frame, strongest localisation, decisive next datum, and preset selection in the clinical rail.
- Replace repeated explanation cards with an evidence list and a single expandable teaching section.
- Case mode uses the shared question layout: vignette and visual evidence on the left; answer selection, key cues, and reveal action on the right.

### Brain Atlas

- The atlas SVG stays the primary workspace.
- The current region’s summary, core functions, and clinical link form a compact semantic rail.
- Region selectors become a compact action strip below the visualization.
- Network notes and comparative anatomy follow as supporting material rather than competing with the map in the first viewport.

### Shared case components

- `CaseShell` becomes a compact task header with the case switcher aligned into an action strip.
- `CaseProgressPanel` turns its three metrics into an inline scoreline, with the reset control moved to the edge.
- `CaseQuestionPanel` groups the patient story and exam data as evidence; hints, traps, and next-data items become lower-emphasis detail blocks.
- `CompareShell` retains side-by-side reasoning but uses compact labels and keeps the decisive distinction above extended explanations.

## Accessibility and interaction

- The DOM order remains the teaching order, so keyboard and screen-reader users receive task before context.
- All controls retain visible focus states from the global style system.
- Disclosure controls use native semantic elements or correctly labelled buttons with `aria-expanded`.
- The density system preserves a minimum 16px body size and 44px minimum interactive targets where an action is isolated; compact multi-select controls may be 36px high when they remain clearly separated.
- Motion remains limited to the existing reduced-motion-safe decorative transitions.

## Testing and verification

- Typecheck and existing unit tests after implementation.
- Production build.
- Desktop checks at 1366×768, 1440×900, and 1920×1080 on home, Visual Field, and Brain Atlas; verify that the first task, evidence, and answer controls are visible without a vertical-scroll dependency.
- Responsive checks at 1024px and 390px wide; verify that the source order remains clinically sensible and controls do not overflow.
- Keyboard traversal of preset selection, case selection, reveal, and any supporting-detail disclosure.

## Acceptance criteria

- A 16:9 desktop viewport shows one coherent clinical learning task rather than a tall sequence of equally weighted cards.
- The first viewport contains the task, its decisive evidence, and the student’s response control on all three flagship flows.
- Supporting content is available but visually subordinate until needed.
- Content remains readable, accessible, and usable at mobile widths.
- Existing teaching data and deterministic module behaviour remain unchanged.
