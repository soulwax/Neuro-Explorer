# Changelog

## [0.25.0] - 2026-03-09

### Added

- Added a shared consult-reasoning rubric to `Neuro Tutor`, plus module handoff prompt kits for `retina`, `visual-field`, `vision`, `brain-atlas`, and `ecg`.
- Added convergence overlays to `Brain Atlas` for vascular territories, visual streams, crossed brainstem logic, and frontostriatal loop reasoning.
- Added neurocritical `ECG` case mode with SAH, post-ictal, brainstem dysautonomia, and raised-pressure scenarios, plus hemodynamic-risk, monitoring-priority, and red-flag output.
- Added dedicated teaching-layer tests for `ask`, `brain-atlas`, and `ecg`.

### Changed

- Reframed `Neuro Tutor` as the shared reasoning backbone for the rest of the app rather than a standalone Q&A surface.
- Reworked `Brain Atlas` so it now functions as the anatomical convergence layer for `retina`, `visual-field`, `vision`, `ecg`, and `ask`.
- Deepened `ECG` from consult-style waveform reading into neurocritical brain-heart interpretation with explicit rival-frame comparison and reveal logic.
- Updated curriculum metadata, home-card copy, and API route descriptions to advertise the new post-clinical teaching depth.

## [0.24.0] - 2026-03-09

### Added

- Added a new consult-level `Vision` teaching layer with syndrome presets spanning posterior field-entry cortex, ventral recognition, dorsal visuospatial action, and right-parietal attention failure.
- Added case-based cortical vision localization for posterior hemianopia, prosopagnosia, achromatopsia, optic ataxia, and neglect-style attentional syndromes.
- Added typed `Vision` test coverage for syndrome presets, track assignments, and case wiring.

### Changed

- Rebuilt `Vision` so the Cloudflare AI classifier now sits inside a stronger clinical reasoning surface with compare mode, revealable cases, and pathway handoff to `retina`, `visual-field`, `brain-atlas`, and `ask`.
- Updated curriculum, site copy, and API route metadata so `Vision` now advertises dorsal-stream and attention-network reasoning instead of only ventral-stream labeling.

## [0.23.0] - 2026-03-09

### Added

- Added consult-level retina physiology presets that frame center-surround computation as the first step in visual localization rather than an isolated heatmap demo.
- Added a new neuro-ophthalmology teaching layer to `Retina`, including prechiasmal compare mode for optic neuritis, papilledema, glaucoma, retinal detachment, and macular lesions.
- Added case-based retinal and optic-disc triage with typed test coverage for preset wiring, blind-spot logic, and the expanded retina simulator summary output.

### Changed

- Reframed `Retina` from a pure receptive-field lab into a post-clinical neuro-ophthalmology module that bridges into `visual-field`, `vision`, `brain-atlas`, and `ask`.
- Updated curriculum, site copy, and API route metadata so the upgraded retina module is described in the same consult-level teaching language as the rest of the migrated app.

## [0.22.0] - 2026-03-09

### Added

- Added a new `Visual Field Localizer` module with lesion presets for optic nerve, chiasm, optic tract, radiations, occipital cortex, and parietal neglect.
- Added compare mode and consult-style case mode to the new visual-field module, including decisive next-data prompts and cross-module handoff into `retina`, `vision`, `brain-atlas`, and `ask`.
- Added a dedicated visual-field core test surface to validate preset and case wiring.

### Changed

- Integrated `Visual Field Localizer` into the main app navigation, curriculum metadata, and home surface as the first flagship localization module from the roadmap.
- Reframed the home entry point so the new visual-field module is the primary launch path instead of a hidden follow-on page.

## [0.21.0] - 2026-03-09

### Added

- Added consult-level visual syndrome teaching to `Vision`, including field-cut and ventral-stream cases with strongest localization, weaker alternatives, and decisive next-data prompts.
- Added new neurocardiac presets and consult frames to `ECG`, including neurogenic catecholamine surge, autonomic failure, and raised-ICP vagal-brake patterns.
- Added dynamic neurocardiac consult output to the ECG API, including consult pearls, mimics to avoid, and highest-yield next data.

### Changed

- Reframed `Vision` from a pure classifier walkthrough into a post-clinical localization surface tied to ventral-stream stages.
- Reframed `ECG` from a physiology-only simulator into a consult-style neurocardiac interpretation lab.
- Updated curriculum and module copy so `Vision` and `ECG` advertise the new consult-level teaching emphasis from the home surface.

## [0.20.0] - 2026-03-09

### Added

- Added canonical consult-tier tutor modes: `post-clinical`, `oral-boards`, and `consult-rounds`.
- Added new advanced tutor domains for neurovascular localization and epileptology.
- Added richer Brain Atlas teaching scaffolding with syndrome framing, decisive next-data prompts, and a crossed brainstem localization case.

### Changed

- Elevated the tutor from resident-style framing to post-clinical consult teaching, with stronger emphasis on localization hierarchy, competing alternatives, and the next datum that should re-rank the case.
- Preserved backward compatibility for older tutor links by normalizing legacy level names onto the new consult-tier vocabulary.
- Reworked Brain Atlas case mode so learners must think in syndrome grammar and confirmatory data, not just structure labels.

## [0.19.0] - 2026-03-09

### Added

- Added explicit tutor depth modes for `Neuro Tutor`: `post-medical`, `board-review`, and `case-conference`.
- Added advanced tutor domains including lesion localization, neuro-ophthalmology, movement disorders, autonomic neurocardiology, and cognitive neurology.
- Added richer Brain Atlas case metadata with localization cues and differential traps, plus new temporal and thalamic localization cases.

### Changed

- Repositioned the tutor from undergraduate framing to postgraduate neurology reasoning, with stronger emphasis on syndromic formulation, competing localizations, and conference-style follow-up questions.
- Expanded curriculum metadata across modules so each lab now carries an explicit post-medical training target and advanced objectives.
- Updated Brain Atlas case mode and home-page copy to present the atlas as a conference-level localization surface rather than a basic anatomy browser.

## [0.18.2] - 2026-03-09

### Fixed

- Switched the App Router `/api/*` handler to OpenNext's async Cloudflare context lookup so Workers AI bindings resolve reliably in Next.js server execution.
- Enabled Wrangler's remote `AI` binding for local and preview Cloudflare runs, avoiding false fallback into the REST-credential error path when the Worker binding is available.

## [0.18.1] - 2026-03-09

### Fixed

- Restored Cloudflare Workers AI execution for `Vision` and `Ask` by reintroducing the Wrangler `AI` binding and teaching the App Router backend to prefer the native Worker binding when present.
- Preserved the existing Vercel and local fallback path by keeping Cloudflare REST credentials as the non-Workers AI transport.

### Changed

- Updated local development and deployment docs to clarify that Cloudflare Workers uses the native `AI` binding, while Vercel and plain local Next.js dev use Cloudflare REST credentials.

## [0.18.0] - 2026-03-09

### Added

- Added reusable instructional infrastructure for case mode and compare mode, including shared case types, curriculum metadata, and presentation components for vignette questions, reveal panels, and side-by-side comparison.
- Added the first case-based localization workflow to `Brain Atlas`, with selectable clinical vignettes, reveal logic, and follow-up module guidance.

### Changed

- Updated the Brain Atlas experience so students can practice localization before revealing the target structure, instead of only browsing regional summaries.
- Updated the home-page module copy to surface Brain Atlas as an anatomy and case-based teaching module.

## [0.17.0] - 2026-03-09

### Added

- Added autonomic teaching presets to the ECG module, including balanced rest, high vagal tone, sympathetic surge, and orthostatic compensation.
- Added rhythm-strip landmarks and neurocardiac summary fields to the ECG API payload, including representative beat timing plus vagal, sympathetic, respiratory-coupling, and AV nodal metrics.

### Changed

- Reworked the ECG page into a neurocardiac lab with grouped slider controls, ECG-paper display toggles, a clinical sheet layout, and a full rhythm strip with annotations.
- Updated the ECG experience to frame the tracing through a brain-heart interpretation layer, including an autonomic pathway diagram and revised product copy.

## [0.16.1] - 2026-03-09

### Fixed

- Fixed Vercel production deployments serving a non-built static output by explicitly marking the repository root as a `nextjs` project in [`vercel.json`](vercel.json).
- Restored the live Vercel site so the root app and internal `/api/*` routes are served through the Next.js runtime instead of a generic static-site preset.

## [0.16.0] - 2026-03-08

### Added

- Added root App Router pages for `Grid Cell Navigator` and `12-Lead ECG Explorer`, completing the full module set inside the primary Next.js application.
- Added root server adapters under `src/server/*` so the internal `/api/*` contract now handles deterministic labs and Cloudflare AI-backed routes from the same app boundary.

### Changed

- Promoted the Next.js application to the repository root and updated local development, verification, and deployment flows around a single app for Vercel and Cloudflare Workers.
- Updated the active UI, navigation, and metadata so the product now presents itself as a finished Next.js application rather than a migration track.
- Updated tests, type checking, and Wrangler/OpenNext configuration to validate the new root-level runtime layout.

### Removed

- Removed the Liquid template UI, legacy Worker/Vercel entrypoints, and the parallel `web/` application from the active codebase.

## [0.15.0] - 2026-03-07

### Added

- Added a Cloudflare OpenNext deployment target for `web/`, including Wrangler config, OpenNext config, and helper scripts for preview, deploy, and type generation.
- Added a same-origin App Router `/api/*` proxy layer so the migrated Next frontend can reach the shared backend runtime on both Cloudflare and Vercel.

### Changed

- Updated frontend API access to prefer the internal Next proxy, keeping `vision` and `ask` portable across Cloudflare Workers and Vercel.
- Updated environment and deployment docs to make `NEURO_API_BASE_URL` the recommended backend configuration for the migrated frontend.

## [0.14.0] - 2026-03-07

### Added

- Added migrated `Visual Cortex` and `Neuro Tutor` pages to the `web/` App Router frontend track.
- Added a shared AI metadata layer for `vision` and `ask` so the Worker routes, legacy templates, and migrated frontend all pull from the same typed content source.

### Changed

- Updated the Worker `vision` and `ask` routes to support browser-safe `/api/*` consumption with CORS headers and preflight handling for the migrated frontend.
- Updated migration docs, environment guidance, and app navigation to reflect that `vision` and `ask` are now part of the Next.js migration path while Cloudflare Workers remains the AI execution boundary.

## [0.13.0] - 2026-03-06

### Added

- Added a migrated `Dopamine Prediction Error Lab` page to the `web/` App Router frontend track.
- Added a typed temporal-difference learning library in the new frontend so dopamine-like reward-prediction error dynamics run locally with typed chart rendering.

### Changed

- Updated App Router navigation and module metadata to include the migrated dopamine module.
- Updated migration docs to reflect five stable-first migrated deterministic pages before any Worker-backed AI integration.

## [0.12.0] - 2026-03-06

### Added

- Added a migrated `Synaptic Plasticity` page to the `web/` App Router frontend track.
- Added a typed STDP simulation library in the new frontend so synaptic plasticity runs locally with a typed state model and chart rendering.

### Changed

- Updated App Router navigation and module metadata to include the migrated plasticity module.
- Updated migration docs to reflect four stable-first migrated deterministic pages before any Worker-backed AI integration.

## [0.11.0] - 2026-03-06

### Added

- Added migrated `Neuron Simulation` and `Retinal Receptive Field Lab` pages to the `web/` App Router frontend track.
- Added typed simulation libraries for neuron and retina modules in the new frontend so these deterministic experiences run locally without the old fetch-plus-template loop.

### Changed

- Updated the App Router shell with active navigation and a migrated-module count.
- Updated the migration homepage and documentation to reflect a stable-first strategy: deterministic modules first, Cloudflare Worker and Workers AI integration second.

## [0.10.0] - 2026-03-06

### Added

- Added a parallel `web/` frontend track based on Next.js App Router and the T3 scaffold to start replacing the current Liquid/string-template UI with typed React components.
- Added a migrated `Brain Atlas` page in the new frontend track, including a reusable app shell, typed atlas data, chapter switching, and an SVG-based region explorer.
- Added root helper scripts `dev:web`, `typecheck:web`, and `build:web` so the new frontend can be worked on without disturbing the current runtime targets.

### Changed

- Documented the new parallel frontend migration strategy in the root README and replaced the generated `web/README.md` with project-specific guidance.
- Set an explicit `outputFileTracingRoot` for the App Router app to avoid incorrect workspace-root inference in a nested lockfile setup.

## [0.9.1] - 2026-03-06

### Changed

- Refreshed the shared site styling with brighter contrast, softer glass-like surfaces, cleaner spacing, and a more restrained accent palette.
- Updated cards, forms, buttons, explanation panels, and sidebar navigation to feel lighter and more polished while remaining minimal.
- Added subtle gradient atmosphere and depth cues without changing the existing page structure or route layout.

## [0.9.0] - 2026-03-06

### Added

- New `Brain Atlas` module with API route `GET /brain-atlas` for exploring major brain regions in Chapter 1 and their recurrent circuit interlinks in Chapter 2.
- New interactive UI page at `/ui/brain-atlas` with a stylized brain map, chapter switching, region picker, and circuit detail panels.
- Structured neuroanatomy data covering cortical, limbic, subcortical, and hindbrain hubs, including functional roles, signature tasks, clinical links, and inter-region loop descriptions.

### Changed

- Sidebar navigation and home-page module catalog now include the Brain Atlas.
- Home-page framing now reflects nine major learning modules.
- Test coverage now validates the Brain Atlas route and chapter structure.

## [0.8.0] - 2026-03-06

### Added

- Added a 3D cardiac activation view to the `12-Lead ECG Explorer`, driven by the same dipole model that generates the waveform traces.
- Added an animated lead-constellation panel showing how the instantaneous cardiac vector aligns with all 12 lead viewpoints across a representative beat.
- Extended `GET /ecg` with activation frames and lead-axis metadata for anatomical/vector visualization.

### Changed

- Updated the ECG module copy to reflect the new 3D anatomy/vector interpretation layer.
- Expanded test coverage to validate the new ECG activation payload.

## [0.7.1] - 2026-03-06

### Changed

- Moved the `Neuro Tutor` / Socratic tutor entry to the bottom of the sidebar navigation.
- Reordered the home-page module catalog so the tutor appears last there as well.

## [0.7.0] - 2026-03-06

### Added

- New `Retinal Receptive Field Lab` module with API route `GET /retina` for simulating ON-center/OFF-surround ganglion-cell responses to spots, annuli, and edges.
- New interactive UI page at `/ui/retina` with controls for receptive-field geometry, surround strength, stimulus shape, position, and contrast.
- Visualizations for receptive-field heatmaps, stimulus maps, size-tuning curves, and spatial position scans.

### Changed

- Sidebar navigation and home-page module catalog now include the retina explorer.
- Test coverage now validates the new retinal center-surround simulator output.

## [0.6.0] - 2026-03-06

### Added

- New `Dopamine Prediction Error Lab` module with API route `GET /dopamine` for simulating reward-prediction errors over repeated learning trials.
- New interactive UI page at `/ui/dopamine` with controls for cue timing, reward timing, reward size, learning rate, discount factor, eligibility-trace decay, trial count, and reward omission trial.
- Visualizations for phasic prediction-error traces, learned value function, and cue-vs-reward learning curves across trials.

### Changed

- Sidebar navigation and home-page module catalog now include the dopamine learning explorer.
- Test coverage now validates route metadata and dopamine omission/cue-shift behavior.

## [0.5.0] - 2026-03-06

### Added

- New `Grid Cell Navigator` module with API route `GET /grid-cell` for simulating entorhinal hexagonal firing fields during spatial exploration.
- New interactive UI page at `/ui/grid-cell` with controls for arena size, duration, speed, grid spacing, orientation, spatial phase, field sharpness, max firing rate, theta modulation, and turning noise.
- Visualizations for exploration path, spike locations, 2D firing-rate heatmap, and instantaneous firing-rate trace.

### Changed

- Sidebar navigation and home-page module catalog now include the grid-cell explorer.
- Test coverage now includes deterministic validation of the new grid-cell API route.

## [0.4.0] - 2026-03-06

### Added

- New `12-Lead ECG Explorer` module with full API route `GET /ecg` for synthetic 12-lead signal generation.
- New interactive UI page at `/ui/ecg` with tweakable rhythm and morphology parameters:
  heart rate, electrical axis, PR/QRS/QT intervals, P/QRS/T amplitudes, ST shift, rhythm variability, baseline wander, noise, precordial rotation, gain, and duration.
- Multi-panel SVG visualization of all 12 clinical leads (`I`, `II`, `III`, `aVR`, `aVL`, `aVF`, `V1`-`V6`) with computed rhythm summary and QTc estimate.

### Changed

- Updated global app navigation to a persistent left sidebar layout across all pages.
- Home page module catalog now includes the ECG explorer.
- `/routes` metadata and tests updated to include the new ECG endpoint.

## [0.3.4] - 2026-03-06

### Fixed

- Vercel Node runtime module resolution error (`ERR_MODULE_NOT_FOUND` for `/var/task/src/app`) by switching internal TypeScript import specifiers to explicit `.js` paths for ESM runtime compatibility.

## [0.3.3] - 2026-03-06

### Fixed

- Vercel function crash (`FUNCTION_INVOCATION_FAILED`) caused by Node loading `api/index.js` as CommonJS while emitted code used ESM `import` syntax.
- Added `"type": "module"` to ensure Vercel executes the API bundle as ES modules.

## [0.3.2] - 2026-03-06

### Fixed

- Vercel root route serving a placeholder static page by removing `public/index.html` and preserving only an empty output directory for build validation.
- Catch-all rewrite now explicitly targets `/api/index` to avoid route ambiguity.

## [0.3.1] - 2026-03-06

### Fixed

- Vercel deployment failure caused by missing output directory by adding an explicit `outputDirectory` in `vercel.json` and creating `public/index.html`.

## [0.3.0] - 2026-03-06

### Added

- Vercel deployment target with a function entrypoint at `api/index.ts`.
- `vercel.json` rewrite setup so existing public routes (`/`, `/neuron`, `/vision`, `/ask`, `/plasticity`) work unchanged on Vercel.
- Shared runtime-agnostic app handler (`src/app.ts`) used by both Cloudflare Workers and Vercel.
- `README.md` deployment notes for Cloudflare and Vercel, including required environment variables.

### Changed

- Introduced an AI client abstraction (`src/ai/client.ts`) so Cloudflare Worker AI bindings and Vercel REST calls share route logic.
- Updated `/ask` and `/vision` routes to use the shared AI client abstraction with structured AI error responses.
- Updated test coverage to validate current app behavior instead of legacy "Hello World" snapshots.
- Added `typecheck`, `dev:vercel`, and `deploy:vercel` npm scripts.

### Fixed

- UI not-found page now returns HTTP `404` instead of `200`.
