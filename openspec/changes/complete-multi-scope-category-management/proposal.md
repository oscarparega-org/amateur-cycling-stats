## Why

The current API supports global and organization categories, but the target product requires consistent category management at global, organization, and event scope. Event-scoped categories are also required for complete race configuration.

## What Changes

- Add admin UI and APIs for global category management.
- Add admin and organizer UI for organization-scoped category CRUD.
- Add event-scoped age, gender, and distance categories owned by exactly one event.
- Replace the `isGlobal` flag with scope derived from mutually exclusive `organizationId` and `eventId` values.
- Allow organizers belonging to an organization to manage its organization/event categories while keeping global writes admin-only.
- Protect default categories, validate age ranges, and block deletion of categories used by races.
- Update race forms to present Global, Organization, and Event columns in one selection group per type.
- Show inherited categories as read-only references on organization and event category pages.
- Keep distance categories focused on name and decimal distance; legacy description and raw route embeds are excluded.
- **BREAKING**: Change category scope representation and shared/API contracts.

## Non-Goals

- Free-form categories outside age, gender, and distance.
- Copying Supabase RLS/RPC or Svelte components into the new stack.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `category-management`: Add complete three-scope CRUD, validation, permissions, and navigation.
- `race-management`: Make all valid scope levels available during race creation and editing.

## Impact

This requires a Prisma data migration, shared type changes, category and race API/service changes, authorization changes, and reusable Next.js category-management interfaces.

## Legacy provenance

- `archive/svelte-supabase-v1/specs/001-admin-categories/`
- `archive/svelte-supabase-v1/specs/003-org-categories/`
- `archive/svelte-supabase-v1/specs/005-event-categories/`
- `archive/svelte-supabase-v1/specs/categoriesAtEventLevel.md`
- Archive snapshot `2b96361`; the event-level spec is authoritative for scope representation.
