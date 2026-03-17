# Phase 3: Authentication Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add BetterAuth authentication with email/password + magic link, session middleware, and per-handler authorization checks to the Hono backend.

**Architecture:** BetterAuth manages auth endpoints (`/api/auth/*`), session cookies, and user creation. Session middleware populates `c.var.user` on every request. Auth helper functions (`requireAuth`, `requireRole`, `requireOrgMember`, etc.) are called per-handler for authorization. Existing route handlers get auth checks added to write endpoints.

**Tech Stack:** BetterAuth, Hono 4, Prisma 6, `@acs/shared` enums/types

**Spec:** `docs/superpowers/specs/2026-03-16-phase3-authentication-design.md`

---

## Chunk 1: Prisma Schema + BetterAuth Setup

### Task 1: Prisma schema migration

**Files:**
- Modify: `apps/backend/prisma/schema.prisma`

- [ ] **Step 1: Update User model and add BetterAuth models**

Add to the `User` model:
- `name String?` (optional — BetterAuth populates for auth users, null for unregistered)
- `emailVerified Boolean @default(false) @map("email_verified")`
- `image String?`
- Change `firstName` from `String` to `String?` (magic link users set it later)
- Change `roleId` from `String` to `String?` (BetterAuth inserts user before the `before` hook's return value is guaranteed to merge; the `before` hook sets it, but making it nullable prevents constraint violations if the hook fails to merge. The `after` hook verifies it's set.)
- Add relations: `sessions Session[]`, `accounts Account[]`

Add new models after the existing ones:

```prisma
model Session {
  id        String   @id
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("sessions")
}

model Account {
  id                    String    @id
  userId                String    @map("user_id")
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  accessToken           String?   @map("access_token")
  refreshToken          String?   @map("refresh_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  idToken               String?   @map("id_token")
  password              String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("accounts")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("verifications")
}
```

- [ ] **Step 2: Run Prisma migration**

```bash
cd apps/backend && npx prisma migrate dev --name add-auth-tables
```
Expected: Migration created, all tables updated.

- [ ] **Step 3: Regenerate Prisma client and verify**

```bash
cd apps/backend && npx prisma generate && npx tsc --noEmit
```
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/prisma/
git commit -m "feat: add BetterAuth tables (Session, Account, Verification) and update User model"
```

---

### Task 2: Install BetterAuth and create auth instance

**Files:**
- Modify: `apps/backend/package.json` (add dependencies)
- Create: `apps/backend/src/lib/auth.ts`
- Modify: `apps/backend/.env.example`
- Modify: `apps/backend/.env`

- [ ] **Step 1: Install BetterAuth**

```bash
cd apps/backend && npm install better-auth
```

- [ ] **Step 2: Update .env.example and .env**

Add to `apps/backend/.env.example`:
```
BETTER_AUTH_SECRET=change-me-to-a-random-32-char-string
BETTER_AUTH_URL=http://localhost:3000
```

Add to `apps/backend/.env` with actual values:
```
BETTER_AUTH_SECRET=dev-secret-change-in-production-32ch
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 3: Create auth.ts**

`apps/backend/src/lib/auth.ts`:
```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { prisma } from './prisma.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Placeholder — Resend integration in Phase 4
      console.log(`[AUTH] Password reset for ${user.email}: ${url}`);
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Placeholder — Resend integration in Phase 4
        console.log(`[AUTH] Magic link for ${email}: ${url}`);
      }
    })
  ],
  user: {
    additionalFields: {
      firstName: { type: 'string', required: false, fieldName: 'first_name' },
      lastName: { type: 'string', required: false, fieldName: 'last_name' },
      roleId: { type: 'string', required: false, fieldName: 'role_id' },
      status: { type: 'string', required: false, defaultValue: 'ACTIVE' }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Inject CYCLIST roleId before DB insert
          const cyclistRole = await prisma.role.findUnique({ where: { name: 'CYCLIST' } });
          if (!cyclistRole) throw new Error('CYCLIST role not found in database');
          return {
            data: {
              ...user,
              roleId: user.roleId || cyclistRole.id,
              status: user.status || 'ACTIVE'
            }
          };
        },
        after: async (user) => {
          // Re-query to reliably access custom fields
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          if (!dbUser) return;

          const cyclistRole = await prisma.role.findUnique({ where: { name: 'CYCLIST' } });
          if (cyclistRole && dbUser.roleId === cyclistRole.id) {
            await prisma.cyclist.create({ data: { userId: user.id } });
          }
        }
      }
    }
  }
});
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```

Note: BetterAuth's types may require adjustments. If there are type errors with the `databaseHooks` or `additionalFields`, consult the BetterAuth docs for the correct type signatures. The key requirement is that the auth instance exports correctly and the hooks compile.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/lib/auth.ts apps/backend/package.json apps/backend/.env.example
git commit -m "feat: add BetterAuth instance with email/password + magic link"
```

---

### Task 3: Session middleware + mount auth routes

**Files:**
- Create: `apps/backend/src/middleware/session.ts`
- Modify: `apps/backend/src/index.ts`

- [ ] **Step 1: Create app types file for shared Hono context**

`apps/backend/src/types/app.ts`:
```typescript
import type { auth } from '../lib/auth.js';

export type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
```

- [ ] **Step 1b: Create session middleware with typed context**

`apps/backend/src/middleware/session.ts`:
```typescript
import type { Context, Next } from 'hono';
import type { AppVariables } from '../types/app.js';
import { auth } from '../lib/auth.js';

export async function sessionMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);
  await next();
}
```

- [ ] **Step 2: Update index.ts — add typing, session middleware, and auth routes**

Replace `apps/backend/src/index.ts` with:
```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { sessionMiddleware } from './middleware/session.js';
import { auth } from './lib/auth.js';
import { registerRoutes } from './routes/index.js';
import type { AppVariables } from './types/app.js';

const app = new Hono<{ Variables: AppVariables }>();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use('*', errorHandler);
app.use('*', sessionMiddleware);

// Application routes (includes custom /api/auth/complete-organizer-setup)
// MUST be registered BEFORE the BetterAuth wildcard handler
registerRoutes(app);

// BetterAuth routes (wildcard — catches all remaining /api/auth/* requests)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
```

- [ ] **Step 3: Verify backend starts and auth endpoints respond**

Start backend, then test:
```bash
# Health still works
curl http://localhost:3000/health

# BetterAuth session endpoint
curl http://localhost:3000/api/auth/get-session

# Signup
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","firstName":"Test","lastName":"User"}'
```

Expected: Health returns ok. Session returns null/empty. Signup creates user + cyclist.

- [ ] **Step 4: Verify signup created cyclist**

After signup, check the database:
```bash
cd apps/backend && npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ include: { cyclist: true, role: true } });
console.log(JSON.stringify(users, null, 2));
await prisma.\$disconnect();
"
```

Expected: Test user with CYCLIST role and linked cyclist record.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/middleware/session.ts apps/backend/src/index.ts
git commit -m "feat: add session middleware and mount BetterAuth routes"
```

---

## Chunk 2: Auth Helpers + Route Auth Checks

### Task 4: Auth helper functions

**Files:**
- Create: `apps/backend/src/lib/auth-helpers.ts`

- [ ] **Step 1: Create auth-helpers.ts**

`apps/backend/src/lib/auth-helpers.ts`:
```typescript
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { RoleTypeEnum } from '@acs/shared';
import { prisma } from './prisma.js';

/**
 * Get the authenticated user from context, or null if not authenticated.
 */
export function getAuthUser(c: Context) {
  return c.get('user') ?? null;
}

/**
 * Require authentication. Returns the user or throws 401.
 */
export function requireAuth(c: Context) {
  const user = getAuthUser(c);
  if (!user) throw new HTTPException(401, { message: 'Authentication required' });
  return user;
}

/**
 * Require the user to have one of the specified roles. Returns the user or throws 401/403.
 * Queries the Role table to check the user's role name.
 */
export async function requireRole(c: Context, allowedRoles: RoleTypeEnum[]) {
  const user = requireAuth(c);
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (!dbUser?.role) throw new HTTPException(403, { message: 'Forbidden' });
  if (!allowedRoles.includes(dbUser.role.name as RoleTypeEnum)) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }
  return { ...user, roleName: dbUser.role.name as RoleTypeEnum };
}

/**
 * Check if the user is an admin (without throwing).
 */
export async function isAdmin(c: Context): Promise<boolean> {
  const user = getAuthUser(c);
  if (!user) return false;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  return dbUser?.role?.name === RoleTypeEnum.ADMIN;
}

/**
 * Require the user to be an organizer (OWNER or STAFF) in the specified organization, or an admin.
 */
export async function requireOrgMember(c: Context, organizationId: string) {
  const user = requireAuth(c);
  // Admins bypass org check
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (dbUser?.role?.name === RoleTypeEnum.ADMIN) return user;

  // Must have ORGANIZER_* role
  if (dbUser?.role?.name !== RoleTypeEnum.ORGANIZER_OWNER &&
      dbUser?.role?.name !== RoleTypeEnum.ORGANIZER_STAFF) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  // Must be in the specific organization
  const organizer = await prisma.organizer.findFirst({
    where: { userId: user.id, organizationId }
  });
  if (!organizer) throw new HTTPException(403, { message: 'Forbidden' });
  return user;
}

/**
 * Require the user to be an ORGANIZER_OWNER in the specified organization, or an admin.
 */
export async function requireOrgOwner(c: Context, organizationId: string) {
  const user = requireAuth(c);
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (dbUser?.role?.name === RoleTypeEnum.ADMIN) return user;

  if (dbUser?.role?.name !== RoleTypeEnum.ORGANIZER_OWNER) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  const organizer = await prisma.organizer.findFirst({
    where: { userId: user.id, organizationId }
  });
  if (!organizer) throw new HTTPException(403, { message: 'Forbidden' });
  return user;
}

/**
 * Require the user to be an organizer in the event's organization, or an admin.
 * Looks up the event to find its organizationId.
 */
export async function requireEventOrgMember(c: Context, eventId: string) {
  const user = requireAuth(c);
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (dbUser?.role?.name === RoleTypeEnum.ADMIN) return user;

  if (dbUser?.role?.name !== RoleTypeEnum.ORGANIZER_OWNER &&
      dbUser?.role?.name !== RoleTypeEnum.ORGANIZER_STAFF) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event?.organizationId) throw new HTTPException(403, { message: 'Forbidden' });

  const organizer = await prisma.organizer.findFirst({
    where: { userId: user.id, organizationId: event.organizationId }
  });
  if (!organizer) throw new HTTPException(403, { message: 'Forbidden' });
  return user;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/lib/auth-helpers.ts
git commit -m "feat: add auth helper functions (requireAuth, requireRole, requireOrgMember, etc.)"
```

---

### Task 5: Add auth checks to events, races, and race-results routes

**Files:**
- Modify: `apps/backend/src/routes/events.ts`
- Modify: `apps/backend/src/routes/races.ts`
- Modify: `apps/backend/src/routes/race-results.ts`

- [ ] **Step 1: Update events.ts**

Add auth checks to write endpoints. GET stays public.

`apps/backend/src/routes/events.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as eventsService from '../services/events.service.js';
import { requireAuth, requireOrgMember, requireEventOrgMember } from '../lib/auth-helpers.js';

const events = new Hono();

// GET endpoints — public
events.get('/', async (c) => {
  const type = c.req.query('type');
  const organizationId = c.req.query('organizationId');

  if (organizationId) {
    const filter = (c.req.query('filter') as 'all' | 'future' | 'past') || undefined;
    return c.json(await eventsService.getEventsByOrganization(organizationId, filter));
  }
  if (type === 'future') return c.json(await eventsService.getFutureEvents());
  if (type === 'past') {
    const year = c.req.query('year');
    return c.json(await eventsService.getPastEvents(year ? parseInt(year, 10) : undefined));
  }
  return c.json(await eventsService.getFutureEvents());
});

events.get('/:id', async (c) => {
  const event = await eventsService.getEventById(c.req.param('id'));
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

// Write endpoints — require org membership or admin
events.post('/', async (c) => {
  requireAuth(c); // Always require auth for event creation
  const body = await c.req.json();
  if (!body.name || !body.dateTime || !body.year || !body.country || !body.state || !body.createdBy) {
    return c.json({ error: 'name, dateTime, year, country, state, and createdBy are required' }, 400);
  }
  if (body.organizationId) {
    await requireOrgMember(c, body.organizationId);
  }
  const event = await eventsService.createEvent(body);
  return c.json(event, 201);
});

events.patch('/:id', async (c) => {
  await requireEventOrgMember(c, c.req.param('id'));
  const event = await eventsService.updateEvent(c.req.param('id'), await c.req.json());
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

events.delete('/:id', async (c) => {
  await requireEventOrgMember(c, c.req.param('id'));
  const deleted = await eventsService.deleteEvent(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { events };
```

- [ ] **Step 2: Update races.ts**

`apps/backend/src/routes/races.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as racesService from '../services/races.service.js';
import { requireEventOrgMember } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';

const races = new Hono();

// GET endpoints — public
races.get('/', async (c) => {
  const eventId = c.req.query('eventId');
  if (!eventId) return c.json({ error: 'eventId query param is required' }, 400);
  return c.json(await racesService.getRacesByEventId(eventId));
});

races.get('/:id', async (c) => {
  const race = await racesService.getRaceById(c.req.param('id'));
  if (!race) return c.json({ error: 'Not found' }, 404);
  return c.json(race);
});

// Write endpoints — require event org membership or admin
races.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.eventId || !body.raceCategoryAgeId || !body.raceCategoryGenderId || !body.raceCategoryDistanceId || !body.dateTime) {
    return c.json({ error: 'eventId, raceCategoryAgeId, raceCategoryGenderId, raceCategoryDistanceId, and dateTime are required' }, 400);
  }
  await requireEventOrgMember(c, body.eventId);
  try {
    const race = await racesService.createRace(body);
    return c.json(race, 201);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return c.json({ error: 'Race with this category combination already exists', code: 'ACS04' }, 409);
    }
    throw err;
  }
});

races.patch('/:id', async (c) => {
  const race = await prisma.race.findUnique({ where: { id: c.req.param('id') } });
  if (!race) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  const updated = await racesService.updateRace(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

races.delete('/:id', async (c) => {
  const race = await prisma.race.findUnique({ where: { id: c.req.param('id') } });
  if (!race) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  const deleted = await racesService.deleteRace(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { races };
```

- [ ] **Step 3: Update race-results.ts**

`apps/backend/src/routes/race-results.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as raceResultsService from '../services/race-results.service.js';
import { requireEventOrgMember } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';

const raceResults = new Hono();

// GET endpoints — public
raceResults.get('/', async (c) => {
  const raceId = c.req.query('raceId');
  const userId = c.req.query('userId');
  if (raceId) return c.json(await raceResultsService.getRaceResultsByRaceId(raceId));
  if (userId) return c.json(await raceResultsService.getRaceResultsByUserId(userId));
  return c.json({ error: 'raceId or userId query param is required' }, 400);
});

// Write endpoints — require event org membership or admin
raceResults.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.raceId || !body.cyclistId || body.place === undefined) {
    return c.json({ error: 'raceId, cyclistId, and place are required' }, 400);
  }
  // Look up race to get eventId for auth check
  const race = await prisma.race.findUnique({ where: { id: body.raceId } });
  if (!race) return c.json({ error: 'Race not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  try {
    const result = await raceResultsService.createRaceResult(body);
    return c.json(result, 201);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return c.json({ error: 'Result for this cyclist in this race already exists' }, 409);
    }
    throw err;
  }
});

raceResults.patch('/:id', async (c) => {
  const raceResult = await prisma.raceResult.findUnique({
    where: { id: c.req.param('id') },
    include: { race: true }
  });
  if (!raceResult) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, raceResult.race.eventId);
  const result = await raceResultsService.updateRaceResult(c.req.param('id'), await c.req.json());
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

raceResults.delete('/:id', async (c) => {
  const raceResult = await prisma.raceResult.findUnique({
    where: { id: c.req.param('id') },
    include: { race: true }
  });
  if (!raceResult) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, raceResult.race.eventId);
  const deleted = await raceResultsService.deleteRaceResult(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { raceResults };
```

- [ ] **Step 4: Update cyclists.ts — add write endpoints with auth**

`apps/backend/src/routes/cyclists.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as cyclistsService from '../services/cyclists.service.js';
import { requireAuth, requireRole, requireOrgMember } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';
import { prisma } from '../lib/prisma.js';

const cyclists = new Hono();

// GET — public
cyclists.get('/:id', async (c) => {
  const cyclist = await cyclistsService.getCyclistById(c.req.param('id'));
  if (!cyclist) return c.json({ error: 'Not found' }, 404);
  return c.json(cyclist);
});

// POST — organizer (for unregistered cyclists) or admin
cyclists.post('/', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN, RoleTypeEnum.ORGANIZER_OWNER, RoleTypeEnum.ORGANIZER_STAFF]);
  const body = await c.req.json();
  if (!body.firstName) return c.json({ error: 'firstName is required' }, 400);
  // Create unregistered user + cyclist via service
  // (This will be implemented as a new service function)
  const cyclist = await cyclistsService.createUnregisteredCyclist(body);
  return c.json(cyclist, 201);
});

// PATCH — own profile, or organizer, or admin
cyclists.patch('/:id', async (c) => {
  const user = requireAuth(c);
  const cyclist = await prisma.cyclist.findUnique({ where: { id: c.req.param('id') } });
  if (!cyclist) return c.json({ error: 'Not found' }, 404);
  // Allow if own profile
  if (cyclist.userId !== user.id) {
    // Must be admin or organizer
    await requireRole(c, [RoleTypeEnum.ADMIN, RoleTypeEnum.ORGANIZER_OWNER, RoleTypeEnum.ORGANIZER_STAFF]);
  }
  const updated = await cyclistsService.updateCyclist(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

// DELETE — admin or organizer (unlinked only)
cyclists.delete('/:id', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN, RoleTypeEnum.ORGANIZER_OWNER, RoleTypeEnum.ORGANIZER_STAFF]);
  const deleted = await cyclistsService.deleteCyclist(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { cyclists };
```

**Note:** This requires adding `createUnregisteredCyclist`, `updateCyclist`, and `deleteCyclist` functions to `cyclists.service.ts`. These are new service functions:

Add to `apps/backend/src/services/cyclists.service.ts`:
```typescript
export async function createUnregisteredCyclist(data: {
  firstName: string;
  lastName?: string;
  bornYear?: number;
  genderId?: string;
}): Promise<Cyclist> {
  const cyclistRole = await prisma.role.findUnique({ where: { name: 'CYCLIST' } });
  if (!cyclistRole) throw new Error('CYCLIST role not found');

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        name: `${data.firstName} ${data.lastName ?? ''}`.trim(),
        status: 'UNREGISTERED',
        roleId: cyclistRole.id
      }
    });
    const cyclist = await tx.cyclist.create({
      data: {
        userId: user.id,
        bornYear: data.bornYear ?? null,
        genderId: data.genderId ?? null
      },
      include: cyclistInclude
    });
    return cyclist;
  });
  return adaptCyclist(result);
}

export async function updateCyclist(
  id: string,
  data: Partial<{ bornYear: number | null; genderId: string | null }>
): Promise<Cyclist | null> {
  const cyclist = await prisma.cyclist.findUnique({ where: { id } });
  if (!cyclist) return null;
  const updated = await prisma.cyclist.update({
    where: { id },
    data,
    include: cyclistInclude
  });
  return adaptCyclist(updated);
}

export async function deleteCyclist(id: string): Promise<boolean> {
  const cyclist = await prisma.cyclist.findUnique({ where: { id } });
  if (!cyclist) return false;
  await prisma.cyclist.delete({ where: { id } });
  return true;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/routes/events.ts apps/backend/src/routes/races.ts apps/backend/src/routes/race-results.ts apps/backend/src/routes/cyclists.ts apps/backend/src/services/cyclists.service.ts
git commit -m "feat: add auth checks to events, races, race-results, and cyclists routes"
```

---

### Task 6: Add auth checks to organizations, organizers, categories, and invitations routes

**Files:**
- Modify: `apps/backend/src/routes/organizations.ts`
- Modify: `apps/backend/src/routes/organizers.ts`
- Modify: `apps/backend/src/routes/categories.ts`
- Modify: `apps/backend/src/routes/invitations.ts`

- [ ] **Step 1: Update organizations.ts**

`apps/backend/src/routes/organizations.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as orgService from '../services/organizations.service.js';
import { requireRole, requireOrgOwner } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';

const organizations = new Hono();

// GET — public
organizations.get('/', async (c) => {
  const data = await orgService.getAllOrganizations();
  return c.json(data);
});

organizations.get('/:id', async (c) => {
  const org = await orgService.getOrganizationById(c.req.param('id'));
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

// POST — admin only
organizations.post('/', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN]);
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const org = await orgService.createOrganization(body);
  return c.json(org, 201);
});

// PATCH — admin or org owner
organizations.patch('/:id', async (c) => {
  await requireOrgOwner(c, c.req.param('id'));
  const body = await c.req.json();
  const org = await orgService.updateOrganization(c.req.param('id'), body);
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

// DELETE — admin only
organizations.delete('/:id', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN]);
  const deleted = await orgService.deleteOrganization(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { organizations };
```

- [ ] **Step 2: Update organizers.ts**

`apps/backend/src/routes/organizers.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as organizersService from '../services/organizers.service.js';
import { requireOrgOwner } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';

const organizers = new Hono();

// GET — public
organizers.get('/', async (c) => {
  const organizationId = c.req.query('organizationId');
  if (!organizationId) return c.json({ error: 'organizationId query param is required' }, 400);
  return c.json(await organizersService.getOrganizersByOrganizationId(organizationId));
});

organizers.get('/count', async (c) => {
  const organizationId = c.req.query('organizationId');
  if (!organizationId) return c.json({ error: 'organizationId query param is required' }, 400);
  const count = await organizersService.getOrganizersCountByOrganizationId(organizationId);
  return c.json({ count });
});

// PATCH — admin or org owner
organizers.patch('/:id', async (c) => {
  const organizer = await prisma.organizer.findUnique({ where: { id: c.req.param('id') } });
  if (!organizer) return c.json({ error: 'Not found' }, 404);
  await requireOrgOwner(c, organizer.organizationId);
  const body = await c.req.json();
  const updated = await organizersService.updateOrganizer(c.req.param('id'), body);
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

// DELETE — admin or org owner (ACS01 protection in service)
organizers.delete('/:id', async (c) => {
  const organizer = await prisma.organizer.findUnique({ where: { id: c.req.param('id') } });
  if (!organizer) return c.json({ error: 'Not found' }, 404);
  await requireOrgOwner(c, organizer.organizationId);
  const result = await organizersService.deleteOrganizer(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete last owner', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { organizers };
```

- [ ] **Step 3: Update categories.ts**

`apps/backend/src/routes/categories.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as catService from '../services/categories.service.js';
import { requireRole, requireOrgOwner, isAdmin } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';

const categories = new Hono();

// Helper: check auth for category write operations
async function requireCategoryWriteAuth(c: import('hono').Context, organizationId?: string) {
  if (!organizationId) {
    // Global category — admin only
    await requireRole(c, [RoleTypeEnum.ADMIN]);
  } else {
    // Org-scoped category — admin or org owner
    await requireOrgOwner(c, organizationId);
  }
}

// === Age ===
categories.get('/age', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getAgeCategories(organizationId || undefined));
});

categories.post('/age', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createAgeCategory(body);
  return c.json(cat, 201);
});

categories.patch('/age/:id', async (c) => {
  const cat = await catService.getAgeCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateAgeCategory(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

categories.delete('/age/:id', async (c) => {
  const cat = await catService.getAgeCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const result = await catService.deleteAgeCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

// === Gender ===
categories.get('/gender', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getGenderCategories(organizationId || undefined));
});

categories.post('/gender', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createGenderCategory(body);
  return c.json(cat, 201);
});

categories.patch('/gender/:id', async (c) => {
  const cat = await catService.getGenderCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateGenderCategory(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

categories.delete('/gender/:id', async (c) => {
  const cat = await catService.getGenderCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const result = await catService.deleteGenderCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

// === Distance ===
categories.get('/distance', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getDistanceCategories(organizationId || undefined));
});

categories.post('/distance', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createDistanceCategory(body);
  return c.json(cat, 201);
});

categories.patch('/distance/:id', async (c) => {
  const cat = await catService.getDistanceCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateDistanceCategory(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

categories.delete('/distance/:id', async (c) => {
  const cat = await catService.getDistanceCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const result = await catService.deleteDistanceCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { categories };
```

**Note:** This requires adding `getAgeCategoryRaw`, `getGenderCategoryRaw`, `getDistanceCategoryRaw` functions to `categories.service.ts` — simple Prisma `findUnique` calls that return the raw Prisma object (to check `organizationId` for auth):

Add to `apps/backend/src/services/categories.service.ts`:
```typescript
// Raw lookups for auth checks (returns Prisma object, not domain type)
export async function getAgeCategoryRaw(id: string) {
  return prisma.raceCategory.findUnique({ where: { id } });
}
export async function getGenderCategoryRaw(id: string) {
  return prisma.raceCategoryGender.findUnique({ where: { id } });
}
export async function getDistanceCategoryRaw(id: string) {
  return prisma.raceCategoryLength.findUnique({ where: { id } });
}
```

- [ ] **Step 4: Update invitations.ts**

`apps/backend/src/routes/invitations.ts` — replace entirely:
```typescript
import { Hono } from 'hono';
import * as invitationsService from '../services/invitations.service.js';
import { requireAuth, requireOrgOwner, isAdmin, getAuthUser } from '../lib/auth-helpers.js';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const invitations = new Hono();

// GET — auth required
invitations.get('/', async (c) => {
  const organizationId = c.req.query('organizationId');
  const email = c.req.query('email');

  if (organizationId) {
    await requireOrgOwner(c, organizationId);
    return c.json(await invitationsService.getInvitationsByOrganizationId(organizationId));
  }
  if (email) {
    const user = requireAuth(c);
    // Can only query own email unless admin
    const admin = await isAdmin(c);
    if (!admin && user.email !== email) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    const invitation = await invitationsService.getInvitationByEmail(email);
    return c.json(invitation);
  }
  return c.json({ error: 'organizationId or email query param is required' }, 400);
});

// POST — admin or org owner, then trigger magic link
invitations.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.organizationId || !body.email || !body.invitedByUserId || !body.roleType) {
    return c.json({ error: 'organizationId, email, invitedByUserId, and roleType are required' }, 400);
  }
  await requireOrgOwner(c, body.organizationId);

  // Create invitation record
  const invitation = await invitationsService.createInvitation(body);

  // Trigger BetterAuth magic link for the invited email
  try {
    await auth.api.signInMagicLink({ body: { email: body.email }, headers: c.req.raw.headers });
  } catch (err) {
    console.error('[AUTH] Failed to send magic link:', err);
    // Invitation is created even if magic link fails — can be resent later
  }

  return c.json(invitation, 201);
});

// PATCH — admin, org owner, or invited user (accept only)
invitations.patch('/:id', async (c) => {
  const user = requireAuth(c);
  const existing = await prisma.organizationInvitation.findUnique({ where: { id: c.req.param('id') } });
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const admin = await isAdmin(c);
  const isInvitedUser = user.email === existing.email;
  if (!admin && !isInvitedUser) {
    // Check if org owner
    try { await requireOrgOwner(c, existing.organizationId); } catch {
      return c.json({ error: 'Forbidden' }, 403);
    }
  }

  const invitation = await invitationsService.updateInvitation(c.req.param('id'), await c.req.json());
  if (!invitation) return c.json({ error: 'Not found' }, 404);
  return c.json(invitation);
});

// DELETE — admin, org owner, or invited user (reject)
invitations.delete('/:id', async (c) => {
  const user = requireAuth(c);
  const existing = await prisma.organizationInvitation.findUnique({ where: { id: c.req.param('id') } });
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const admin = await isAdmin(c);
  const isInvitedUser = user.email === existing.email;
  if (!admin && !isInvitedUser) {
    try { await requireOrgOwner(c, existing.organizationId); } catch {
      return c.json({ error: 'Forbidden' }, 403);
    }
  }

  const deleted = await invitationsService.deleteInvitation(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { invitations };
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/routes/organizations.ts apps/backend/src/routes/organizers.ts apps/backend/src/routes/categories.ts apps/backend/src/routes/invitations.ts apps/backend/src/services/categories.service.ts
git commit -m "feat: add auth checks to organizations, organizers, categories, and invitations routes"
```

---

## Chunk 3: Complete Organizer Setup + Final Verification

### Task 7: Complete organizer setup endpoint

**Files:**
- Create: `apps/backend/src/routes/auth-setup.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create auth-setup.ts**

`apps/backend/src/routes/auth-setup.ts`:
```typescript
import { Hono } from 'hono';
import { requireAuth } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';
import { RoleTypeEnum } from '@acs/shared';

const authSetup = new Hono();

/**
 * POST /api/auth/complete-organizer-setup
 * Completes the organizer invitation flow after magic link authentication.
 * Body: { firstName, lastName, password, invitationId }
 */
authSetup.post('/complete-organizer-setup', async (c) => {
  const user = requireAuth(c);
  const body = await c.req.json();

  if (!body.firstName || !body.lastName || !body.password || !body.invitationId) {
    return c.json({ error: 'firstName, lastName, password, and invitationId are required' }, 400);
  }

  // Verify invitation exists and is pending
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { id: body.invitationId }
  });
  if (!invitation || invitation.status !== 'PENDING') {
    return c.json({ error: 'Invalid or expired invitation' }, 400);
  }
  if (invitation.email !== user.email) {
    return c.json({ error: 'Invitation email does not match authenticated user' }, 403);
  }

  // Determine role from invitation
  const roleName = invitation.roleType === 'ORGANIZER_OWNER'
    ? RoleTypeEnum.ORGANIZER_OWNER
    : RoleTypeEnum.ORGANIZER_STAFF;

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return c.json({ error: 'Role not found' }, 500);

  // Atomic transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update user profile
    await tx.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        name: `${body.firstName} ${body.lastName}`,
        roleId: role.id
      }
    });

    // 2. Create organizer record
    await tx.organizer.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId
      }
    });

    // 3. Accept invitation
    await tx.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    // 4. Create credential account with password
    // Hash password using Node.js built-in scrypt (same algorithm BetterAuth uses)
    const { scrypt, randomBytes } = await import('node:crypto');
    const { promisify } = await import('node:util');
    const scryptAsync = promisify(scrypt);
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(body.password, salt, 64) as Buffer;
    const hashedPassword = `${salt}:${derivedKey.toString('hex')}`;

    // Check if credential account already exists
    const existingCredential = await tx.account.findFirst({
      where: { userId: user.id, providerId: 'credential' }
    });
    if (!existingCredential) {
      await tx.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: hashedPassword
        }
      });
    }
  });

  // Remove cyclist record if one was auto-created during magic link signup
  await prisma.cyclist.deleteMany({ where: { userId: user.id } });

  // Return updated user
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });

  return c.json({
    id: updatedUser!.id,
    email: updatedUser!.email,
    firstName: updatedUser!.firstName,
    lastName: updatedUser!.lastName,
    role: updatedUser!.role.name
  });
});

export { authSetup };
```

- [ ] **Step 2: Register in routes/index.ts**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { authSetup } from './auth-setup.js';
// ... in registerRoutes:
app.route('/api/auth', authSetup);
```

Note: In `index.ts`, `registerRoutes(app)` is called BEFORE the BetterAuth wildcard handler `app.on(['POST', 'GET'], '/api/auth/*', ...)`. Hono matches routes in registration order, so our specific `/api/auth/complete-organizer-setup` route will be matched first, and the BetterAuth wildcard catches everything else.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```

Note: The `hashPassword` import from `better-auth/crypto` may need adjustment depending on BetterAuth's actual export path. If it fails, alternatives:
- `import { hash } from 'better-auth/crypto'`
- Use Node.js built-in `crypto.scryptSync` directly
- Check BetterAuth docs for the correct password hashing utility

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/routes/auth-setup.ts apps/backend/src/routes/index.ts
git commit -m "feat: add complete-organizer-setup endpoint for invitation flow"
```

---

### Task 8: Update environment and final verification

- [ ] **Step 1: Update .env.example with all new vars**

Ensure `apps/backend/.env.example` includes:
```
DATABASE_URL=postgresql://acs:acs_dev@localhost:5432/acs_dev
PORT=3000
FRONTEND_URL=http://localhost:5173
BETTER_AUTH_SECRET=change-me-to-a-random-32-char-string
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 2: Run turbo build**

```bash
npx turbo build
```
Expected: All packages build without errors.

- [ ] **Step 3: Run turbo check**

```bash
npx turbo check
```
Expected: TypeScript type checking passes.

- [ ] **Step 4: Start backend and test auth flow**

Start backend, then test:
```bash
# Health still works
curl http://localhost:3000/health

# Public endpoints still work without auth
curl http://localhost:3000/api/categories/age
curl http://localhost:3000/api/organizations

# Signup
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"cyclist@test.com","password":"password123","name":"Test Cyclist","firstName":"Test","lastName":"Cyclist"}'

# Login (capture cookie)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"cyclist@test.com","password":"password123"}'

# Protected endpoint without auth — should return 401
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org"}'

# Protected endpoint with auth — should return 403 (cyclist can't create orgs)
curl -b cookies.txt -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org"}'
```

- [ ] **Step 5: Commit any final adjustments**

```bash
git add -A && git commit -m "fix: final Phase 3 adjustments"
```

---

## Success Criteria Checklist

- [ ] Email/password signup creates user + cyclist + account + session
- [ ] Email/password login returns session cookie
- [ ] Session middleware populates user on authenticated requests
- [ ] Protected endpoints return 401 for unauthenticated requests
- [ ] Protected endpoints return 403 for unauthorized roles
- [ ] Organization-scoped endpoints verify org membership
- [ ] Public endpoints remain accessible without auth
- [ ] `turbo build` and `turbo check` pass
- [ ] Health endpoint still works
