# Amateur Cycling Stats

**Project category:** Commercial

Amateur Cycling Stats is a Spanish-language platform for publishing amateur cycling events and managing the
organizations that run them. The active codebase is an npm workspaces monorepo orchestrated by Turborepo.

## Current application

The implemented user-facing workflows are:

- Public visitors can browse upcoming, public events and open event details.
- Cyclists can register with email and password, verify their email, sign in with Google when configured, recover
  their password, and manage their authenticated session.
- Administrators can list, create, view, edit, activate, and deactivate organizations under `/admin`.
- Organizers can switch into their assigned organization, list and filter its events, create and edit drafts, publish
  or hide events, and permanently delete draft events under `/organizer`.
- Invited organizers can authenticate through a magic link and finish their profile and password setup.

The backend also implements CRUD APIs for race categories, races, race results, cyclists, organizers, and
invitations. Those areas do not yet have complete management screens in the active frontend. The cyclist role has
authentication and domain support, but no dedicated cyclist dashboard yet.

## Architecture

| Workspace         | Responsibility                                                          | Main technology                                  |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/frontend`   | Public site, authentication pages, admin console, and organizer console | Next.js 16, React 19, App Router, Tailwind CSS 4 |
| `apps/backend`    | HTTP API, authorization, application services, and persistence          | Hono, Better Auth, Prisma, PostgreSQL            |
| `packages/shared` | Cross-workspace domain types, enums, constants, and utilities           | TypeScript                                       |

The frontend acts as a browser-facing layer: server components and server actions call the backend and forward the
session cookie. Authentication endpoints are proxied through `/api/auth/*`. Backend application code follows a
route -> service -> Prisma/adapter boundary, and shared API contracts live in `@acs/shared`.

## Requirements

- Node.js 22.20.0 (declared in `.nvmrc` and used by CI)
- npm 10 (the repository declares `npm@10.9.3`)
- Docker with Compose for local PostgreSQL, browser tests, and container verification

## Local development

Install dependencies, create local environment files, start PostgreSQL, prepare the database, and run both apps:

```bash
npm ci
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
docker compose up -d postgres
npm run db:migrate --workspace=acs-backend
npm run db:seed --workspace=acs-backend
npm run dev
```

The default URLs are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Backend health check: `http://localhost:3000/health`
- PostgreSQL: `localhost:5432`

The committed examples contain development-safe placeholders. Replace the authentication secret with at least 32
characters. Resend and Google credentials are optional in development but required in production; without Resend,
authentication emails are logged instead of delivered. Never commit populated environment files.

The development seed is idempotent and adds reference categories plus these local-only accounts:

| Role          | Email                   | Password      |
| ------------- | ----------------------- | ------------- |
| Administrator | `admin@acs.com`         | `#admin123`   |
| Organizer     | `organizer@example.com` | `password123` |
| Cyclist       | `cyclist1@example.com`  | `password123` |

Development accounts are skipped when `NODE_ENV=production`.

## Concurrent Orca worktrees

Every Orca worktree can run an isolated stack with its own database, ports, authentication secret, and hostnames:

```bash
npm run wt:init
npm run wt:dev
```

`wt:init` creates an ignored, mode-0600 `.env.worktree`. Its identity is tied to the checkout path, and concurrent
initialization uses a lock while allocating free API, frontend, and PostgreSQL ports. `wt:dev` starts that worktree's
PostgreSQL volume, generates Prisma, deploys migrations, runs both applications with hot reload, and opens the frontend
in Orca's embedded browser when it becomes ready.

Use the URLs printed by `wt:dev` or `npm run wt:status`; worktree ports are intentionally not fixed. Inspect or stop the
current worktree's resources with `npm run wt:status` and `npm run wt:down`. To safely remove a different worktree, run
the following command from another checkout:

```bash
npm run wt:remove -- /absolute/path/to/worktree
```

Removal refuses dirty or unregistered worktrees, closes their Orca terminals, destroys only their Compose resources,
and then delegates checkout removal to Orca. Pass `--force` only when intentionally discarding uncommitted changes.
The committed `orca.yaml` owns setup, the **App** terminal, and archive cleanup.

## Useful commands

| Command                    | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`              | Start the frontend and backend through Turborepo                           |
| `npm run build`            | Build every workspace in dependency order                                  |
| `npm run check`            | Run TypeScript checks across the monorepo                                  |
| `npm run lint`             | Run workspace and root tooling linters                                     |
| `npm test`                 | Run workspace unit/component tests and infrastructure tests                |
| `npm run test:e2e`         | Run backend authentication E2E tests with Testcontainers                   |
| `npm run test:browser`     | Build and smoke-test the application against a disposable `_test` database |
| `npm run build:containers` | Build and validate production container images                             |
| `npm run format:check`     | Verify Prettier formatting                                                 |
| `npm run precommit`        | Run the fast local quality gate                                            |
| `npm run prepush`          | Run the complete CI-equivalent local quality gate                          |

Target a workspace with `npm run <script> --workspace=<workspace-name>`, for example
`npm run test --workspace=acs-frontend`.

## API overview

The active backend exposes:

- `/health` — process and database health
- `/api/auth/*` — Better Auth plus current-user and organizer onboarding endpoints
- `/api/organizations` — organization management
- `/api/events` — public discovery and authorized event management
- `/api/categories/{age,gender,distance}` — global and organization-scoped race categories
- `/api/races` and `/api/race-results` — public visible data and authorized management
- `/api/cyclists`, `/api/organizers`, and `/api/invitations` — participant and organization membership workflows

Public reads filter private events, races, and results. Writes are guarded by administrator role, organization
membership, resource ownership, or a combination appropriate to the resource. See
[apps/backend/AUTHENTICATION.md](apps/backend/AUTHENTICATION.md) for authentication setup and behavior.

## Verification

Run focused workspace checks while iterating. Before pushing a complete change, the canonical full gate is:

```bash
npm run prepush
```

It includes formatting, type checking, linting, unit and component tests, dependency auditing, backend E2E tests,
application builds, frontend Playwright tests, the disposable-database browser smoke suite, and production-container
builds. Docker must be running. When CI supplies `TEST_DATABASE_URL`, its database name must end in `_test`.

## Product specifications

OpenSpec is the source of truth for product behavior and proposed changes:

- `openspec/specs/` — verified current behavior
- `openspec/changes/` — desired changes not yet implemented
- `openspec/config.yaml` — project context and artifact rules
- `openspec/LEGACY_MIGRATION.md` — provenance for the former Superpowers and archived-project documentation

## Further documentation

- [Authentication](apps/backend/AUTHENTICATION.md)
- [Deployment](docs/deployment.md)
- [Single organizer role decision](docs/architecture/adr-001-single-organizer-role.md)
- [Admin feature status](docs/admin-feature-comparison.md)

Production deployment is controlled only by GitHub Actions. The workflow deploys the exact tested SHA to Coolify;
Coolify auto-deploy must remain disabled.
