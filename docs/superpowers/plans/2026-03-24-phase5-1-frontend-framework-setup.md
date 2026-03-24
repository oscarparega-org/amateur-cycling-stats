# Phase 5.1: Frontend Framework Setup — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Tailwind CSS v4, bits-ui/shadcn-svelte infrastructure, Vitest, toast notifications, and base layout in the monorepo frontend.

**Architecture:** Copy battle-tested configs from the old Supabase frontend. Install matching package versions. Wire Tailwind v4 via CSS-based `@theme` config (no tailwind.config.js). Simplified Vitest setup (server-only, no browser tests yet).

**Tech Stack:** Tailwind CSS v4, bits-ui, shadcn-svelte, clsx, tailwind-merge, tailwind-variants, Vitest, svelte-sonner

---

### Task 1: Install packages

**Files:**
- Modify: `apps/frontend/package.json`

- [ ] **Step 1: Install devDependencies**

```bash
npm install -D @tailwindcss/vite@^4.1 tailwindcss@^4.1 bits-ui@^2.14 tailwind-merge@^3.4 tailwind-variants@^3.1 clsx@^2.1 tw-animate-css vitest --workspace=apps/frontend
```

- [ ] **Step 2: Install dependencies**

```bash
npm install svelte-sonner@^1.0 --workspace=apps/frontend
```

- [ ] **Step 3: Add test script to package.json**

In `apps/frontend/package.json`, add to the `"scripts"` block:

```json
"test": "vitest run"
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/package.json package-lock.json
git commit -m "feat(frontend): install tailwind, bits-ui, vitest, and svelte-sonner"
```

---

### Task 2: Create app.css with Tailwind v4 theme

**Files:**
- Create: `apps/frontend/src/app.css`

- [ ] **Step 1: Create app.css**

Copy verbatim from old project. File contents:

```css
@import 'tailwindcss';

@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
	--radius: 0.65rem;
	--background: oklch(1 0 0);
	--foreground: oklch(0.141 0.005 285.823);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.141 0.005 285.823);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.141 0.005 285.823);
	--primary: oklch(0.623 0.214 259.815);
	--primary-foreground: oklch(0.97 0.014 254.604);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.967 0.001 286.375);
	--muted-foreground: oklch(0.552 0.016 285.938);
	--accent: oklch(0.967 0.001 286.375);
	--accent-foreground: oklch(0.21 0.006 285.885);
	--destructive: oklch(0.577 0.245 27.325);
	--success: oklch(0.65 0.15 145);
	--warning: oklch(0.75 0.15 85);
	--info: oklch(0.6 0.2 240);
	--border: oklch(0.92 0.004 286.32);
	--input: oklch(0.92 0.004 286.32);
	--ring: oklch(0.623 0.214 259.815);
	--chart-1: oklch(0.646 0.222 41.116);
	--chart-2: oklch(0.6 0.118 184.704);
	--chart-3: oklch(0.398 0.07 227.392);
	--chart-4: oklch(0.828 0.189 84.429);
	--chart-5: oklch(0.769 0.188 70.08);
	--sidebar: oklch(0.985 0 0);
	--sidebar-foreground: oklch(0.141 0.005 285.823);
	--sidebar-primary: oklch(0.623 0.214 259.815);
	--sidebar-primary-foreground: oklch(0.97 0.014 254.604);
	--sidebar-accent: oklch(0.967 0.001 286.375);
	--sidebar-accent-foreground: oklch(0.21 0.006 285.885);
	--sidebar-border: oklch(0.92 0.004 286.32);
	--sidebar-ring: oklch(0.623 0.214 259.815);
}

.dark {
	--background: oklch(0.141 0.005 285.823);
	--foreground: oklch(0.985 0 0);
	--card: oklch(0.21 0.006 285.885);
	--card-foreground: oklch(0.985 0 0);
	--popover: oklch(0.21 0.006 285.885);
	--popover-foreground: oklch(0.985 0 0);
	--primary: oklch(0.546 0.245 262.881);
	--primary-foreground: oklch(0.379 0.146 265.522);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.274 0.006 286.033);
	--muted-foreground: oklch(0.705 0.015 286.067);
	--accent: oklch(0.274 0.006 286.033);
	--accent-foreground: oklch(0.985 0 0);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.488 0.243 264.376);
	--chart-1: oklch(0.488 0.243 264.376);
	--chart-2: oklch(0.696 0.17 162.48);
	--chart-3: oklch(0.769 0.188 70.08);
	--chart-4: oklch(0.627 0.265 303.9);
	--chart-5: oklch(0.645 0.246 16.439);
	--sidebar: oklch(0.21 0.006 285.885);
	--sidebar-foreground: oklch(0.985 0 0);
	--sidebar-primary: oklch(0.546 0.245 262.881);
	--sidebar-primary-foreground: oklch(0.379 0.146 265.522);
	--sidebar-accent: oklch(0.274 0.006 286.033);
	--sidebar-accent-foreground: oklch(0.985 0 0);
	--sidebar-border: oklch(1 0 0 / 10%);
	--sidebar-ring: oklch(0.488 0.243 264.376);
}

@theme inline {
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-success: var(--success);
	--color-warning: var(--warning);
	--color-info: var(--info);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-chart-1: var(--chart-1);
	--color-chart-2: var(--chart-2);
	--color-chart-3: var(--chart-3);
	--color-chart-4: var(--chart-4);
	--color-chart-5: var(--chart-5);
	--color-sidebar: var(--sidebar);
	--color-sidebar-foreground: var(--sidebar-foreground);
	--color-sidebar-primary: var(--sidebar-primary);
	--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
	--color-sidebar-accent: var(--sidebar-accent);
	--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
	--color-sidebar-border: var(--sidebar-border);
	--color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
	body {
		@apply bg-background text-foreground;
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app.css
git commit -m "feat(frontend): add Tailwind v4 theme with OKLCH color system"
```

---

### Task 3: Create utils.ts and components.json

**Files:**
- Create: `apps/frontend/src/lib/utils.ts`
- Create: `apps/frontend/components.json`

- [ ] **Step 1: Create utils.ts**

Write to `apps/frontend/src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
```

- [ ] **Step 2: Create components.json**

Write to `apps/frontend/components.json`:

```json
{
	"$schema": "https://shadcn-svelte.com/schema.json",
	"tailwind": {
		"css": "src/app.css",
		"baseColor": "slate"
	},
	"aliases": {
		"components": "$lib/components",
		"utils": "$lib/utils",
		"ui": "$lib/components/ui",
		"hooks": "$lib/hooks",
		"lib": "$lib"
	},
	"typescript": true,
	"registry": "https://shadcn-svelte.com/registry"
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/utils.ts apps/frontend/components.json
git commit -m "feat(frontend): add cn() utility and shadcn-svelte components.json"
```

---

### Task 4: Update vite.config.ts with Tailwind and Vitest

**Files:**
- Modify: `apps/frontend/vite.config.ts`

- [ ] **Step 1: Replace vite.config.ts**

Replace the full contents of `apps/frontend/vite.config.ts` with:

```typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
	}
});
```

- [ ] **Step 2: Verify build works**

```bash
cd apps/frontend && npm run build
```
Expected: clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/vite.config.ts
git commit -m "feat(frontend): add Tailwind v4 vite plugin and Vitest config"
```

---

### Task 5: Update app.html

**Files:**
- Modify: `apps/frontend/src/app.html`

- [ ] **Step 1: Update app.html**

Replace the full contents of `apps/frontend/src/app.html` with:

```html
<!doctype html>
<html lang="es">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Amateur Cycling Stats</title>
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

Changes from current:
- `lang="en"` → `lang="es"`
- Added `<title>Amateur Cycling Stats</title>`

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app.html
git commit -m "feat(frontend): set Spanish default lang and add page title"
```

---

### Task 6: Update root layout

**Files:**
- Modify: `apps/frontend/src/routes/+layout.svelte`

- [ ] **Step 1: Replace +layout.svelte**

Replace the full contents of `apps/frontend/src/routes/+layout.svelte` with:

```svelte
<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-white">
	<header class="border-b px-4 py-3 text-sm text-muted-foreground">
		ACS — Header placeholder
	</header>
	<Toaster position="top-center" closeButton duration={5000} richColors />
	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
		{@render children()}
	</main>
</div>
```

- [ ] **Step 2: Verify dev server starts**

```bash
cd apps/frontend && npm run dev
```
Expected: server starts on port 5173, page loads with Tailwind styling (white background, styled placeholder header)

- [ ] **Step 3: Verify build**

```bash
cd apps/frontend && npm run build
```
Expected: clean build, no errors

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/routes/+layout.svelte
git commit -m "feat(frontend): add base layout with Tailwind styling and toast notifications"
```

---

### Task 7: Verify Vitest works

**Files:**
- Create: `apps/frontend/src/lib/utils.test.ts` (verification test)

- [ ] **Step 1: Write a test for cn()**

Write to `apps/frontend/src/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
	it('merges class names', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('handles conditional classes', () => {
		expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
	});

	it('deduplicates tailwind classes', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
	});
});
```

- [ ] **Step 2: Run tests**

```bash
cd apps/frontend && npm run test
```
Expected: 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/utils.test.ts
git commit -m "test(frontend): add cn() utility tests"
```
