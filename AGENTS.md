# AGENTS.md

## Repository Scope

This is an npm workspaces monorepo orchestrated by Turborepo.

- `apps/frontend` — Next.js 16, React 19, App Router, and Tailwind CSS 4
- `apps/backend` — Hono API, Prisma, Better Auth, and PostgreSQL
- `packages/shared` — shared TypeScript domain types, enums, constants, and utilities

Treat `archive/` as reference-only and do not edit it unless the task explicitly targets archived code. Do not edit generated or dependency directories such as `node_modules/`, `.next/`, `dist/`, or `.turbo/`.

## Commands

Run commands from the repository root unless a task requires otherwise.

- `npm run dev` — start the active applications through Turborepo
- `npm run build` — build all workspaces in dependency order
- `npm run check` — run TypeScript checks across the monorepo
- `npm run lint` — run configured workspace linters
- `npm run test` — run workspace and infrastructure unit tests
- `npm run test:browser` — run the Playwright application smoke test against a disposable `_test` database
- `npm run format:check` — verify repository formatting
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
- Keep custom authentication routes registered before Better Auth's `/api/auth/*` wildcard handler.
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
- Report any skipped or failing check and the reason.

## OpenSpec

The repository includes OpenSpec workflows under `.codex/skills` and `.claude/skills`. Use them when the task explicitly requests an OpenSpec change or invokes one of those workflows; do not create OpenSpec artifacts for ordinary maintenance by default.
