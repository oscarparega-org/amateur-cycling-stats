## Why

The backend can store and return race results, but the product lacks a complete organizer entry workflow and polished public event/cyclist result experiences. This change makes results operable and consistently validated.

## What Changes

- Add organizer/admin result entry, edit, and delete workflows within an event and race.
- Add public event results and cyclist history views with stable ordering and category context.
- Validate unique cyclist participation per race, positive places, supported time values, and authorization.
- Add empty, loading, success, and failure states with accessible tables and forms.
- Restrict result mutation to the event organization and preserve public read rules only for visible event/race content.
- **BREAKING**: Public result reads become visibility-aware rather than universally readable.

## Non-Goals

- Event registration, payment settlement, ranking-point calculation, timing-device integration, or bulk import.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `cyclist-and-results`: Add complete result workflows, validation, visibility, and UI behavior.

## Impact

This affects result routes/services, visibility authorization, shared result contracts, and new Next.js public and organizer result pages.

## Legacy provenance

- `archive/svelte-supabase-v1/documentation/business/03-FEATURES.md`
- `archive/svelte-supabase-v1/documentation/technical/02-DATA_MODELS.md`
- `archive/svelte-supabase-v1/documentation/technical/13-VALIDATION.md`
- `docs/superpowers/specs/2026-03-13-phase2-backend-crud-api-design.md`
- Archive snapshot `2b96361`; only established result behavior is promoted here.
