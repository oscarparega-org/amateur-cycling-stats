## Why

The legacy product defined race ranking systems and position-based points, but the current project has no ranking domain. Preserving the intent as a discovery-stage change prevents detailed historical work from being lost while avoiding premature implementation commitments.

## What Changes

- Introduce configurable ranking systems and place-to-points tables.
- Associate a race with a ranking system and a result with awarded points.
- Display ranking and points in public event results and cyclist history.
- Preserve custom and seeded ranking concepts while requiring product review of exact point tables.

## Non-Goals

- Finalizing historical A/B/C/D or UCI point schedules without product and governing-body validation.
- Season standings, tie-breaking, team rankings, sanctions, or external federation synchronization.

## Capabilities

### New Capabilities

- `ranking-system`: Ranking definitions, point schedules, race assignment, and result points.

### Modified Capabilities

- `race-management`: Allow a race to reference a ranking system.
- `cyclist-and-results`: Expose awarded ranking points in results and cyclist history.

## Impact

This will affect Prisma, shared contracts, race/result APIs, seed data, organizer configuration UI, and public result views. Exact ranking semantics remain discovery work.

## Legacy provenance

- `archive/svelte-supabase-v1/documentation/future-features/RANKING_SYSTEM.md`
- `archive/svelte-supabase-v1/documentation/business/04-BUSINESS_RULES.md`
- Archive snapshot `2b96361`; historical point tables are assumptions, not approved requirements.
