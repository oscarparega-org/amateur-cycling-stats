## Why

Race CRUD exists at the API level, but the product needs complete event-scoped management workflows and stronger semantics for naming, visibility, editing, and deletion. The later detailed race specification supersedes the older automatic-generation-only model.

## What Changes

- Add shared admin and organizer race list, detail, create, edit, visibility, and delete workflows under an event.
- Generate race names from age, gender, and distance category labels and show a live preview.
- Validate one category of each type and uniqueness of the combination within the event.
- Default new races to public while preserving an independent visibility toggle with confirmation.
- Confirm deletion, display associated-result counts, and atomically delete a race with its results.
- **BREAKING**: Change the current hidden-by-default race behavior and define cascade deletion.

## Non-Goals

- Automatic Cartesian-product race generation during event creation.
- Registration, payments, rankings, or classification points.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `race-management`: Add the complete user workflow and strengthen naming, validation, visibility, and deletion requirements.

## Impact

This affects race and result persistence, APIs/services, authorization, category selection, shared contracts, and Next.js event subroutes for both admin and organizer contexts.

## Legacy provenance

- `archive/svelte-supabase-v1/specs/004-race-management/`
- `archive/svelte-supabase-v1/specs/newSpec.md`
- `archive/svelte-supabase-v1/specs/005-event-categories/`
- Archive snapshot `2b96361`; the later manual CRUD specification supersedes older automatic-generation/no-delete rules.
