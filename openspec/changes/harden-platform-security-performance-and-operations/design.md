## Context

The legacy project relied heavily on Supabase RLS and Coolify procedures. The active stack moves policy into Hono authorization, Prisma/database constraints, Next.js, and new deployment infrastructure that has not yet been selected.

## Goals / Non-Goals

**Goals:**

- Establish measurable cross-cutting security, validation, performance, observability, deployment, and recovery expectations.
- Preserve defense in depth while adapting controls to the current stack.

**Non-Goals:**

- Selecting vendors or copying old Supabase/Coolify commands and ports.

## Decisions

- Enforce authorization in Hono for every protected request and reinforce invariants with PostgreSQL constraints; do not depend on UI hiding.
- Standardize runtime validation and structured error contracts at route boundaries.
- Introduce structured logging with request correlation and a separate audit-event model for privileged mutations.
- Define performance budgets from measurements before selecting caches or adding Redis.
- Make deployment provider-neutral: immutable build, preflight checks, forward-compatible migrations, health gates, backup verification, and rollback/forward-fix playbooks.
- Add security and accessibility checks to CI only after thresholds and ownership are agreed.

## Risks / Trade-offs

- [One hardening change can become too broad] → Split implementation into validation/security, observability/performance, and deployment/recovery follow-up changes after discovery.
- [Logging can leak personal data] → Define redaction and retention before enabling detailed production logs.
- [Rollback is unsafe after data migration] → Prefer expand/migrate/contract migrations and explicit forward fixes.

## Migration Plan

Discovery stage only: create a threat model, data classification, endpoint authorization matrix, SLO/performance baseline, and deployment/recovery requirements; select tools afterward and generate smaller implementation changes.

## Open Questions

- Hosting, monitoring, rate limiting, backup, and incident-management providers.
- Approved SLOs, RPO/RTO, retention periods, browser matrix, and release-blocking thresholds.
