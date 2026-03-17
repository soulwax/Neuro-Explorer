# Neuro Explorer

Interactive neuroscience labs and AI-assisted study tools built as a single Next.js application.

## Architecture

- App Router pages live in `src/app/*`.
- Shared neuroscience engines live in `src/core/*`.
- Server-side route logic lives in `src/server/*`.
- Browser clients talk to internal Next.js route handlers at `/api/*`.
- `Vision` and `Ask` call Cloudflare Workers AI from the server side.
  Cloudflare Workers uses the native `AI` binding, while Vercel and plain local Next.js dev use Cloudflare REST credentials.

The old Liquid template UI and the parallel `web/` app are no longer part of the active runtime.

## Modules

- Brain Atlas
- Neuron Simulation
- Retinal Receptive Field Lab
- Grid Cell Navigator
- 12-Lead ECG Explorer
- Synaptic Plasticity
- Dopamine Prediction Error Lab
- Visual Cortex
- Neuro Tutor

## Local Development

Install dependencies, set environment variables, and run the Next.js app from the repository root.

```bash
npm install
npm run dev
```

For AI-backed routes in local Next.js dev or Vercel, set one of these credential pairs:

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

or

```bash
CF_ACCOUNT_ID=...
CF_API_TOKEN=...
```

See [.env.example](.env.example) for the expected shape.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Deploy

### Vercel

Deploy the repository root as a normal Next.js project. The internal `/api/*` handlers ship with the app, so there is no separate backend deployment.

Required environment variables for `Vision` and `Ask`:

- `CLOUDFLARE_ACCOUNT_ID` or `CF_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` or `CF_API_TOKEN`

Optional helper:

```bash
npm run deploy:vercel
```

### Cloudflare Workers

This project uses OpenNext for the Workers target. The built Worker entrypoint is `.open-next/worker.js`, referenced by [wrangler.jsonc](wrangler.jsonc).

`Vision` and `Ask` use the Wrangler `AI` binding in Cloudflare deploys, so no REST credential environment variables are required there unless you explicitly want the fallback path.

Useful commands:

```bash
npm run cf-typegen
npm run preview:cf
npm run deploy
```

If you change Wrangler bindings, regenerate the Cloudflare types before shipping:

```bash
npm run cf-typegen
```

## Repository Layout

- [src/app](src/app) contains pages and route handlers.
- [src/components](src/components) contains UI components.
- [src/core](src/core) contains shared simulation and content logic.
- [src/server](src/server) contains server-side adapters and AI integration.
- [src/env.js](src/env.js) defines environment validation.

## Product Direction

The next instructional roadmap lives in [docs/neurology-roadmap.md](docs/neurology-roadmap.md). It prioritizes case-based reasoning, compare mode, lesion presets, and the next five neurology modules to build.
