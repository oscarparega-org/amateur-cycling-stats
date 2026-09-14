# AGENTS.md

## Repository Scope

This is an npm workspaces monorepo orchestrated by Turborepo.

- `apps/frontend` — Next.js 16, React 19, App Router, and Tailwind CSS 4
- `apps/backend` — Hono API, Prisma, Better Auth, and PostgreSQL
- `packages/shared` — shared TypeScript domain types, enums, constants, and utilities

Treat `archive/` as reference-only and do not edit it unless the task explicitly targets archived code. Do not edit generated or dependency directories such as `node_modules/`, `.next/`, `dist/`, or `.turbo/`.

## Product and Feature State

- The active product UI supports English and Spanish under `/en` and `/es`. Keep URL slugs in English, localize visible
  content, use `en-US` formatting for English, and preserve `es-MX` formatting for Spanish.
- `/[locale]` lists upcoming public events and `/[locale]/events/[id]` shows a public event. Public discovery must never
  expose hidden events or races.
- `/admin` is administrator-only. Its implemented scope is organization list/create/view/edit and active/inactive
  lifecycle management; permanent organization deletion exists only in the API.
- `/organizer` is organizer-only and selects the first organization available to the signed-in organizer. Organization
  pages support event list/filter/create/edit/publish/show/hide and draft deletion.
- Authentication includes email/password registration, email verification, Google sign-in, password reset, and
  organizer invitation magic links. New self-service users receive the `CYCLIST` role.
- Categories, races, race results, cyclists, organizers, and invitations have backend APIs but do not yet have complete
  management UI. Do not describe API availability as frontend feature completion.
- The active role model has one `ORGANIZER` role per organization membership. Do not restore legacy owner/staff
  distinctions from `archive/`.

## Commands

Run commands from the repository root unless a task requires otherwise.

- `npm run dev` — start the active applications through Turborepo
- `npm run build` — build all workspaces in dependency order
- `npm run check` — run TypeScript checks across the monorepo
- `npm run lint` — run configured workspace linters
- `npm run test` — run workspace and infrastructure unit tests
- `npm run test:e2e` — run backend authentication E2E tests with Testcontainers
- `npm run test:browser` — run the Playwright application smoke test against a disposable `_test` database
- `npm run build:containers` — build and validate the production images
- `npm run format:check` — verify repository formatting
- `npm run precommit` — run formatting, type checking, linting, and unit/component/infrastructure tests
- `npm run prepush` — run the complete local CI-equivalent quality gate
- `npm run <script> --workspace=<workspace-name>` — target one workspace, for example `npm run check --workspace=acs-backend`
- `npm run db:generate`, `npm run db:migrate`, `npm run db:seed` — run Prisma tasks through Turborepo

Use npm and keep `package-lock.json` in sync when dependencies change.

Linting, formatting, backend tests, frontend component tests, infrastructure tests, and browser smoke tests are real
quality gates. Keep new tooling code covered by focused tests.

## Orca Worktrees

- Keep setup, App terminal, and archive hooks in `orca.yaml`; do not duplicate them in Orca's local repository settings.
- Use `npm run wt:dev` for an isolated PostgreSQL volume and worktree-specific API, frontend, and database ports.
- Never copy or commit `.env.worktree`; it contains local secrets and is validated against its checkout path.
- Use the URLs printed by `wt:dev` or `wt:status` instead of assuming the default development ports.
- Let the Orca archive hook run `wt:down`. For explicit removal, run `wt:remove` from a different checkout and use
  `--force` only when intentionally discarding uncommitted changes.
- Do not delete shared Docker images or build caches during worktree cleanup.

## Branch Naming

- Name branches by the type and purpose of the change using `<type>/<short-description>`.
- Use one of these prefixes when applicable: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, or `test/`.
- Write the description in lowercase kebab-case, for example `feat/hono-authentication` or `chore/openspec-migration`.
- Do not prefix branch names with an agent, tool, or author name such as `codex/` or `claude/`.

## Code and Architecture

- Preserve strict TypeScript typing. Prefer explicit domain types and `unknown` with narrowing over `any`.
- Put contracts shared by multiple workspaces in `@acs/shared`; do not duplicate shared domain models in an app.
- In the backend, preserve the route -> service -> Prisma/adapter boundary. Routes handle HTTP concerns, services implement application behavior and persistence calls, and adapters map database records to shared domain types.
- Keep `.js` extensions on relative imports in backend and shared TypeScript source; these workspaces emit ESM.
- In the frontend, follow Next.js App Router conventions and use the `@/` alias for imports from `apps/frontend/src`.
- Prefer server components for data reads and server actions for protected mutations. Use `backendFetch` so server-side
  requests forward the session cookie, opt out of stale caching, and preserve the frontend/backend boundary.
- Keep typed Next.js routes intact. Dynamic organizer/admin links may require `Route` typing where the compiler cannot
  infer the route.
- Keep client-side validation aligned with the backend Zod schemas, while treating backend validation and
  authorization as authoritative.
- Keep custom authentication routes registered before Better Auth's `/api/auth/*` wildcard handler.
- Preserve the access model: public reads only return public event/race/result data; global category writes require an
  admin; organization-scoped writes require an admin or membership in that organization; event, race, and result
  mutations inherit authorization through their parent organization.
- Do not trust role, status, organization membership, or invitation ownership from request payloads. These fields are
  server-owned and must be established from the session and database.
- Events are created as hidden drafts. Publishing sets the event to `AVAILABLE` and public; only draft events may be
  deleted through the current organizer workflow.
- Never commit secrets or expose values from `.env`. Update the relevant `.env.example` with safe placeholders when adding configuration.
- Keep GitHub Actions as the only deployment controller. Deploy the exact tested SHA and leave Coolify auto-deploy off.

## Database Changes

- Update `apps/backend/prisma/schema.prisma` for schema changes and create a new Prisma migration.
- Do not rewrite an existing committed migration unless the task explicitly requires repairing migration history.
- Treat migrations and seed operations as stateful. Do not run them against an unspecified or non-development database.

## Verification

- Run the narrowest relevant checks while iterating.
- Before handoff, run `npm run check` and the relevant workspace lint/build commands when practical.
- Add or update tests when a real test framework exists for the affected workspace. Until then, clearly state that automated test coverage is unavailable rather than treating the placeholder test command as validation.
- Frontend component and utility tests use Vitest and Testing Library. Frontend authentication-flow E2E tests live in
  `apps/frontend/test/e2e`; full-application smoke tests live in `tests/browser`.
- Backend unit tests use the `unit` Vitest project. Authentication E2E tests use Testcontainers and require Docker.
- Browser tests must use a disposable PostgreSQL database whose name ends in `_test`; never point them at a development
  or production database.
- Report any skipped or failing check and the reason.

## OpenSpec

The repository includes OpenSpec workflows under `.codex/skills` and `.claude/skills`. Use them when the task explicitly requests an OpenSpec change or invokes one of those workflows; do not create OpenSpec artifacts for ordinary maintenance by default.

Treat `openspec/specs` as verified current behavior and `openspec/changes` as proposed behavior. Read `openspec/config.yaml` before creating artifacts, and use `openspec/LEGACY_MIGRATION.md` when tracing requirements migrated from the former Superpowers or archived Svelte/Supabase documentation.
