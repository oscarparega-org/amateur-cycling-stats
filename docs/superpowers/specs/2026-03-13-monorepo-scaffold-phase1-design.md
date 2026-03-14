# Phase 1 Design: Monorepo Scaffold + Database Schema

## Overview

Migrate the Amateur Cycling Stats application from a single SvelteKit + Supabase app to a Turborepo monorepo with an independent backend (HonoJS + Prisma + PostgreSQL) and frontend (SvelteKit). Phase 1 covers the monorepo scaffold, database schema, and basic wiring — no business logic yet.

## Context & Motivation

The existing app (`amateur-cycling-stats-supabase/`) uses Supabase for auth, database (with RLS), and some mailing. The lack of flexibility with Supabase is driving the migration to a fully independent backend. The existing app remains untouched as reference.

## Architecture

### Monorepo Structure

```
amateur-cycling-stats/
├── amateur-cycling-stats-supabase/   # Existing app, untouched
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace config (npm workspaces)
├── docker-compose.yml                # Dev: PostgreSQL only
├── docker-compose.prod.yml           # Prod: PostgreSQL + backend + frontend
├── .env.example                      # Root env vars documentation
├── apps/
│   ├── backend/                      # Hono + Prisma + BetterAuth (future)
│   │   ├── src/
│   │   │   ├── index.ts              # Hono app entry point
│   │   │   ├── routes/
│   │   │   │   ├── health.ts         # GET /health
│   │   │   │   └── index.ts          # Route aggregator
│   │   │   ├── middleware/
│   │   │   │   └── error-handler.ts  # Global error handling
│   │   │   ├── lib/
│   │   │   │   └── prisma.ts         # Prisma client singleton
│   │   │   └── types/
│   │   │       └── env.ts            # Environment variable types
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts               # Seed roles, categories, genders
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── frontend/                     # SvelteKit shell (full migration in Phase 5)
│       ├── src/
│       │   ├── routes/
│       │   │   └── +page.svelte      # Health check test page
│       │   ├── lib/
│       │   │   └── api/
│       │   │       └── client.ts      # Fetch wrapper for backend API
│       │   ├── app.css
│       │   └── app.html
│       ├── Dockerfile
│       ├── svelte.config.js
│       ├── vite.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
└── packages/
    └── shared/                       # @acs/shared
        ├── src/
        │   ├── index.ts
        │   ├── types/
        │   │   └── domain/           # Domain types (User, Event, Race, etc.)
        │   ├── enums/                # RoleTypeEnum, UserStatus, etc.
        │   └── constants/            # Error codes, shared constants
        ├── package.json
        └── tsconfig.json
```

### Technology Stack

| Layer     | Technology                     | Version |
|-----------|--------------------------------|---------|
| Monorepo  | Turborepo + npm workspaces     | Latest  |
| Runtime   | Node.js                        | 22      |
| Language  | TypeScript (strict)            | 5.x     |
| Backend   | Hono (`@hono/node-server`)     | Latest  |
| ORM       | Prisma                         | Latest  |
| Database  | PostgreSQL                     | 16      |
| Frontend  | SvelteKit + Svelte 5           | Latest  |
| Styling   | Tailwind CSS                   | 4.x     |
| Container | Docker + Docker Compose        | Latest  |

## Database Schema (Prisma)

### Models

#### Role
- `id` UUID PK
- `name` String unique — `PUBLIC`, `CYCLIST`, `ORGANIZER_STAFF`, `ORGANIZER_OWNER`, `ADMIN`
- Relations: `users User[]`

#### User
- `id` UUID PK
- `email` String? unique
- `firstName` String
- `lastName` String? (nullable — matches existing DB where `last_name TEXT` allows NULL)
- `status` enum `UserStatus` — `ACTIVE`, `INACTIVE`, `PENDING`, `UNREGISTERED`
- `roleId` String FK → Role
- Relations: `role`, `cyclist?`, `organizers[]`, `createdEvents[]`, `sentInvitations[]`
- Timestamps: `createdAt`, `updatedAt`

#### Organization
- `id` UUID PK
- `name` String
- `description` String?
- `state` enum `OrganizationState` — `ACTIVE`, `INACTIVE`
- Relations: `organizers[]`, `events[]`, `invitations[]`
- Timestamps: `createdAt`, `updatedAt`

#### Organizer
- `id` UUID PK
- `userId` String FK → User
- `organizationId` String FK → Organization
- Unique constraint: `(userId, organizationId)`
- Timestamps: `createdAt`, `updatedAt`

#### Cyclist
- `id` UUID PK
- `userId` String unique FK → User
- `bornYear` Int?
- `genderId` String? FK → CyclistGender
- Relations: `user`, `gender?`, `raceResults[]`
- Timestamps: `createdAt`, `updatedAt`

#### CyclistGender
- `id` UUID PK
- `name` String unique — `M`, `F`

#### Event
- `id` UUID PK
- `name` String
- `description` String?
- `dateTime` DateTime (NOT NULL — matches existing DB)
- `eventStatus` enum `EventStatus` — `DRAFT`, `AVAILABLE`, `SOLD_OUT`, `ON_GOING`, `FINISHED`
- `year` Int
- `country` String, `state` String (both NOT NULL), `city` String? (nullable)
- `isPublicVisible` Boolean default `false`
- `createdBy` String FK → User
- `organizationId` String? FK → Organization
- Relations: `creator`, `organization?`, `races[]`
- Timestamps: `createdAt`, `updatedAt`

#### Race
- `id` UUID PK
- `eventId` String FK → Event
- `name` String?
- `description` String?
- `dateTime` DateTime (NOT NULL — matches existing DB)
- `raceCategoryAgeId` String FK → RaceCategory
- `raceCategoryGenderId` String FK → RaceCategoryGender
- `raceCategoryDistanceId` String FK → RaceCategoryLength
- `isPublicVisible` Boolean default `false`
- Unique constraint: `(eventId, raceCategoryAgeId, raceCategoryGenderId, raceCategoryDistanceId)`
- Relations: `event`, `categoryAge`, `categoryGender`, `categoryDistance`, `results[]`
- Timestamps: `createdAt`, `updatedAt`
- **Note:** The existing Supabase schema includes a `race_ranking_id` FK → `race_rankings` table used for ranking systems. This is intentionally omitted from Phase 1 as ranking is not yet in scope. It will be added in a future phase when the ranking system is implemented.

#### RaceResult
- `id` UUID PK
- `raceId` String FK → Race
- `cyclistId` String FK → Cyclist
- `time` String?
- `place` Int
- Unique constraint: `(raceId, cyclistId)`
- Timestamps: `createdAt`, `updatedAt`

#### RaceCategory
- `id` UUID PK
- `name` String unique — 26 Spanish age categories (Absoluta, Elite, Sub-23, Juvenil, Master A-E, etc.)
- `fromAge` Int? — minimum age for this category
- `toAge` Int? — maximum age for this category
- `isGlobal` Boolean default `true` — system-wide vs org-specific
- `isDefault` Boolean default `false` — protected from deletion
- `organizationId` String? FK → Organization — null for global categories
- Timestamps: `createdAt`, `updatedAt`

#### RaceCategoryGender
- `id` UUID PK
- `name` String unique — `Femenino`, `Masculino`, `Abierto`
- `isGlobal` Boolean default `true`
- `isDefault` Boolean default `false`
- `organizationId` String? FK → Organization
- Timestamps: `createdAt`, `updatedAt`

#### RaceCategoryLength
- `id` UUID PK
- `name` String unique — `Larga`, `Corta`, `Sprint`, `Única`
- `distance` Float? — distance in km (nullable)
- `isGlobal` Boolean default `true`
- `isDefault` Boolean default `false`
- `organizationId` String? FK → Organization
- Timestamps: `createdAt`, `updatedAt`

#### OrganizationInvitation
- `id` UUID PK
- `organizationId` String FK → Organization
- `email` String
- `invitedByUserId` String FK → User
- `roleType` enum `InvitationRoleType` — `ORGANIZER_OWNER`, `ORGANIZER_STAFF`
- `status` enum `InvitationStatus` — `PENDING`, `ACCEPTED`, `EXPIRED`
- `retryCount` Int default `0`
- `lastInvitationSentAt` DateTime?
- Timestamps: `createdAt`, `updatedAt`

### Enums (Prisma)

```
UserStatus: ACTIVE | INACTIVE | PENDING | UNREGISTERED
OrganizationState: ACTIVE | INACTIVE
EventStatus: DRAFT | AVAILABLE | SOLD_OUT | ON_GOING | FINISHED
InvitationStatus: PENDING | ACCEPTED | EXPIRED
InvitationRoleType: ORGANIZER_OWNER | ORGANIZER_STAFF
```

### Key Differences from Supabase Schema

- No `auth_user_id` on User — BetterAuth handles auth↔user link (Phase 3)
- No RLS policies — authorization in Hono middleware (Phase 2)
- No database triggers — application logic in service layer
- `invitedByUserId` FK is a **new field** (not a rename) — replaces the existing `invited_owner_name` TEXT field. The new schema uses a proper FK to the User table instead of storing the inviter's name as a string. The `@acs/shared` `OrganizationInvitation` domain type reflects this new structure (no `invitedOwnerName` property)
- No `displayName` — derived from `firstName + lastName`
- Status/state fields as Prisma enums instead of lookup tables
- UUIDs generated by Prisma (`@default(uuid())`)
- `updatedAt` handled by Prisma (`@updatedAt`)

### Seed Data

- **Roles:** PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_OWNER, ADMIN
- **Cyclist genders:** M, F
- **Race categories:** 26 age categories matching existing data
- **Race category genders:** Femenino, Masculino, Abierto
- **Race category lengths:** Larga, Corta, Sprint, Única

## Docker Configuration

### Development (`docker-compose.yml`)

PostgreSQL only:
- Image: `postgres:16`
- Port: `5432:5432`
- Credentials: `acs` / `acs_dev` / `acs_dev`
- Named volume: `pgdata`

Backend and frontend run natively via `npx turbo dev`.

### Production (`docker-compose.prod.yml`)

Three services:
- **postgres** — PostgreSQL 16, `internal` network only, persistent volume, env vars for credentials
- **backend** — Built from `apps/backend/Dockerfile`, `internal` + `web` networks, depends on postgres
- **frontend** — Built from `apps/frontend/Dockerfile`, `web` network only, depends on backend

Networks:
- `internal` — postgres ↔ backend communication only
- `web` — backend ↔ frontend, exposed to Coolify reverse proxy

All secrets via environment variables configured in Coolify.

### Dockerfiles

Multi-stage builds:
1. **deps** — Install all workspace dependencies
2. **build** — Build `@acs/shared`, run `prisma generate` (backend only), then build the specific app
3. **runtime** — Slim Node.js image with only built output

Build context is repo root so Dockerfiles can access `packages/shared/`.

## Turborepo Configuration

### Pipelines

| Task          | Scope     | Dependencies            | Description                    |
|---------------|-----------|-------------------------|--------------------------------|
| `build`       | All       | `^build` (topological)  | Build shared → backend → frontend |
| `dev`         | All       | None (parallel)         | Start all apps for development |
| `lint`        | All       | None (parallel)         | ESLint across all packages     |
| `check`       | All       | None (parallel)         | TypeScript type checking       |
| `test`        | All       | None (parallel)         | Run tests                      |
| `db:generate` | backend   | None                    | Generate Prisma client         |
| `db:migrate`  | backend   | None                    | Run Prisma migrations          |
| `db:seed`     | backend   | None                    | Seed lookup data               |

## Shared Package (`@acs/shared`)

### Contents

**Domain types** (mirroring existing `src/lib/types/domain/`):
- `User` (union: `Admin | Organizer | Cyclist`)
- `Admin`, `Organizer`, `Cyclist`
- `Event`, `Race`, `RaceResult`
- `Organization`, `OrganizationInvitation`

**Enums:**
- `RoleTypeEnum` — `PUBLIC`, `CYCLIST`, `ORGANIZER_STAFF`, `ORGANIZER_OWNER`, `ADMIN`
- `UserStatus` — `ACTIVE`, `INACTIVE`, `PENDING`, `UNREGISTERED`
- `OrganizationState` — `ACTIVE`, `INACTIVE`
- `EventStatus` — `DRAFT`, `AVAILABLE`, `SOLD_OUT`, `ON_GOING`, `FINISHED`
- `InvitationStatus` — `PENDING`, `ACCEPTED`, `EXPIRED`
- `InvitationRoleType` — `ORGANIZER_OWNER`, `ORGANIZER_STAFF`

**Constants (error codes):**
- `ACS01` — `CANNOT_DELETE_LAST_OWNER`: Prevents deletion of the last owner of an organization
- `ACS02` — `CATEGORY_IN_USE`: Category cannot be deleted because it's referenced by races
- `ACS03` — `PROTECTED_CATEGORY`: Default/system categories cannot be deleted
- `ACS04` — `DUPLICATE_RACE_COMBINATION`: Race with same category combination already exists in event

## Environment Variables

### Root `.env` (docker-compose)

```
POSTGRES_USER=acs
POSTGRES_PASSWORD=acs_dev
POSTGRES_DB=acs_dev
```

### Backend `.env`

```
DATABASE_URL=postgresql://acs:acs_dev@localhost:5432/acs_dev
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```
PUBLIC_API_URL=http://localhost:3000
```

## Development Workflow

```bash
npm install                  # Install all workspaces
docker compose up -d         # Start PostgreSQL
npx turbo db:generate        # Generate Prisma client
npx turbo db:migrate         # Run migrations
npx turbo db:seed            # Seed lookup data
npx turbo dev                # Start backend (3000) + frontend (5173)
```

## Port Assignments

| Service    | Port |
|------------|------|
| PostgreSQL | 5432 |
| Backend    | 3000 |
| Frontend   | 5173 |

## Phase 1 Success Criteria

1. `docker compose up -d` starts PostgreSQL successfully
2. `npx turbo db:migrate` creates all tables
3. `npx turbo db:seed` populates lookup data
4. `npx turbo dev` starts both backend and frontend
5. `GET http://localhost:3000/health` returns `{ status: "ok" }`
6. Frontend page at `http://localhost:5173` displays the health check response
7. `@acs/shared` types are importable from both apps
8. `npx turbo build` completes without errors
9. `docker compose -f docker-compose.prod.yml build` builds all production images

## Future Phases

- **Phase 2:** Backend CRUD API (Hono routes for all entities)
- **Phase 3:** Authentication (BetterAuth — email/password, magic links, role-based middleware)
- **Phase 4:** Email (Resend integration, invitation templates)
- **Phase 5:** Frontend migration (replace Supabase calls with API calls, keep UI identical)
