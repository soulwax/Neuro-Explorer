# Changelog

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
