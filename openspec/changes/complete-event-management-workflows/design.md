## Context

The backend currently offers flat CRUD with public reads and caller-supplied year/status fields. The new Next.js frontend has no management pages. Event behavior must be secured before the UI relies on it.

## Goals / Non-Goals

**Goals:**

- Establish authoritative lifecycle, visibility, filtering, and deletion behavior.
- Provide consistent admin and organizer interfaces over shared backend rules.

**Non-Goals:**

- Registration, payments, ranking, and automatic race generation.

## Decisions

- Put lifecycle and deletion policy in the event service and enforce authorization in routes; clients never decide eligibility.
- Separate public event endpoints from authenticated management queries so public filtering cannot accidentally expose drafts.
- Derive `year` server-side from `dateTime` and validate request bodies with a runtime schema at the route boundary.
- Keep event and race visibility independent, while public race access requires both event and race eligibility.
- Use database cascades only for dependents explicitly approved for deletion and wrap destructive operations in a transaction.
- Build shared React views with admin/organizer route adapters rather than duplicating management components.

## Risks / Trade-offs

- [Restricting existing reads is breaking] → Introduce explicit public and management query paths and update the frontend before removing legacy behavior.
- [Date boundaries depend on timezone] → Store UTC instants and define filtering using the server's agreed event timezone policy.
- [Delete rules depend on registration entities not yet implemented] → Implement result protection now and extend the same policy when registration lands.

## Migration Plan

1. Add request validation, lifecycle policy, secured query paths, and tests.
2. Add or repair cascade constraints using a new Prisma migration.
3. Build management and public Next.js routes against the secured API.
4. Deprecate the unrestricted organization list behavior after clients migrate.

## Open Questions

- Multi-day event duration remains outside this change until its data shape is specified.
