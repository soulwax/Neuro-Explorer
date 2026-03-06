# Changelog

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
