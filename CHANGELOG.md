# Changelog

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
