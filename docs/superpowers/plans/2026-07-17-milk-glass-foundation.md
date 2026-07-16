# Milk-Glass Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the whisper-blue milk-glass acrylic design system (tokens + shared CSS classes) and apply it to the app shell (sidebar) and home page, proving the new material and compact sidebar buttons out on real, working pages.

**Architecture:** All shared visual chrome in this app is driven by a small set of CSS classes defined once in `src/styles/globals.css` (`.app-surface`, `.app-stage`, `.app-page-stack`) plus hand-written Tailwind utility strings repeated per-component. This plan (a) rewrites the shared CSS classes' material/radius, (b) adds three new shared classes (`.glass-btn`, `.glass-pill`, `.glass-badge`) for buttons/pills/badges, and (c) applies both to the app shell and home page — the only two files edited beyond `globals.css` in this plan. The remaining ~24 explorer components each have their own hand-written button/pill/badge Tailwind strings; sweeping them onto the new shared classes is intentionally a **separate, follow-up plan** (see Non-Goals) since it's a distinct, independently-completable, largely mechanical body of work that depends on this plan's classes existing first.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`, no `tailwind.config`), plain custom CSS in `globals.css`.

## Global Constraints

- Shell width is unchanged: sidebar column stays 248px, overall shell stays `max-w-[1520px]` (`src/components/app-shell.tsx:21`). This plan is material/density only, never layout.
- Cyan (`cyan-300`/`cyan-100` Tailwind tokens) remains the *interactive accent* color (active nav state, primary actions) — the new whisper-blue glass tokens are the *structural material* color, not a replacement for cyan.
- Sidebar nav button height target: **32px** (today: `min-h-12` = 48px).
- Radius scale: large surface cards **12px** (`rounded-xl`), nested panels/buttons/pills **8px** (`rounded-lg`), badges/chips **6px** (`rounded-md`), true circles (status dots) stay `rounded-full`.
- Per the approved spec (`docs/superpowers/specs/2026-07-17-milk-glass-redesign-design.md`), module-specific bespoke visualization colors (ECG paper pink, EEG/plasticity/dopamine chart trace colors, clinical risk-severity colors) are **out of scope** — do not touch `src/components/ecg-explorer.tsx` or any other explorer component's SVG/chart color constants in this plan.
- Tailwind v4 detail that matters for every task below: `@import "tailwindcss"` at the top of `globals.css` sets up cascade layers (`theme, base, components, utilities`), and **utilities always beat unlayered custom CSS** for equal-specificity properties, regardless of source order — *except* the existing custom classes in this file (`.app-surface`, `.app-stage`, `.app-page-stack`, etc.) are written unlayered, which inverts that and makes them beat utility overrides applied alongside them on the same element. All new classes added in this plan **must** be wrapped in `@layer components { ... }` so a component can still override e.g. a badge's color via a Tailwind utility class placed alongside `.glass-badge` in the same `className`.
- This repo indents with **tabs**, not spaces (`.editorconfig`: `indent_style = tab`; `.prettierrc`: `"useTabs": true`; there is no `prettier` devDependency installed, so there's no format-on-save/lint step to fall back on — get it right by hand). The code blocks in Task 3 and Task 4 below are rendered with spaces for markdown readability only; when editing `src/components/app-shell.tsx` and `src/app/page.tsx`, match the file's existing tab indentation exactly (use the "Find" block, copied from the real file, to anchor the exact whitespace via your edit tool's exact-match — then indent the "Replace" content the same way).

---

## File Structure

- **Modify `src/styles/globals.css`**: add whisper-blue glass tokens to `:root`; rewrite `.app-surface`/`.app-surface--hero`/`.app-stage` for the new material and radius; add new `@layer components` block with `.glass-btn`, `.glass-btn--primary`, `.glass-btn--secondary`, `.glass-pill`, `.glass-pill.is-active`, `.glass-badge`.
- **Modify `src/components/app-shell.tsx`**: sidebar nav items (compact height, new radius, glass tokens for inactive state, cyan kept for active state), module-count badge, "Legal" link, "How it is built" panel — all restyled onto the new classes/tokens.
- **Modify `src/app/page.tsx`**: hero action buttons switched to `.glass-btn`, module badge switched to `.glass-badge`. The module card grid needs no direct edit — it already uses `.app-surface`, which inherits the new look automatically from the `globals.css` change.

## Interfaces

- **Produces** (for the follow-up sweep plan to consume):
  - CSS classes: `.glass-btn` (base) + `.glass-btn--primary` / `.glass-btn--secondary` (modifiers, compose as `className="glass-btn glass-btn--primary"`).
  - CSS class: `.glass-pill` (base), add `.is-active` for the selected/active state (`className="glass-pill is-active"`).
  - CSS class: `.glass-badge` (base) — color is intentionally left to the consumer via a Tailwind utility class alongside it (e.g. `className="glass-badge border-cyan-300/22 bg-cyan-300/10 text-cyan-100"`), which works correctly because `.glass-badge` lives in the `components` layer.
  - CSS custom properties on `:root`: `--glass-panel-from`, `--glass-panel-to`, `--glass-panel-hover-from`, `--glass-panel-hover-to`, `--glass-border`, `--glass-border-strong`, `--glass-highlight`, `--glass-shadow`.

---

### Task 1: Whisper-blue glass tokens + restyle `.app-surface` / `.app-stage`

**Files:**
- Modify: `src/styles/globals.css:8-37` (`:root` block), `src/styles/globals.css:99-159` (`.app-page-stack`, `.app-stage` and its pseudo-elements, `.app-surface`, `.app-surface--hero`)

**Interfaces:**
- Produces: the `--glass-*` custom properties listed in Interfaces above, for Task 2 to consume.

- [ ] **Step 1: Add the whisper-blue glass tokens to `:root`**

In `src/styles/globals.css`, the `:root` block currently ends with:

```css
  --surface-frame-glow: var(--surface-frame-glow-vertical),
    var(--surface-frame-glow-horizontal);
}
```

Change it to:

```css
  --surface-frame-glow: var(--surface-frame-glow-vertical),
    var(--surface-frame-glow-horizontal);

  --glass-panel-from: oklch(0.94 0.014 240 / 0.11);
  --glass-panel-to: oklch(0.94 0.014 240 / 0.035);
  --glass-panel-hover-from: oklch(0.94 0.014 240 / 0.15);
  --glass-panel-hover-to: oklch(0.94 0.014 240 / 0.05);
  --glass-border: oklch(0.94 0.014 240 / 0.14);
  --glass-border-strong: oklch(0.94 0.014 240 / 0.24);
  --glass-highlight: oklch(0.97 0.01 240 / 0.18);
  --glass-shadow: 0 14px 32px rgba(3, 8, 18, 0.35);
}
```

- [ ] **Step 2: Restyle `.app-surface` and `.app-surface--hero` for the new material and radius**

Find (still in `src/styles/globals.css`):

```css
.app-surface {
  border: 1px solid var(--surface-border);
  border-radius: 1.625rem;
  background: var(--surface-panel);
  padding: clamp(1rem, 1.5vw, 1.25rem);
  backdrop-filter: blur(18px);
}

.app-surface--hero {
  background:
    linear-gradient(
      180deg,
      oklch(0.31 0.024 242 / 0.86) 0%,
      oklch(0.27 0.02 244 / 0.78) 100%
    );
  box-shadow: var(--surface-shadow);
}
```

Replace with:

```css
.app-surface {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: linear-gradient(155deg, var(--glass-panel-from), var(--glass-panel-to));
  padding: clamp(1rem, 1.5vw, 1.25rem);
  backdrop-filter: blur(18px) saturate(140%);
  box-shadow: inset 0 1px 0 var(--glass-highlight), var(--glass-shadow);
}

.app-surface--hero {
  background: linear-gradient(155deg, var(--glass-panel-hover-from), var(--glass-panel-hover-to));
  box-shadow: inset 0 1px 0 var(--glass-highlight), var(--glass-shadow);
}
```

- [ ] **Step 3: Tighten the `.app-stage` frame radius to match the new scale**

Find:

```css
.app-stage::before {
  content: "";
  position: absolute;
  inset: 0.75rem;
  border-radius: clamp(1.4rem, 2.2vw, 1.9rem);
  border: 1px solid var(--surface-border);
  background-image: var(--surface-frame-glow);
  pointer-events: none;
}
```

Replace the `border-radius` line only:

```css
.app-stage::before {
  content: "";
  position: absolute;
  inset: 0.75rem;
  border-radius: clamp(0.85rem, 1.4vw, 1.1rem);
  border: 1px solid var(--surface-border);
  background-image: var(--surface-frame-glow);
  pointer-events: none;
}
```

- [ ] **Step 4: Typecheck (CSS has no type errors, but this confirms the edit didn't break the build pipeline's file watching / no stray syntax issues elsewhere)**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: introduce whisper-blue milk-glass tokens for app-surface and app-stage"
```

---

### Task 2: Shared `.glass-btn` / `.glass-pill` / `.glass-badge` classes

**Files:**
- Modify: `src/styles/globals.css` (append a new `@layer components` block after the `.app-surface--hero` rule added in Task 1, before the `@media (max-width: 1023px)` block)

**Interfaces:**
- Consumes: `--glass-panel-from`, `--glass-panel-to`, `--glass-panel-hover-from`, `--glass-panel-hover-to`, `--glass-border`, `--glass-border-strong`, `--glass-highlight` from Task 1.
- Produces: `.glass-btn`, `.glass-btn--primary`, `.glass-btn--secondary`, `.glass-pill`, `.glass-pill.is-active`, `.glass-badge` for Task 3, Task 4, and the follow-up sweep plan.

- [ ] **Step 1: Insert the new component classes**

In `src/styles/globals.css`, immediately after the `.app-surface--hero` rule (the block edited in Task 1 Step 2) and before `@media (max-width: 1023px) {`, insert:

```css
@layer components {
  .glass-btn {
    display: inline-flex;
    align-items: center;
    min-height: 2.5rem;
    padding: 0 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
  }

  .glass-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .glass-btn--primary {
    color: oklch(0.18 0.02 246);
    background: linear-gradient(155deg, oklch(0.9 0.03 220), oklch(0.82 0.06 220));
    box-shadow: 0 12px 28px oklch(0.7 0.12 220 / 0.28);
  }

  .glass-btn--primary:hover {
    transform: translateY(-1px);
  }

  .glass-btn--secondary {
    color: var(--surface-ink);
    background: linear-gradient(155deg, var(--glass-panel-from), var(--glass-panel-to));
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(14px);
  }

  .glass-btn--secondary:hover {
    background: linear-gradient(155deg, var(--glass-panel-hover-from), var(--glass-panel-hover-to));
    border-color: var(--glass-border-strong);
  }

  .glass-pill {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--glass-border);
    background: linear-gradient(155deg, var(--glass-panel-from), var(--glass-panel-to));
    color: var(--surface-ink-muted);
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .glass-pill:hover {
    background: linear-gradient(155deg, var(--glass-panel-hover-from), var(--glass-panel-hover-to));
    border-color: var(--glass-border-strong);
    color: var(--surface-ink);
  }

  .glass-pill.is-active {
    border-color: oklch(0.78 0.1 220 / 0.5);
    background: oklch(0.78 0.1 220 / 0.14);
    color: oklch(0.92 0.04 220);
  }

  .glass-badge {
    display: inline-flex;
    align-items: center;
    min-height: 1.5rem;
    padding: 0 0.65rem;
    border-radius: 0.375rem;
    border: 1px solid var(--glass-border);
    background: linear-gradient(155deg, var(--glass-panel-from), var(--glass-panel-to));
    color: var(--surface-ink-muted);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: add shared glass-btn/glass-pill/glass-badge component classes"
```

---

### Task 3: Compact whisper-blue sidebar (`app-shell.tsx`)

**Files:**
- Modify: `src/components/app-shell.tsx:29-67`

**Interfaces:**
- Consumes: `.glass-badge` (Task 2), `--glass-border` / `--glass-panel-from` / `--glass-panel-to` / `--glass-panel-hover-from` / `--glass-panel-hover-to` (Task 1).

- [ ] **Step 1: Restyle the module-count badge**

Find:

```tsx
					<div className="mt-4 inline-flex min-h-10 items-center rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100">
						{moduleCount} modules
					</div>
```

Replace with:

```tsx
					<div className="glass-badge mt-4 border-cyan-300/22 bg-cyan-300/10 text-cyan-100">
						{moduleCount} modules
					</div>
```

- [ ] **Step 2: Restyle the nav list — compact height, new radius, glass tokens**

Find:

```tsx
					<nav className="mt-6 grid gap-2">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
								className={`inline-flex min-h-12 items-center rounded-[18px] border px-4 py-3 text-sm font-medium transition ${
									isActive(item.href)
										? 'border-cyan-300/28 bg-cyan-300/12 text-cyan-100'
										: 'border-white/8 bg-white/4 text-slate-300 hover:border-cyan-300/24 hover:bg-white/8 hover:text-white'
								}`}
							>
								{item.label}
							</Link>
						))}
					</nav>
```

Replace with:

```tsx
					<nav className="mt-6 grid gap-1.5">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
								className={`inline-flex h-8 items-center rounded-lg border px-2.5 text-sm font-medium backdrop-blur-md transition ${
									isActive(item.href)
										? 'border-cyan-300/28 bg-cyan-300/12 text-cyan-100'
										: 'border-[var(--glass-border)] bg-[var(--glass-panel-from)] text-slate-300 hover:border-cyan-300/24 hover:bg-[var(--glass-panel-hover-from)] hover:text-white'
								}`}
							>
								{item.label}
							</Link>
						))}
					</nav>
```

- [ ] **Step 3: Restyle the "Legal" link to match the same compact glass treatment**

Find:

```tsx
					<div className="mt-4 grid gap-2">
						<a
							href="https://legal.bluesix.dev"
							target="_blank"
							rel="noreferrer"
							className="inline-flex min-h-12 items-center rounded-[18px] border border-white/8 bg-white/4 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-300/24 hover:bg-white/8 hover:text-white"
						>
							Legal
						</a>
					</div>
```

Replace with:

```tsx
					<div className="mt-4 grid gap-1.5">
						<a
							href="https://legal.bluesix.dev"
							target="_blank"
							rel="noreferrer"
							className="inline-flex h-8 items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-panel-from)] px-2.5 text-sm font-medium text-slate-300 backdrop-blur-md transition hover:border-cyan-300/24 hover:bg-[var(--glass-panel-hover-from)] hover:text-white"
						>
							Legal
						</a>
					</div>
```

- [ ] **Step 4: Restyle the "How it is built" info panel radius (still uses `.app-surface`-adjacent styling, not the class itself, so needs its own radius update)**

Find:

```tsx
					<div className="mt-6 rounded-[22px] border border-cyan-300/14 bg-cyan-300/8 p-4 text-sm text-slate-300">
```

Replace with:

```tsx
					<div className="mt-6 rounded-lg border border-cyan-300/14 bg-cyan-300/8 p-4 text-sm text-slate-300">
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
git add src/components/app-shell.tsx
git commit -m "style: compact whisper-blue sidebar nav (48px to 32px, less rounded)"
```

---

### Task 4: Home page hero buttons and badge (`page.tsx`)

**Files:**
- Modify: `src/app/page.tsx:14-44`

**Interfaces:**
- Consumes: `.glass-btn`, `.glass-btn--primary`, `.glass-btn--secondary`, `.glass-badge` (Task 2).

- [ ] **Step 1: Restyle the three hero action links**

Find:

```tsx
				<div className="mt-5 flex flex-wrap gap-3">
					<Link
						href="/visual-field"
						className="inline-flex min-h-12 items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5"
					>
						Open Visual Field Localizer
					</Link>
					<Link
						href="/brain-atlas"
						className="inline-flex min-h-12 items-center rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
					>
						Open Brain Atlas
					</Link>
					<Link
						href="/ask"
						className="inline-flex min-h-12 items-center rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
					>
						Open Ask
					</Link>
				</div>
```

Replace with:

```tsx
				<div className="mt-5 flex flex-wrap gap-3">
					<Link href="/visual-field" className="glass-btn glass-btn--primary">
						Open Visual Field Localizer
					</Link>
					<Link href="/brain-atlas" className="glass-btn glass-btn--secondary">
						Open Brain Atlas
					</Link>
					<Link href="/ask" className="glass-btn glass-btn--secondary">
						Open Ask
					</Link>
				</div>
```

- [ ] **Step 2: Restyle the per-module badge in the module grid**

Find:

```tsx
								<span className="inline-flex min-h-9 items-center rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
									{module.badge}
								</span>
```

Replace with:

```tsx
								<span className="glass-badge border-cyan-300/22 bg-cyan-300/15 text-cyan-100">
									{module.badge}
								</span>
```

- [ ] **Step 3: Remove now-dead radius utility classes**

`.app-surface` is unlayered custom CSS (see Global Constraints), so its `border-radius` already silently wins over any `rounded-[Npx]` utility placed alongside it on the same element — these three `rounded-[Npx]` classes were already dead before this plan (they never actually applied) and are now actively misleading since `.app-surface` renders at 12px, not 30px/26px. Remove them so the code doesn't lie about what's rendered.

Find:

```tsx
				<section className="app-surface app-surface--hero rounded-[30px]">
```

Replace with:

```tsx
				<section className="app-surface app-surface--hero">
```

Find:

```tsx
							className="app-surface rounded-[26px] transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/8"
```

Replace with:

```tsx
							className="app-surface transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/8"
```

Find:

```tsx
						<div key={module.slug} className="app-surface rounded-[26px] bg-[var(--surface-panel-subtle)]">
```

Replace with:

```tsx
						<div key={module.slug} className="app-surface bg-[var(--surface-panel-subtle)]">
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: apply glass-btn/glass-badge to the home page hero, drop dead radius utilities"
```

---

### Task 5: Visual verification against the approved mockup

**Files:** none (verification only)

**Interfaces:** none.

This repo has no automated visual-regression suite, so verification is a real production-build render compared against the approved mockup (`docs/superpowers/specs/2026-07-17-milk-glass-redesign-design.md`, and the mockup screens recorded during brainstorming). Two environment quirks discovered while fixing an earlier bug in this repo, both irrelevant to this change but necessary to work around:

- `pnpm dev` fails in this sandbox: `next.config.js` calls `initOpenNextCloudflareForDev()` unconditionally, which tries to open a remote Cloudflare Workers AI proxy session and needs live, valid Cloudflare credentials. Use a production build + `next start` instead.
- `pnpm build` fails at the very last "Collecting build traces" step with an unrelated `sharp`/`EACCES` permission error in this sandbox — but all pages are already generated successfully by that point (`✓ Generating static pages (26/26)` prints before the failure), and the `.next` output is usable. Don't treat that failure as blocking; confirm pages were generated, then proceed to `next start`.

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: prints `✓ Generating static pages (26/26)` (may still exit non-zero afterward on this sandbox due to the unrelated `sharp` trace-collection issue above — that's fine).

- [ ] **Step 2: Serve the build on a free port**

Run (background): `pnpm exec next start -p 3101`
Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3101/` returns `200`.

- [ ] **Step 3: Screenshot the home page and the sidebar at a wide viewport (1920x1200) and compare against the approved "final-look" mockup**

Using the Playwright MCP tools (`browser_navigate` to `http://localhost:3101/`, `browser_resize` to 1920x1200, `browser_take_screenshot` with `fullPage: true`): confirm —
- Sidebar nav items are visibly shorter than before (compact, not pill-shaped — rounded rectangles).
- `.app-surface` cards (module grid, hero) show a visible frosted, whisper-blue-tinted glass texture (not flat/opaque, not invisible).
- Corners across cards/buttons/badges read as tightened rounded rectangles, not full pills (except literal status dots, if any are visible on this page — there are none on the home page).
- No layout regressions: sidebar is still 248px, page content still centers under `max-w-[1180px]`.

- [ ] **Step 4: Screenshot at a narrow viewport (1280x900) to confirm no regression in the single-column fallback**

Same page, `browser_resize` to 1280x900, screenshot, confirm the sidebar still collapses to the top (per the existing `lg:` breakpoint behavior in `app-shell.tsx`) and nothing overlaps.

- [ ] **Step 5: Run the existing test suite**

Run: `pnpm exec vitest run`
Expected: all existing tests still pass (no logic changed in this plan, only CSS/JSX class strings).

- [ ] **Step 6: Stop the preview server**

Use `TaskStop` (or equivalent) on the background `next start` task from Step 2, and free the port.

---

## Non-Goals (this plan)

- Sweeping the ~24 explorer components' hand-written `rounded-full`/button/pill/badge Tailwind strings onto `.glass-btn` / `.glass-pill` / `.glass-badge` — write a separate follow-up plan for this once this plan is merged, since it's mechanical, high file-count, and depends on the classes this plan produces.
- Any change to `src/components/ecg-explorer.tsx` or other components' bespoke SVG/chart color constants — explicitly out of scope per the design spec.
