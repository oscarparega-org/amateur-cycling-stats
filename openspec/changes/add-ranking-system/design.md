## Context

The archive proposes lookup tables, point rules, and result/race references, but historical point schedules and recalculation semantics were never approved for the new product.

## Goals / Non-Goals

**Goals:**

- Preserve configurable ranking intent and immutable historical awards.
- Integrate ranking into race configuration and result presentation.

**Non-Goals:**

- Approving legacy A/B/C/D or federation schedules, season standings, or external synchronization.

## Decisions

- Separate `RankingSystem` identity from ordered `RankingPointRule` rows and reference the system optionally from a race.
- Store awarded points on the result as a snapshot plus ranking reference for auditability.
- Permit inactive rankings for history but not new assignment.
- Seed no governing-body schedule until the source and license are validated; custom schedules are admin-managed.

## Risks / Trade-offs

- [Retroactive corrections may be required] → Design an explicit audited recalculation operation rather than automatic updates.
- [Ties affect point allocation] → Defer implementation tasks until tie policy is decided.
- [Ranking scope may be global or organization-specific] → Resolve ownership before final schema design.

## Migration Plan

Discovery stage only: decide ranking ownership, ties, finalization/recalculation, and approved seed sources; then generate implementation tasks and migrations.

## Open Questions

- Global versus organization-owned ranking systems.
- Tie-point allocation and when a result becomes final.
- Whether standings are computed on demand or materialized in a later change.
