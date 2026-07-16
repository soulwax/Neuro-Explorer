# Milk-glass visual redesign — design spec

## Goal

Rework the shared app chrome's look and feel into a more nuanced, elegant "milk glass acrylic" material — serious enough for a university teaching platform — while keeping the overall shell width unchanged and making the sidebar nav buttons more compact.

## Direction (validated via visual mockups)

- **Material**: dark navy shell (unchanged base) with frosted "milk glass acrylic" panels — translucent, blurred, whisper-blue tinted (cool, barely-there blue-white, not warm cream and not a saturated/moody slate blue).
- **Corners**: meaningfully less rounded than today. Today's chrome ranges from `rounded-[18px]` to `rounded-[30px]` on cards and `rounded-full` (true pill) on nearly every button/badge. New scale is tighter and buttons/badges become rounded rectangles, not pills.
- **Sidebar nav buttons**: compact, sub-40px tall (today's buttons are `min-h-12` / 48px, computed rendered height ~40px). Target **32px**.
- **Shell width**: unchanged — sidebar column stays 248px, overall shell stays `max-w-[1520px]`. This is a density/material change only, not a layout change.
- **Accent color**: the existing cyan brand accent (used for active nav state, primary buttons, links) is retained as the *interactive* signal color, distinct from the new whisper-blue *structural* glass material. They read as complementary, not competing.

## Scope

**In scope** — shared chrome that composes every page:
- `src/styles/globals.css` design tokens and shared classes: `:root` surface variables, `.app-surface`, `.app-surface--hero`, `.app-stage`, `.app-page-stack`.
- `src/components/app-shell.tsx` — sidebar nav, brand block, module-count badge, "Legal" link, "How it is built" panel.
- `src/app/page.tsx` (home) — hero card and module grid, since it's the front door and uses only shared/generic classes already.
- The repeated button/pill/badge/toggle patterns duplicated across the 24 explorer components in `src/components/*-explorer.tsx` (185 occurrences of `rounded-full` across 27 files today) — these get swept onto new shared utility classes so the whole app reads consistently, not just the shell.

**Out of scope** — module-specific bespoke visualizations with deliberate, non-decorative color choices:
- ECG's pink "paper" clinical sheet (`ECG_PAPER_BG`, `ECG_PAPER_PANEL`, etc. in `ecg-explorer.tsx`) — mimics real telemetry paper.
- Per-module SVG/chart trace colors (EEG channel traces, plasticity curves, dopamine reward-prediction plots, etc.) — these are functional data-visualization colors, not chrome styling.
- Any clinical/semantic color coding (risk badges — red/amber/green, etc.) — semantics must be preserved.

If a module's *chrome* (its outer `.app-surface` card, its buttons, its filter pills) uses the shared classes, it inherits the new look automatically. Its *internal simulation visuals* do not change.

## Design tokens (`globals.css`)

Replace/extend the existing `--surface-*` custom properties with a whisper-blue glass palette. Concrete values (oklch, consistent with the existing token style):

```css
--glass-tint: oklch(0.94 0.014 240);        /* whisper-blue base hue for glass panels */
--glass-panel: oklch(0.94 0.014 240 / 0.05); /* panel fill, low alpha */
--glass-panel-hover: oklch(0.94 0.014 240 / 0.09);
--glass-border: oklch(0.94 0.014 240 / 0.14);
--glass-border-strong: oklch(0.94 0.014 240 / 0.24);
--glass-highlight: oklch(0.97 0.01 240 / 0.18);  /* inset top sheen */
--glass-shadow: 0 14px 32px rgba(3, 8, 18, 0.35);
```

`.app-surface` becomes a `backdrop-filter: blur(18px) saturate(140%)` panel using `--glass-panel` / `--glass-border` / the inset highlight, instead of today's flat `--surface-panel` fill.

## Radius scale

Replace the current ad hoc range (`rounded-[18px]` … `rounded-[30px]`, `rounded-full`) with a small, consistent scale:

| Role | Today | New |
|---|---|---|
| Large surface cards (`.app-surface`, hero) | 26–30px | **12px** |
| Nested sub-cards / panels | 18–24px | **8px** |
| Buttons, pills, filter toggles | `rounded-full` (pill) | **8px** |
| Badges / chips / small tags | `rounded-full` (pill) | **6px** |
| Dots / status indicators | `rounded-full` | unchanged (true circles stay circular — this is the one legitimate use of full roundness) |

## Sidebar (`app-shell.tsx`)

- Nav item height: 48px → **32px** (`min-h-12` → fixed `h-8`-equivalent), padding tightened accordingly (`px-4 py-3` → `px-2.5 py-1.5`).
- Nav item radius: `rounded-[18px]` → **8px**.
- Nav item material: swap `border-white/8 bg-white/4` (inactive) / `border-cyan-300/28 bg-cyan-300/12` (active) for the new glass tokens, keeping cyan reserved for the active/interactive state per the accent-vs-material distinction above.
- Sidebar column width, sticky behavior, and overall shell grid (`248px_minmax(0,1fr)`, `max-w-[1520px]`) are **unchanged**.

## Shared button/pill/badge utility classes

Add a small set of new classes to `globals.css` so the 24 explorer components can adopt one implementation instead of each hand-rolling its own `rounded-full border ...` string:

- `.glass-btn` / `.glass-btn--primary` / `.glass-btn--secondary` — action buttons (today's "Generate ECG", "Reset defaults", "Open Brain Atlas" style links).
- `.glass-pill` — toggle/filter pill buttons (today's preset selectors, display toggles, lead pickers).
- `.glass-badge` — small uppercase tag/status chips (today's "22 MODULES", "FOCUS LEAD II", risk badges keep their semantic color but switch to the new radius).

These classes encapsulate the new radius + glass material + hover/active states in one place. The component sweep replaces the most common repeated literal Tailwind strings with these classes, which is mechanical: the same handful of patterns recur nearly verbatim across the 24 files (confirmed while investigating the earlier ECG layout bug).

## Non-goals / risks

- This is **not** a rebrand — cyan stays the accent color, module identities (badges, icons where present) stay distinct.
- Not touching per-module bespoke visualization palettes (see Out of scope).
- Not changing any layout, breakpoints, or container widths — purely material/density.
- Risk: sweeping 24 files for button/pill patterns is mechanical but broad; each changed file should get a quick visual sanity check (existing `verify`/Playwright approach used for the earlier ECG bug fix) rather than assuming the sweep is safe by typecheck alone, since Tailwind class swaps don't fail typecheck if wrong.

## Verification plan

- `pnpm exec tsc --noEmit` after all edits.
- `pnpm exec vitest run` (existing suite) — no logic changes expected, should stay green.
- Visual check via a production build + Playwright screenshots (the same method used to diagnose/fix the ECG grid-overflow bug) on: home, one simulation-heavy page (ECG), one chart-heavy page (EEG), and the sidebar itself at both a narrow (~1280px) and wide (~1920px) viewport — comparing against the approved mockup.
