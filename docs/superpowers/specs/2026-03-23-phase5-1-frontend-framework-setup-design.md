# Phase 5.1: Frontend Framework Setup — Design Spec

## Overview

Set up the frontend framework foundation in the monorepo: Tailwind CSS v4, bits-ui/shadcn-svelte infrastructure, Vitest, toast notifications, and the base layout. This is the prerequisite for all subsequent frontend migration sub-phases.

## Approach

Copy configs directly from the old Supabase frontend (`amateur-cycling-stats-supabase/`). The old project's configuration is well-structured and battle-tested — copying ensures exact visual parity with zero guesswork.

## Package Installations

All installed in the `apps/frontend` workspace.

**devDependencies:**
- `@tailwindcss/vite` ^4.1 — Tailwind v4 Vite plugin
- `tailwindcss` ^4.1 — Tailwind core
- `bits-ui` ^2.14 — headless UI primitives (shadcn-svelte foundation)
- `tailwind-merge` ^3.4 — intelligent class merging
- `tailwind-variants` ^3.1 — variant-based styling
- `clsx` ^2.1 — conditional class joining
- `tw-animate-css` — Tailwind animation utilities
- `vitest` — test runner

**dependencies:**
- `svelte-sonner` ^1.0 — toast notifications

## New Files

### `apps/frontend/src/app.css`

Copied from old project. Contains:
- `@import 'tailwindcss'` and `@import 'tw-animate-css'`
- `@custom-variant dark (&:is(.dark *))` for dark mode
- CSS custom properties in `:root` and `.dark` using OKLCH color space
- `@theme inline` block mapping CSS vars to Tailwind color tokens
- `@layer base` with border, outline, background, and text defaults

### `apps/frontend/src/lib/utils.ts`

Copied from old project. Contains:
- `cn()` function — merges class names using `clsx` + `tailwind-merge`
- `WithoutChild<T>`, `WithoutChildren<T>`, `WithoutChildrenOrChild<T>`, `WithElementRef<T>` — helper types used by shadcn-svelte components

### `apps/frontend/components.json`

Copied from old project. shadcn-svelte configuration:
- `baseColor: "slate"`
- Aliases: `components → $lib/components`, `ui → $lib/components/ui`, `utils → $lib/utils`, `hooks → $lib/hooks`, `lib → $lib`

## Modified Files

### `apps/frontend/vite.config.ts`

Add `@tailwindcss/vite` plugin and Vitest server-only config:
- Import from `vitest/config` instead of `vite`
- Add `tailwindcss()` to plugins array
- Add `test` block with node environment, includes `src/**/*.{test,spec}.{js,ts}`, excludes `.svelte.test.ts` files (browser component tests deferred to 5.12)

### `apps/frontend/package.json`

- Add `"test": "vitest run"` script

### `apps/frontend/src/routes/+layout.svelte`

Replace minimal shell with base layout:
- Import `app.css`
- Import `Toaster` from `svelte-sonner`
- Placeholder `<header>` tag (real Header component deferred to 5.3)
- `Toaster` with `position="top-center"`, `closeButton`, `duration={5000}`, `richColors`
- `<main>` container with `mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12`
- No `data` prop / session data (deferred to 5.7 auth flows)

### `apps/frontend/src/app.html`

Change `lang="en"` to `lang="es"` (Spanish is the default language).

## Not in Scope

- UI components (Phase 5.3)
- Storybook (Phase 5.4)
- i18n (Phase 5.2)
- Playwright / browser-based component tests (Phase 5.12)
- Header component (Phase 5.3)
- Auth/session data in layout (Phase 5.7)
