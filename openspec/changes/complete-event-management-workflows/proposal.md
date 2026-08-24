## Why

The current event API stores and exposes event data but lacks the complete role-specific UI, lifecycle enforcement, visibility semantics, and safe deletion rules expected by the product. This change turns the existing primitives into a consistent admin, organizer, and public workflow.

## What Changes

- Add organization-scoped admin and organizer event list, detail, create, edit, publish, and delete experiences.
- Enforce forward event-status transitions and align public visibility with event state.
- Preserve independent event and race visibility while ensuring public users see only eligible content.
- Validate required location/date data and deletion eligibility, including participant/result dependencies.
- Add temporal filters, ordering, empty states, confirmation dialogs, and notifications.
- **BREAKING**: Restrict organization event reads that currently expose non-public events without authentication.

## Non-Goals

- Event registration, payment collection, ranking computation, and automatic generation of all race combinations.
- SvelteKit routes, Supabase RPCs, and RLS policies.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `event-management`: Add complete management workflows, lifecycle rules, visibility authorization, and deletion protection.

## Impact

This affects event routes/services, authorization, Prisma relations and deletion behavior, shared event contracts, and Next.js public/admin/organizer pages.

## Legacy provenance

- `archive/svelte-supabase-v1/specs/001-event-management/`
- `archive/svelte-supabase-v1/specs/002-admin-event-management/`
- `archive/svelte-supabase-v1/documentation/business/03-FEATURES.md`
- `archive/svelte-supabase-v1/documentation/business/04-BUSINESS_RULES.md`
- Archive snapshot `2b96361`; newer detailed feature decisions take precedence.
