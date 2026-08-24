## Why

The former Svelte frontend was replaced by a minimal Next.js shell, leaving navigation, localization, accessibility, and reusable management patterns to be rebuilt. This change preserves useful product behavior without carrying forward obsolete framework mechanics.

## What Changes

- Establish role-aware public, cyclist, organizer, and admin application shells.
- Define an accessible React component foundation for forms, tables, tabs, dialogs, notifications, and the menu toolbar pattern.
- Support Spanish as the default locale and English as an alternate locale with server-aware selection and persistence.
- Apply responsive layouts, keyboard navigation, focus management, form error association, and live feedback.
- Define loading, empty, error, confirmation, and success behaviors shared by management modules.

## Non-Goals

- Selecting a specific React component library before a focused evaluation.
- Porting shadcn-svelte, bits-ui, Svelte stores, SvelteKit actions, or the old i18n implementation.
- Building every product page in this foundation change.

## Capabilities

### New Capabilities

- `frontend-experience`: Shared navigation, design-system, localization, accessibility, and interaction requirements for the Next.js application.

### Modified Capabilities

- None.

## Impact

This will affect frontend dependencies, App Router layouts, middleware or locale routing, reusable components, design tokens, and UI testing strategy. Component-library selection remains a discovery decision.

## Legacy provenance

- `docs/superpowers/specs/2026-03-23-phase5-1-frontend-framework-setup-design.md`
- `docs/superpowers/specs/2026-03-28-phase5-2-i18n-setup-design.md`
- `archive/svelte-supabase-v1/documentation/technical/06-DESIGN_SYSTEM.md`
- `archive/svelte-supabase-v1/documentation/technical/07-UI_PATTERNS.md`
- `archive/svelte-supabase-v1/documentation/technical/14-ACCESSIBILITY.md`
- Only product behavior is retained; all Svelte-specific implementation is obsolete.
