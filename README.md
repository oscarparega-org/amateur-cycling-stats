# Amateur Cycling Stats

**Project category:** Commercial

Monorepo for the current Amateur Cycling Stats frontend, backend, and shared packages.

## Structure

- `apps/frontend` — current Next.js 16 and React 19 application
- `apps/backend` — current Hono API
- `packages/shared` — shared types and utilities

## Development

Install dependencies and start PostgreSQL before running the applications:

```bash
npm ci
docker compose up -d postgres
npm run db:migrate --workspace=acs-backend
npm run dev
```

### Concurrent Orca worktrees

Every Orca worktree can run an isolated stack with its own database, ports, authentication secret, and hostnames:

```bash
npm run wt:init
npm run wt:dev
```

`wt:init` creates an ignored, mode-0600 `.env.worktree`. Its identity is tied to the checkout path, and concurrent
initialization uses a lock while allocating free API, frontend, and PostgreSQL ports. `wt:dev` starts that worktree's
PostgreSQL volume, generates Prisma, deploys migrations, runs both applications with hot reload, and opens the frontend
in Orca's embedded browser when it becomes ready.

Inspect or remove the current worktree's resources with `npm run wt:status` and `npm run wt:down`. To safely remove a
different worktree, use:

```bash
npm run wt:remove -- /absolute/path/to/worktree
```

Removal refuses dirty or unregistered worktrees, closes their Orca terminals, destroys only their Compose resources,
and then delegates checkout removal to Orca. `--force` must be passed explicitly to discard uncommitted changes.

The committed `orca.yaml` installs dependencies and initializes new worktrees, starts `wt:dev` in an **App** terminal,
and runs `wt:down` before archive. Configure the Orca repository to use **orca.yaml only**, run hooks by default, and
wait for setup before starting the agent.

## Deployment

See [docs/deployment.md](docs/deployment.md) for the GitHub Actions and Coolify development deployment flow.

## Verification

```bash
npm run format:check
npm run check
npm run lint
npm test
npm run build
```

Before every push, Husky runs the complete local quality gate used by CI:

```bash
npm run prepush
```

This includes backend E2E, application and production-container builds, frontend E2E, and the browser smoke suite.
Docker must be running. Browser tests automatically start and remove a disposable PostgreSQL container; CI may instead
provide `TEST_DATABASE_URL`, whose database name must end in `_test`.

## Product specifications

OpenSpec is the source of truth for product behavior and proposed changes:

- `openspec/specs/` — verified current behavior
- `openspec/changes/` — desired changes not yet implemented
- `openspec/config.yaml` — project context and artifact rules
- `openspec/LEGACY_MIGRATION.md` — provenance for the former Superpowers and archived-project documentation
