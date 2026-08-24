## Context

Three tables currently use `isGlobal` plus optional `organizationId`. The target adds event ownership and requires uniform behavior across three category types and two management roles.

## Goals / Non-Goals

**Goals:**

- Represent category ownership unambiguously at global, organization, or event scope.
- Share validation, permissions, and React management primitives across all category types.

**Non-Goals:**

- Collapsing the three typed category tables into one polymorphic table.

## Decisions

- Add nullable `eventId` to each category table, remove `isGlobal`, and add a check constraint preventing simultaneous organization/event ownership.
- Preserve three typed resources because their fields differ and current race foreign keys already target them.
- Use a discriminated shared contract with derived scope so API consumers do not infer ownership repeatedly.
- Resolve event ownership server-side and validate every selected category against the race's event and organization.
- Factor common service helpers and React category screens while keeping type-specific input schemas.
- Use explicit API scope parameters/endpoints for management lists; do not overload a public query in ways that disclose other scopes.

## Risks / Trade-offs

- [Dropping `isGlobal` can break old clients] → Ship shared/API contract changes atomically and provide a temporary derived `scope` field during migration if needed.
- [Global uniqueness currently blocks same names across scopes] → Replace it with approved scope-aware composite constraints after auditing duplicates.
- [Concurrent category deletion and race creation] → Rely on foreign keys in addition to preflight usage checks.

## Migration Plan

1. Add `eventId` and ownership constraints while retaining `isGlobal` temporarily.
2. Backfill ownership and deploy dual-read code plus category compatibility tests.
3. Switch APIs/shared types/UI to derived scope and validate race ownership.
4. Drop `isGlobal` in a follow-up migration after no old client depends on it.

## Open Questions

- Name uniqueness should be finalized per category type and scope before the migration is generated; legacy sources conflict between global uniqueness and duplicate event labels.
