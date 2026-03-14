# Phase 1: Monorepo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a Turborepo monorepo with a Hono backend (Prisma + PostgreSQL), SvelteKit frontend shell, and shared types package — all wired together with Docker.

**Architecture:** Turborepo at root orchestrates `apps/backend/` (Hono + Prisma), `apps/frontend/` (SvelteKit), and `packages/shared/` (@acs/shared with domain types/enums/constants). Docker Compose provides PostgreSQL for dev, full stack for prod.

**Tech Stack:** Node.js 22, TypeScript 5.x (strict), Turborepo, Hono, Prisma, PostgreSQL 16, SvelteKit + Svelte 5, Tailwind CSS 4.x, Docker

**Spec:** `docs/superpowers/specs/2026-03-13-monorepo-scaffold-phase1-design.md`

---

## Chunk 1: Monorepo Root + Shared Package

### Task 1: Initialize monorepo root

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.nvmrc`
- Create: `.gitignore`

- [ ] **Step 1: Create root package.json with npm workspaces**

```json
{
  "name": "amateur-cycling-stats",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "check": "turbo check",
    "test": "turbo test",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:seed": "turbo db:seed"
  },
  "devDependencies": {
    "turbo": "^2"
  }
}
```

- [ ] **Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".svelte-kit/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

- [ ] **Step 3: Create .nvmrc**

```
22.20.0
```

- [ ] **Step 4: Create .gitignore**

```gitignore
node_modules/
dist/
build/
.svelte-kit/
.env
.turbo/
*.log
```

- [ ] **Step 5: Create directory structure**

Run:
```bash
mkdir -p apps/backend apps/frontend packages/shared
```

- [ ] **Step 6: Commit**

```bash
git add package.json turbo.json .nvmrc .gitignore
git commit -m "feat: initialize turborepo monorepo root"
```

---

### Task 2: Create shared package (@acs/shared)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/enums/role-type.enum.ts`
- Create: `packages/shared/src/enums/status.enum.ts`
- Create: `packages/shared/src/enums/index.ts`
- Create: `packages/shared/src/constants/error-codes.ts`
- Create: `packages/shared/src/constants/index.ts`
- Create: `packages/shared/src/types/domain/admin.domain.ts`
- Create: `packages/shared/src/types/domain/organizer.domain.ts`
- Create: `packages/shared/src/types/domain/cyclist.domain.ts`
- Create: `packages/shared/src/types/domain/user.domain.ts`
- Create: `packages/shared/src/types/domain/event.domain.ts`
- Create: `packages/shared/src/types/domain/race.domain.ts`
- Create: `packages/shared/src/types/domain/race-result.domain.ts`
- Create: `packages/shared/src/types/domain/organization.domain.ts`
- Create: `packages/shared/src/types/domain/organization-invitation.domain.ts`
- Create: `packages/shared/src/types/domain/race-category.domain.ts`
- Create: `packages/shared/src/types/domain/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@acs/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "check": "tsc --noEmit",
    "lint": "echo 'no linter configured yet'"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create enums**

`packages/shared/src/enums/role-type.enum.ts`:
```typescript
export enum RoleTypeEnum {
  CYCLIST = 'CYCLIST',
  ORGANIZER_OWNER = 'ORGANIZER_OWNER',
  ORGANIZER_STAFF = 'ORGANIZER_STAFF',
  ADMIN = 'ADMIN',
  PUBLIC = 'PUBLIC'
}
```

`packages/shared/src/enums/status.enum.ts`:
```typescript
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'UNREGISTERED';

export type OrganizationState = 'ACTIVE' | 'INACTIVE';

export type EventStatus = 'DRAFT' | 'AVAILABLE' | 'SOLD_OUT' | 'ON_GOING' | 'FINISHED';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export type InvitationRoleType = 'ORGANIZER_OWNER' | 'ORGANIZER_STAFF';
```

`packages/shared/src/enums/index.ts`:
```typescript
export { RoleTypeEnum } from './role-type.enum.js';
export type {
  UserStatus,
  OrganizationState,
  EventStatus,
  InvitationStatus,
  InvitationRoleType
} from './status.enum.js';
```

- [ ] **Step 4: Create constants**

`packages/shared/src/constants/error-codes.ts`:
```typescript
export const PG_ERROR_CODES = {
  CANNOT_DELETE_LAST_OWNER: 'ACS01',
  CATEGORY_IN_USE: 'ACS02',
  PROTECTED_CATEGORY: 'ACS03',
  DUPLICATE_RACE_COMBINATION: 'ACS04'
} as const;

export type PgErrorCode = (typeof PG_ERROR_CODES)[keyof typeof PG_ERROR_CODES];
```

`packages/shared/src/constants/index.ts`:
```typescript
export { PG_ERROR_CODES, type PgErrorCode } from './error-codes.js';
```

- [ ] **Step 5: Create domain types**

`packages/shared/src/types/domain/admin.domain.ts`:
```typescript
import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { UserStatus } from '../../enums/status.enum.js';

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleType: RoleTypeEnum.ADMIN;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/organizer.domain.ts`:
```typescript
import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { UserStatus } from '../../enums/status.enum.js';

export interface Organizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;
  organizationId: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type PartialOrganizer = Partial<Pick<Organizer, 'firstName' | 'lastName' | 'roleType'>>;
```

`packages/shared/src/types/domain/cyclist.domain.ts`:
```typescript
import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { UserStatus } from '../../enums/status.enum.js';

export interface Cyclist {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleType: RoleTypeEnum.CYCLIST | null;
  status: UserStatus;
  genderName: string | null;
  bornYear: number | null;
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/user.domain.ts`:
```typescript
import type { Admin } from './admin.domain.js';
import type { Organizer } from './organizer.domain.js';
import type { Cyclist } from './cyclist.domain.js';

export type User = Admin | Organizer | Cyclist;
```

`packages/shared/src/types/domain/event.domain.ts`:
```typescript
import type { EventStatus } from '../../enums/status.enum.js';

export interface Event {
  id: string;
  name: string;
  description: string | null;
  dateTime: string;
  year: number;
  city: string | null;
  state: string;
  country: string;
  eventStatus: EventStatus;
  organizationId: string | null;
  createdBy: string | null;
  isPublicVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/race.domain.ts`:
```typescript
export interface Race {
  id: string;
  name: string | null;
  description: string | null;
  dateTime: string;
  eventId: string;
  raceCategoryAgeId: string;
  raceCategoryGenderId: string;
  raceCategoryDistanceId: string;
  raceCategoryAgeName: string;
  raceCategoryGenderName: string;
  raceCategoryDistanceName: string;
  isPublicVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/race-result.domain.ts`:
```typescript
/**
 * Race result domain type with flat structure.
 * Includes flattened event, race, and category data for optimal performance.
 * Used for cyclist profile pages where full context is needed.
 */
export interface RaceResult {
  // Identity
  id: string;

  // Core result data
  place: number;
  time: string | null;

  // Foreign Keys
  eventId: string;
  raceId: string;
  raceCategoryAgeId: string;
  raceCategoryGenderId: string;
  raceCategoryDistanceId: string;

  // Flattened Event Data
  eventName: string;
  eventDateTime: string;
  eventYear: number;
  eventCity: string;
  eventState: string;
  eventCountry: string;
  eventStatus: string;

  // Flattened Race Data
  raceName: string | null;
  raceDateTime: string;

  // Flattened Category Data
  raceCategoryType: string;
  raceCategoryGenderType: string;
  raceCategoryDistanceType: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/organization.domain.ts`:
```typescript
import type { OrganizationState } from '../../enums/status.enum.js';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  state: OrganizationState;
  eventCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PartialOrganization = Partial<Pick<Organization, 'name' | 'description' | 'state'>>;
```

`packages/shared/src/types/domain/organization-invitation.domain.ts`:
```typescript
import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { InvitationStatus } from '../../enums/status.enum.js';

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  invitedByUserId: string;
  roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;
  status: InvitationStatus;
  retryCount: number;
  lastInvitationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/race-category.domain.ts`:
```typescript
export interface RaceCategoryAge {
  id: string;
  name: string;
  fromAge: number | null;
  toAge: number | null;
  isGlobal: boolean;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaceCategoryGender {
  id: string;
  name: string;
  isGlobal: boolean;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaceCategoryDistance {
  id: string;
  name: string;
  distance: number | null;
  isGlobal: boolean;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

`packages/shared/src/types/domain/index.ts`:
```typescript
export type { Admin } from './admin.domain.js';
export type { Organizer, PartialOrganizer } from './organizer.domain.js';
export type { Cyclist } from './cyclist.domain.js';
export type { User } from './user.domain.js';
export type { Event } from './event.domain.js';
export type { Race } from './race.domain.js';
export type { RaceResult } from './race-result.domain.js';
export type { Organization, PartialOrganization } from './organization.domain.js';
export type { OrganizationInvitation } from './organization-invitation.domain.js';
export type {
  RaceCategoryAge,
  RaceCategoryGender,
  RaceCategoryDistance
} from './race-category.domain.js';
```

- [ ] **Step 6: Create barrel export**

`packages/shared/src/index.ts`:
```typescript
export * from './enums/index.js';
export * from './constants/index.js';
export * from './types/domain/index.js';
```

- [ ] **Step 7: Build shared package to verify**

Run:
```bash
cd packages/shared && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add packages/shared/
git commit -m "feat: add @acs/shared package with domain types, enums, and constants"
```

---

## Chunk 2: Docker + Backend Scaffold

### Task 3: Docker Compose for development

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-acs}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-acs_dev}
      POSTGRES_DB: ${POSTGRES_DB:-acs_dev}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 2: Create .env.example**

```
# Docker Compose (dev)
POSTGRES_USER=acs
POSTGRES_PASSWORD=acs_dev
POSTGRES_DB=acs_dev
POSTGRES_PORT=5432
```

- [ ] **Step 3: Create .env with dev values**

Copy `.env.example` to `.env` with the same values.

- [ ] **Step 4: Start PostgreSQL and verify**

Run:
```bash
docker compose up -d
```
Expected: PostgreSQL container running

Run:
```bash
docker compose ps
```
Expected: postgres service is "Up"

Run:
```bash
docker compose exec postgres psql -U acs -d acs_dev -c "SELECT 1;"
```
Expected: Returns `1`

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "feat: add docker-compose for dev PostgreSQL"
```

---

### Task 4: Backend scaffold (Hono + Prisma)

**Files:**
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/.env.example`
- Create: `apps/backend/.env`
- Create: `apps/backend/src/index.ts`
- Create: `apps/backend/src/lib/prisma.ts`
- Create: `apps/backend/src/types/env.ts`
- Create: `apps/backend/src/middleware/error-handler.ts`
- Create: `apps/backend/src/routes/health.ts`
- Create: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "acs-backend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "check": "tsc --noEmit",
    "lint": "echo 'no linter configured yet'",
    "test": "echo 'no tests yet'",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@acs/shared": "*",
    "@hono/node-server": "^1",
    "@prisma/client": "^6",
    "hono": "^4"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "devDependencies": {
    "prisma": "^6",
    "tsx": "^4",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "prisma"]
}
```

- [ ] **Step 3: Create .env.example and .env**

`apps/backend/.env.example`:
```
DATABASE_URL=postgresql://acs:acs_dev@localhost:5432/acs_dev
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Copy to `.env` with the same values.

- [ ] **Step 4: Create environment types**

`apps/backend/src/types/env.ts`:
```typescript
export interface Env {
  DATABASE_URL: string;
  PORT: string;
  FRONTEND_URL: string;
}
```

- [ ] **Step 5: Create Prisma client singleton**

`apps/backend/src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 6: Create error handler middleware**

`apps/backend/src/middleware/error-handler.ts`:
```typescript
import type { Context, Next } from 'hono';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    console.error('Unhandled error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
}
```

- [ ] **Step 7: Create health route**

`apps/backend/src/routes/health.ts`:
```typescript
import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

const health = new Hono();

health.get('/', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch {
    return c.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      },
      503
    );
  }
});

export { health };
```

- [ ] **Step 8: Create route aggregator**

`apps/backend/src/routes/index.ts`:
```typescript
import { Hono } from 'hono';
import { health } from './health.js';

export function registerRoutes(app: Hono) {
  app.route('/health', health);
}
```

- [ ] **Step 9: Create app entry point**

`apps/backend/src/index.ts`:
```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { registerRoutes } from './routes/index.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use('*', errorHandler);

// Routes
registerRoutes(app);

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
```

- [ ] **Step 10: Commit**

```bash
git add apps/backend/
git commit -m "feat: add Hono backend scaffold with health endpoint"
```

---

### Task 5: Prisma schema and seed

**Files:**
- Create: `apps/backend/prisma/schema.prisma`
- Create: `apps/backend/prisma/seed.ts`

- [ ] **Step 1: Create schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =====================================================
// Enums
// =====================================================

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING
  UNREGISTERED
}

enum OrganizationState {
  ACTIVE
  INACTIVE
}

enum EventStatus {
  DRAFT
  AVAILABLE
  SOLD_OUT
  ON_GOING
  FINISHED
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
}

enum InvitationRoleType {
  ORGANIZER_OWNER
  ORGANIZER_STAFF
}

// =====================================================
// Models
// =====================================================

model Role {
  id    String @id @default(uuid())
  name  String @unique
  users User[]

  @@map("roles")
}

model User {
  id        String     @id @default(uuid())
  email     String?    @unique
  firstName String     @map("first_name")
  lastName  String?    @map("last_name")
  status    UserStatus @default(ACTIVE)
  roleId    String     @map("role_id")

  role                  Role                     @relation(fields: [roleId], references: [id])
  cyclist               Cyclist?
  organizers            Organizer[]
  createdEvents         Event[]                  @relation("EventCreator")
  sentInvitations       OrganizationInvitation[] @relation("InvitedBy")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Organization {
  id          String            @id @default(uuid())
  name        String
  description String?
  state       OrganizationState @default(ACTIVE)

  organizers         Organizer[]
  events             Event[]
  invitations        OrganizationInvitation[]
  raceCategories     RaceCategory[]
  raceCategoryGenders RaceCategoryGender[]
  raceCategoryLengths RaceCategoryLength[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("organizations")
}

model Organizer {
  id             String @id @default(uuid())
  userId         String @map("user_id")
  organizationId String @map("organization_id")

  user         User         @relation(fields: [userId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([userId, organizationId])
  @@map("organizers")
}

model Cyclist {
  id       String  @id @default(uuid())
  userId   String  @unique @map("user_id")
  bornYear Int?    @map("born_year")
  genderId String? @map("gender_id")

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  gender      CyclistGender? @relation(fields: [genderId], references: [id])
  raceResults RaceResult[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("cyclists")
}

model CyclistGender {
  id       String    @id @default(uuid())
  name     String    @unique
  cyclists Cyclist[]

  @@map("cyclist_genders")
}

model Event {
  id              String      @id @default(uuid())
  name            String
  description     String?
  dateTime        DateTime    @map("date_time")
  eventStatus     EventStatus @default(DRAFT) @map("event_status")
  year            Int
  country         String
  state           String
  city            String?
  isPublicVisible Boolean     @default(false) @map("is_public_visible")
  createdBy       String      @map("created_by")
  organizationId  String?     @map("organization_id")

  creator      User          @relation("EventCreator", fields: [createdBy], references: [id])
  organization Organization? @relation(fields: [organizationId], references: [id])
  races        Race[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("events")
}

model Race {
  id                     String   @id @default(uuid())
  eventId                String   @map("event_id")
  name                   String?
  description            String?
  dateTime               DateTime @map("date_time")
  raceCategoryAgeId      String   @map("race_category_age_id")
  raceCategoryGenderId   String   @map("race_category_gender_id")
  raceCategoryDistanceId String   @map("race_category_distance_id")
  isPublicVisible        Boolean  @default(false) @map("is_public_visible")

  event            Event              @relation(fields: [eventId], references: [id])
  categoryAge      RaceCategory       @relation(fields: [raceCategoryAgeId], references: [id])
  categoryGender   RaceCategoryGender @relation(fields: [raceCategoryGenderId], references: [id])
  categoryDistance  RaceCategoryLength @relation(fields: [raceCategoryDistanceId], references: [id])
  results          RaceResult[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([eventId, raceCategoryAgeId, raceCategoryGenderId, raceCategoryDistanceId])
  @@map("races")
}

model RaceResult {
  id        String  @id @default(uuid())
  raceId    String  @map("race_id")
  cyclistId String  @map("cyclist_id")
  time      String?
  place     Int

  race    Race    @relation(fields: [raceId], references: [id])
  cyclist Cyclist @relation(fields: [cyclistId], references: [id])

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([raceId, cyclistId])
  @@map("race_results")
}

model RaceCategory {
  id             String        @id @default(uuid())
  name           String        @unique
  fromAge        Int?          @map("from_age")
  toAge          Int?          @map("to_age")
  isGlobal       Boolean       @default(true) @map("is_global")
  isDefault      Boolean       @default(false) @map("is_default")
  organizationId String?       @map("organization_id")

  organization Organization? @relation(fields: [organizationId], references: [id])
  races        Race[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("race_categories")
}

model RaceCategoryGender {
  id             String  @id @default(uuid())
  name           String  @unique
  isGlobal       Boolean @default(true) @map("is_global")
  isDefault      Boolean @default(false) @map("is_default")
  organizationId String? @map("organization_id")

  organization Organization? @relation(fields: [organizationId], references: [id])
  races        Race[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("race_category_genders")
}

model RaceCategoryLength {
  id             String  @id @default(uuid())
  name           String  @unique
  distance       Float?
  isGlobal       Boolean @default(true) @map("is_global")
  isDefault      Boolean @default(false) @map("is_default")
  organizationId String? @map("organization_id")

  organization Organization? @relation(fields: [organizationId], references: [id])
  races        Race[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("race_category_lengths")
}

model OrganizationInvitation {
  id                   String             @id @default(uuid())
  organizationId       String             @map("organization_id")
  email                String
  invitedByUserId      String             @map("invited_by_user_id")
  roleType             InvitationRoleType @map("role_type")
  status               InvitationStatus   @default(PENDING)
  retryCount           Int                @default(0) @map("retry_count")
  lastInvitationSentAt DateTime?          @map("last_invitation_sent_at")

  organization Organization @relation(fields: [organizationId], references: [id])
  invitedBy    User         @relation("InvitedBy", fields: [invitedByUserId], references: [id])

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("organization_invitations")
}
```

- [ ] **Step 2: Create seed.ts**

`apps/backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = ['PUBLIC', 'CYCLIST', 'ORGANIZER_STAFF', 'ORGANIZER_OWNER', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log(`  ✓ ${roles.length} roles`);

  // Cyclist genders
  const genders = ['M', 'F'];
  for (const name of genders) {
    await prisma.cyclistGender.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log(`  ✓ ${genders.length} cyclist genders`);

  // Race categories (age groups)
  const categories = [
    'Absoluta',
    'Elite',
    'Sub-23 (19-23)',
    'Juvenil A (13-14)',
    'Juvenil B (15-16)',
    'Junior (17-18)',
    'Master A (31-40)',
    'Master B (41-50)',
    'Master C (51-60)',
    'Master D (61-70)',
    'Master E (71-80)',
    'Rango 18-29',
    'Rango 18-34',
    'Rango 18-39',
    'Rango 30-34',
    'Rango 30-39',
    'Rango 35-39',
    'Rango 40-44',
    'Rango 40-49',
    'Rango 45-49',
    'Rango 50-54',
    'Rango 50-59',
    'Rango 55-59',
    'Rango 60-64',
    'Rango 60-69',
    'Rango 65-69'
  ];
  for (const name of categories) {
    await prisma.raceCategory.upsert({
      where: { name },
      update: {},
      create: { name, isGlobal: true, isDefault: name === 'Absoluta' }
    });
  }
  console.log(`  ✓ ${categories.length} race categories`);

  // Race category genders
  const categoryGenders = ['Femenino', 'Masculino', 'Abierto'];
  for (const name of categoryGenders) {
    await prisma.raceCategoryGender.upsert({
      where: { name },
      update: {},
      create: { name, isGlobal: true, isDefault: name === 'Abierto' }
    });
  }
  console.log(`  ✓ ${categoryGenders.length} race category genders`);

  // Race category lengths
  const categoryLengths = ['Larga', 'Corta', 'Sprint', 'Única'];
  for (const name of categoryLengths) {
    await prisma.raceCategoryLength.upsert({
      where: { name },
      update: {},
      create: { name, isGlobal: true, isDefault: name === 'Única' }
    });
  }
  console.log(`  ✓ ${categoryLengths.length} race category lengths`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Install dependencies and generate Prisma client**

Run from repo root:
```bash
npm install
```

Run:
```bash
cd apps/backend && npx prisma generate
```
Expected: Prisma Client generated

- [ ] **Step 4: Run migration**

Run:
```bash
cd apps/backend && npx prisma migrate dev --name init
```
Expected: Migration created and applied, all tables created

- [ ] **Step 5: Run seed**

Run:
```bash
cd apps/backend && npx tsx prisma/seed.ts
```
Expected: All seed data created (5 roles, 2 genders, 26 categories, 3 category genders, 4 category lengths)

- [ ] **Step 6: Verify backend starts**

Run:
```bash
cd apps/backend && npx tsx src/index.ts
```
Expected: `Server running on http://localhost:3000`

In another terminal:
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","timestamp":"...","database":"connected"}`

- [ ] **Step 7: Commit**

```bash
git add apps/backend/prisma/
git commit -m "feat: add Prisma schema with all models and seed data"
```

---

## Chunk 3: Frontend Shell + Integration

### Task 6: SvelteKit frontend shell

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/svelte.config.js`
- Create: `apps/frontend/vite.config.ts`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/.env.example`
- Create: `apps/frontend/.env`
- Create: `apps/frontend/src/app.html`
- Create: `apps/frontend/src/app.css`
- Create: `apps/frontend/src/lib/api/client.ts`
- Create: `apps/frontend/src/routes/+page.svelte`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "acs-frontend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "lint": "echo 'no linter configured yet'",
    "test": "echo 'no tests yet'"
  },
  "dependencies": {
    "@acs/shared": "*"
  },
  "devDependencies": {
    "@sveltejs/adapter-node": "^5",
    "@sveltejs/kit": "^2",
    "@sveltejs/vite-plugin-svelte": "^5",
    "svelte": "^5",
    "svelte-check": "^4",
    "typescript": "^5.9.3",
    "vite": "^6"
  }
}
```

- [ ] **Step 2: Create svelte.config.js**

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .env.example and .env**

`apps/frontend/.env.example`:
```
PUBLIC_API_URL=http://localhost:3000
```

Copy to `.env` with same values.

- [ ] **Step 6: Create app.html**

`apps/frontend/src/app.html`:
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-prerender="false">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 7: Create app.css**

`apps/frontend/src/app.css`:
```css
/* Placeholder — Tailwind will be added in Phase 5 */
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 2rem;
}
```

- [ ] **Step 8: Create API client**

`apps/frontend/src/lib/api/client.ts`:

Note: Uses `$env/dynamic/public` (not static) so `PUBLIC_API_URL` is read at runtime. This is required for Docker deployments where the API URL is set via environment variables at container start, not at build time. Works with `@sveltejs/adapter-node`.

```typescript
import { env } from '$env/dynamic/public';

function getBaseUrl(): string {
  return env.PUBLIC_API_URL || 'http://localhost:3000';
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
```

- [ ] **Step 9: Create health check page**

`apps/frontend/src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import { apiGet } from '$lib/api/client';
  import { RoleTypeEnum } from '@acs/shared';

  interface HealthResponse {
    status: string;
    timestamp: string;
    database: string;
  }

  let health: HealthResponse | null = $state(null);
  let error: string | null = $state(null);
  let sharedPackageWorks = RoleTypeEnum.ADMIN === 'ADMIN';

  async function checkHealth() {
    try {
      error = null;
      health = await apiGet<HealthResponse>('/health');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      health = null;
    }
  }
</script>

<h1>ACS - Monorepo Health Check</h1>

<section>
  <h2>@acs/shared package</h2>
  <p>Status: {sharedPackageWorks ? '✅ Working' : '❌ Failed'}</p>
  <p>RoleTypeEnum.ADMIN = "{RoleTypeEnum.ADMIN}"</p>
</section>

<section>
  <h2>Backend API</h2>
  <button onclick={checkHealth}>Check Health</button>

  {#if health}
    <pre>{JSON.stringify(health, null, 2)}</pre>
  {/if}

  {#if error}
    <p style="color: red;">{error}</p>
  {/if}
</section>
```

- [ ] **Step 10: Install dependencies**

Run from repo root:
```bash
npm install
```

- [ ] **Step 11: Verify frontend starts**

Run:
```bash
cd apps/frontend && npx vite dev
```
Expected: SvelteKit dev server on `http://localhost:5173`

Visit `http://localhost:5173` — should show health check page. Click "Check Health" — should display the backend health response.

- [ ] **Step 12: Commit**

```bash
git add apps/frontend/
git commit -m "feat: add SvelteKit frontend shell with health check page"
```

---

### Task 7: Verify Turborepo integration

- [ ] **Step 1: Run turbo dev**

Run from repo root:
```bash
npx turbo dev
```
Expected: Both backend and frontend start in parallel. Console shows output from both.

- [ ] **Step 2: Run turbo build**

Run:
```bash
npx turbo build
```
Expected: Builds shared → backend → frontend in order. No errors.

- [ ] **Step 3: Run turbo check**

Run:
```bash
npx turbo check
```
Expected: TypeScript type checking passes for all packages.

- [ ] **Step 4: Commit (if any turbo config adjustments were needed)**

```bash
git add -A
git commit -m "fix: turbo configuration adjustments"
```

---

## Chunk 4: Production Docker + Final Verification

### Task 8: Production Docker setup

**Files:**
- Create: `apps/backend/Dockerfile`
- Create: `apps/frontend/Dockerfile`
- Create: `docker-compose.prod.yml`

- [ ] **Step 1: Create backend Dockerfile**

`apps/backend/Dockerfile`:
```dockerfile
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# Build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/ ./
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/
COPY turbo.json ./
RUN cd packages/shared && npx tsc
RUN cd apps/backend && npx prisma generate
RUN cd apps/backend && npx tsc

# Runtime
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built backend
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/apps/backend/package.json ./package.json

# Copy node_modules (hoisted by npm workspaces)
COPY --from=build /app/node_modules ./node_modules

# Copy built shared package into node_modules
COPY --from=build /app/packages/shared/dist ./node_modules/@acs/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@acs/shared/package.json

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

- [ ] **Step 2: Create frontend Dockerfile**

`apps/frontend/Dockerfile`:
```dockerfile
FROM node:22-slim AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# Build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/ ./
COPY packages/shared/ ./packages/shared/
COPY apps/frontend/ ./apps/frontend/
COPY turbo.json ./
RUN cd packages/shared && npx tsc
RUN cd apps/frontend && npm run build

# Runtime
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built frontend
COPY --from=build /app/apps/frontend/build ./build
COPY --from=build /app/apps/frontend/package.json ./package.json

# Copy node_modules (hoisted by npm workspaces)
COPY --from=build /app/node_modules ./node_modules

# Copy built shared package into node_modules
COPY --from=build /app/packages/shared/dist ./node_modules/@acs/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@acs/shared/package.json

EXPOSE 3000
CMD ["node", "build/index.js"]
```

- [ ] **Step 3: Create docker-compose.prod.yml**

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - internal

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      PORT: "3000"
      FRONTEND_URL: ${FRONTEND_URL}
    networks:
      - internal
      - web

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      PUBLIC_API_URL: ${PUBLIC_API_URL}
    ports:
      - "${FRONTEND_PORT:-3001}:3000"
    networks:
      - web

networks:
  internal:
  web:

volumes:
  pgdata:
```

- [ ] **Step 4: Verify production images build**

Run:
```bash
docker compose -f docker-compose.prod.yml build
```
Expected: All three images build without errors.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/Dockerfile apps/frontend/Dockerfile docker-compose.prod.yml
git commit -m "feat: add production Docker setup with multi-stage builds"
```

---

### Task 9: Final end-to-end verification

- [ ] **Step 1: Clean start**

Run:
```bash
docker compose down -v
docker compose up -d
npm install
cd apps/backend && npx prisma generate && npx prisma migrate dev --name init && npx tsx prisma/seed.ts
```

- [ ] **Step 2: Verify turbo dev**

Run from root:
```bash
npx turbo dev
```

Check:
1. `http://localhost:3000/health` returns `{"status":"ok","database":"connected",...}`
2. `http://localhost:5173` shows health check page
3. Clicking "Check Health" shows the backend response
4. `@acs/shared` status shows "Working"

- [ ] **Step 3: Verify turbo build**

Run:
```bash
npx turbo build
```
Expected: All packages build without errors.

- [ ] **Step 4: Verify production Docker build**

Run:
```bash
docker compose -f docker-compose.prod.yml build
```
Expected: All images build without errors.

- [ ] **Step 5: Final commit**

If any adjustments were needed:
```bash
git add -A
git commit -m "fix: final adjustments for Phase 1 scaffold"
```

---

## Success Criteria Checklist

All from the spec must pass:

- [ ] `docker compose up -d` starts PostgreSQL successfully
- [ ] `npx turbo db:migrate` creates all tables
- [ ] `npx turbo db:seed` populates lookup data
- [ ] `npx turbo dev` starts both backend and frontend
- [ ] `GET http://localhost:3000/health` returns `{ status: "ok" }`
- [ ] Frontend at `http://localhost:5173` displays health check response
- [ ] `@acs/shared` types are importable from both apps
- [ ] `npx turbo build` completes without errors
- [ ] `docker compose -f docker-compose.prod.yml build` builds all production images
