## Context

Result CRUD and denormalized adapters exist, but reads do not enforce visibility and no frontend workflows exist. Registration eligibility is planned separately.

## Goals / Non-Goals

**Goals:**

- Secure result visibility and mutation.
- Provide validated organizer entry plus public event/cyclist views.

**Non-Goals:**

- Payments, rankings, timing hardware, and bulk imports.

## Decisions

- Scope management endpoints by event/race and derive authorization from the race rather than accepting organization IDs from clients.
- Apply event and race visibility predicates to all public result queries.
- Introduce runtime schemas for place/time input and keep the database uniqueness constraint on `(raceId, cyclistId)`.
- Build reusable result-table components with separate management controls and public read-only presentation.
- Until registration exists, use current cyclist existence as eligibility; integrate registration checks when that dependent change is implemented.

## Risks / Trade-offs

- [Current public URLs may stop returning hidden data] → Treat this as an intentional security fix and add explicit member endpoints.
- [Place uniqueness is not currently modeled] → Do not assume ties are forbidden; define tie policy before adding a unique place constraint.
- [Time stored as free text] → Preserve compatibility initially and define a normalized duration model before schema conversion.

## Migration Plan

1. Add visibility-aware query functions and authorization tests.
2. Add runtime validation and stable conflict/error responses.
3. Build management and public Next.js pages.
4. Add registration eligibility behind the future registration capability.

## Open Questions

- Tie handling and the canonical duration format require product decisions before tightening database constraints.
