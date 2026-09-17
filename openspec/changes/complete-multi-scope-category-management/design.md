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
- Enforce trimmed, case-insensitive names uniquely within each owner scope while allowing the same label at different scopes.
- Use the active single `ORGANIZER` membership role for organization and event writes.
- Present inherited scopes read-only and share the same React management components between admin and organizer routes.
- Do not migrate legacy distance description or route embed HTML; race descriptions remain the active content field.

## Risks / Trade-offs

- [Dropping `isGlobal` can break old clients] → Ship shared/API contract changes atomically and provide a temporary derived `scope` field during migration if needed.
- [Global uniqueness currently blocks same names across scopes] → Replace it with approved scope-aware composite constraints after auditing duplicates.
- [Concurrent category deletion and race creation] → Rely on foreign keys in addition to preflight usage checks.

## Migration Plan

1. Audit and normalize existing owner data.
2. Add `eventId`, ownership constraints, and scoped indexes, then remove `isGlobal` in the same tested deployment migration.
3. Ship the derived-scope shared/API contract and category ownership validation atomically with that migration.

## Resolved Questions

- Category names are unique per global set, organization, or event, not table-wide.
