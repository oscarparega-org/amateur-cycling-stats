## Why

The archive documents useful security, validation, performance, accessibility, and deployment practices, while the current project has only a basic runtime foundation. Consolidating stable expectations into one discovery-stage change creates a deliberate hardening path without copying obsolete Supabase/Coolify procedures.

## What Changes

- Define authentication, authorization, privacy, validation, rate-limiting, headers, secret, and audit requirements.
- Define performance budgets, database indexing/query expectations, observability, and failure monitoring.
- Define safe migrations, backups, environment promotion, deployment health checks, and rollback expectations.
- Replace legacy RLS/RPC controls with equivalent API/service/database enforcement appropriate to Hono and Prisma.

## Non-Goals

- Selecting hosting, monitoring, rate-limit, cache, or backup vendors before operational requirements are measured.
- Copying historical Supabase ports, commands, RLS functions, or Coolify-specific runbooks.

## Capabilities

### New Capabilities

- `platform-hardening`: Cross-cutting security, validation, performance, observability, deployment, and recovery requirements.

### Modified Capabilities

- `platform-runtime`: Add operational safety and measurable runtime-quality expectations.
- `identity-and-access`: Add session, authorization, abuse-prevention, and audit hardening.

## Impact

This may affect all workspaces, middleware, validation, database indexes, deployment configuration, telemetry, security testing, and operational documentation. Vendor and target selection remains discovery work.

## Legacy provenance

- `archive/svelte-supabase-v1/documentation/technical/03-RLS_POLICIES.md`
- `archive/svelte-supabase-v1/documentation/technical/10-DEPLOYMENT.md`
- `archive/svelte-supabase-v1/documentation/technical/11-SECURITY.md`
- `archive/svelte-supabase-v1/documentation/technical/12-PERFORMANCE.md`
- `archive/svelte-supabase-v1/documentation/technical/13-VALIDATION.md`
- Archive snapshot `2b96361`; requirements are adapted to the current stack.
