## Context

The race API currently permits caller-provided names, defaults visibility to false, and relies on database constraints for deletion. The new frontend has no race-management routes.

## Goals / Non-Goals

**Goals:**

- Make race identity and combination rules server-authoritative.
- Provide shared event-scoped workflows for admins and organizers.
- Make destructive and visibility changes explicit and safe.

**Non-Goals:**

- Automatic Cartesian-product race generation or registration.

## Decisions

- Generate the persisted name in the service after loading category names; ignore caller-provided generated names.
- Preserve the database composite uniqueness constraint and translate conflicts to a stable API error.
- Change the Prisma default to public and gate public reads by both race and event eligibility.
- Add explicit result cascade behavior and calculate the warning count before confirmation; repeat authorization and delete atomically on submit.
- Build one set of React race components with route context supplying admin or organizer breadcrumbs and base paths.
- Validate category ownership through the multi-scope category change before saving a race.

## Risks / Trade-offs

- [Name changes when a category is renamed] → Regenerate names for affected races transactionally or derive display names while preserving an audit-safe snapshot policy.
- [Visibility default changes existing expectations] → Apply the new default only to newly created races and leave existing values unchanged.
- [Concurrent new results after warning count] → Delete and count inside the final transaction and report the actual deleted count.

## Migration Plan

1. Add cascade behavior and public-read authorization with integration tests.
2. Make name generation authoritative and update shared API contracts.
3. Change the new-record visibility default without rewriting existing rows.
4. Add shared Next.js management routes and confirmation flows.

## Open Questions

- Decide whether persisted generated names are historical snapshots or always track category renames before implementing rename propagation.
