## Context

Organization, organizer, invitation, Better Auth, and email primitives exist, but defaults and permissions do not yet match the target lifecycle. The implementation must preserve the Hono route/service boundary and make multi-record acceptance atomic.

## Goals / Non-Goals

**Goals:**

- Make organization activation and member permissions explicit and testable.
- Make invitation creation, delivery tracking, acceptance, and organizer conversion consistent.
- Share behavior across admin and organizer Next.js interfaces.

**Non-Goals:**

- Invitation expiry, automatic disabling, account merging, and multi-organization organizers.

## Decisions

- Change the Prisma organization default to `INACTIVE`; API clients do not control the initial state.
- Centralize member permission decisions in backend authorization helpers and expose capability flags to the UI; hidden buttons are not the security boundary.
- Validate invitation email uniqueness and role assignment before delivery, but retain a durable pending invitation if delivery fails.
- Perform organizer conversion in one Prisma transaction, including user role/profile, organizer membership, invitation status, and credential account. Remove any cyclist row inside the same transaction.
- Use Better Auth for identity/session mechanics and Resend only through the existing email abstraction.
- Implement admin and organizer routes with shared React components and context-specific route wrappers.

## Risks / Trade-offs

- [Changing the default may affect seeds and callers] → Update fixtures, seed expectations, and creation tests in the same migration.
- [Email delivery cannot be transactionally coupled to PostgreSQL] → Persist state first, expose resend, and track delivery attempts without claiming delivery success.
- [Concurrent deletion could remove the last owner] → Enforce the last-owner check transactionally rather than with a count followed by a separate delete.
- [Single-organization membership may require a database change] → Add an appropriate uniqueness constraint after auditing existing data.

## Migration Plan

1. Audit existing organizations and organizer memberships for incompatible state or multiple memberships.
2. Add constraints and change defaults in a forward Prisma migration without rewriting prior migrations.
3. Deploy backend authorization and transaction behavior before exposing new UI actions.
4. Deploy shared admin/organizer pages and email/resend feedback.
5. Roll back application behavior first; reverse database constraints only after confirming no new incompatible data exists.

## Open Questions

- None for this scoped MVP; expiration and ownership transfer remain separate future changes.
