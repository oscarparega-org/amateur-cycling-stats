## Context

The active frontend is a minimal Next.js 16/React 19 shell. The archive contains mature Svelte interaction and accessibility guidance, but its component and i18n implementations are not reusable directly.

## Goals / Non-Goals

**Goals:**

- Preserve stable UX, localization, and accessibility expectations in a Next-native design.
- Establish reusable primitives before feature pages multiply.

**Non-Goals:**

- Choosing a React component library or implementing all product modules during discovery.

## Decisions

- Keep App Router and server rendering as the foundation; client components are limited to interactions that require browser state.
- Define semantic component interfaces and design tokens before selecting or building underlying primitives.
- Use route-aware server locale resolution with Spanish fallback and a persisted explicit preference; exact library selection follows a proof-of-concept.
- Keep admin and organizer page composition shared, with authorization enforced by the backend and reflected by server-derived capability data.
- Require automated accessibility checks plus manual keyboard and screen-reader smoke tests for critical patterns.

## Risks / Trade-offs

- [Premature library choice could constrain React 19/Next 16] → Evaluate maintained accessible options against dialogs, tabs, forms, tables, and SSR before adoption.
- [Localized routes versus cookie locale affects URLs/SEO] → Decide URL strategy before implementing middleware and translation loading.
- [Old visual tokens may not fit the new product] → Preserve semantics, not exact Svelte CSS.

## Migration Plan

Discovery stage only: prototype locale routing and one CRUD flow, choose the accessible component strategy, then produce implementation tasks. No Svelte frontend files are copied.

## Open Questions

- Locale-prefixed URLs versus cookie/header-only locale selection.
- Adopted accessible React primitives and form-validation library.
- Formal browser support matrix and visual brand refresh scope.
