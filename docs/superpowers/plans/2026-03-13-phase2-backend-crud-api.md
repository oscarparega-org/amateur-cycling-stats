# Phase 2: Backend CRUD API Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RESTful CRUD API endpoints for all entities to the Hono backend, with adapters returning `@acs/shared` domain types.

**Architecture:** Route (thin HTTP layer) → Service (business logic + Prisma queries) → Adapter (Prisma→Domain transformation). All responses use domain types from `@acs/shared`. No auth in Phase 2.

**Tech Stack:** Hono 4, Prisma 6, TypeScript 5.x (strict), @acs/shared domain types

**Spec:** `docs/superpowers/specs/2026-03-13-phase2-backend-crud-api-design.md`

---

## Chunk 1: Organizations + Categories (simpler entities first)

### Task 1: Organizations adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/organizations.adapter.ts`
- Create: `apps/backend/src/services/organizations.service.ts`
- Create: `apps/backend/src/routes/organizations.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create organizations adapter**

`apps/backend/src/adapters/organizations.adapter.ts`:
```typescript
import type { Organization } from '@acs/shared';
import type { Organization as PrismaOrganization } from '@prisma/client';

type PrismaOrgWithCount = PrismaOrganization & {
  _count?: { events: number };
};

export function adaptOrganization(org: PrismaOrgWithCount): Organization {
  return {
    id: org.id,
    name: org.name,
    description: org.description,
    state: org.state,
    eventCount: org._count?.events,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString()
  };
}
```

- [ ] **Step 2: Create organizations service**

`apps/backend/src/services/organizations.service.ts`:
```typescript
import type { Organization, PartialOrganization } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptOrganization } from '../adapters/organizations.adapter.js';

export async function getAllOrganizations(): Promise<Organization[]> {
  const orgs = await prisma.organization.findMany({
    include: { _count: { select: { events: true } } },
    orderBy: { name: 'asc' }
  });
  return orgs.map(adaptOrganization);
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } }
  });
  return org ? adaptOrganization(org) : null;
}

export async function createOrganization(data: {
  name: string;
  description?: string;
}): Promise<Organization> {
  const org = await prisma.organization.create({
    data,
    include: { _count: { select: { events: true } } }
  });
  return adaptOrganization(org);
}

export async function updateOrganization(
  id: string,
  data: PartialOrganization
): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return null;
  const updated = await prisma.organization.update({
    where: { id },
    data,
    include: { _count: { select: { events: true } } }
  });
  return adaptOrganization(updated);
}

export async function deleteOrganization(id: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return false;
  await prisma.organization.delete({ where: { id } });
  return true;
}
```

- [ ] **Step 3: Create organizations route**

`apps/backend/src/routes/organizations.ts`:
```typescript
import { Hono } from 'hono';
import * as orgService from '../services/organizations.service.js';

const organizations = new Hono();

organizations.get('/', async (c) => {
  const data = await orgService.getAllOrganizations();
  return c.json(data);
});

organizations.get('/:id', async (c) => {
  const org = await orgService.getOrganizationById(c.req.param('id'));
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

organizations.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const org = await orgService.createOrganization(body);
  return c.json(org, 201);
});

organizations.patch('/:id', async (c) => {
  const body = await c.req.json();
  const org = await orgService.updateOrganization(c.req.param('id'), body);
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

organizations.delete('/:id', async (c) => {
  const deleted = await orgService.deleteOrganization(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { organizations };
```

- [ ] **Step 4: Register route in index.ts**

Update `apps/backend/src/routes/index.ts`:
```typescript
import { Hono } from 'hono';
import { health } from './health.js';
import { organizations } from './organizations.js';

export function registerRoutes(app: Hono) {
  app.route('/health', health);
  app.route('/api/organizations', organizations);
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Test manually**

Start backend, then test:
```bash
# List (empty)
curl http://localhost:3000/api/organizations
# Create
curl -X POST http://localhost:3000/api/organizations -H "Content-Type: application/json" -d '{"name":"Test Org"}'
# Get by ID (use ID from create response)
curl http://localhost:3000/api/organizations/<id>
# Update
curl -X PATCH http://localhost:3000/api/organizations/<id> -H "Content-Type: application/json" -d '{"description":"Updated"}'
# Delete
curl -X DELETE http://localhost:3000/api/organizations/<id>
```

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/adapters/organizations.adapter.ts apps/backend/src/services/organizations.service.ts apps/backend/src/routes/organizations.ts apps/backend/src/routes/index.ts
git commit -m "feat: add organizations CRUD API"
```

---

### Task 2: Categories adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/categories.adapter.ts`
- Create: `apps/backend/src/services/categories.service.ts`
- Create: `apps/backend/src/routes/categories.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create categories adapter**

`apps/backend/src/adapters/categories.adapter.ts`:
```typescript
import type { RaceCategoryAge, RaceCategoryGender, RaceCategoryDistance } from '@acs/shared';
import type {
  RaceCategory as PrismaRaceCategory,
  RaceCategoryGender as PrismaRaceCategoryGender,
  RaceCategoryLength as PrismaRaceCategoryLength
} from '@prisma/client';

export function adaptAgeCategory(cat: PrismaRaceCategory): RaceCategoryAge {
  return {
    id: cat.id,
    name: cat.name,
    fromAge: cat.fromAge,
    toAge: cat.toAge,
    isGlobal: cat.isGlobal,
    isDefault: cat.isDefault,
    organizationId: cat.organizationId,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}

export function adaptGenderCategory(cat: PrismaRaceCategoryGender): RaceCategoryGender {
  return {
    id: cat.id,
    name: cat.name,
    isGlobal: cat.isGlobal,
    isDefault: cat.isDefault,
    organizationId: cat.organizationId,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}

export function adaptDistanceCategory(cat: PrismaRaceCategoryLength): RaceCategoryDistance {
  return {
    id: cat.id,
    name: cat.name,
    distance: cat.distance,
    isGlobal: cat.isGlobal,
    isDefault: cat.isDefault,
    organizationId: cat.organizationId,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}
```

- [ ] **Step 2: Create categories service**

`apps/backend/src/services/categories.service.ts`:
```typescript
import type { RaceCategoryAge, RaceCategoryGender, RaceCategoryDistance } from '@acs/shared';
import { PG_ERROR_CODES } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import {
  adaptAgeCategory,
  adaptGenderCategory,
  adaptDistanceCategory
} from '../adapters/categories.adapter.js';

// === Age Categories ===

export async function getAgeCategories(organizationId?: string): Promise<RaceCategoryAge[]> {
  const cats = await prisma.raceCategory.findMany({
    where: organizationId
      ? { OR: [{ isGlobal: true }, { organizationId }] }
      : { isGlobal: true },
    orderBy: { name: 'asc' }
  });
  return cats.map(adaptAgeCategory);
}

export async function createAgeCategory(data: {
  name: string;
  fromAge?: number;
  toAge?: number;
  organizationId?: string;
}): Promise<RaceCategoryAge> {
  const cat = await prisma.raceCategory.create({
    data: {
      name: data.name,
      fromAge: data.fromAge ?? null,
      toAge: data.toAge ?? null,
      isGlobal: !data.organizationId,
      isDefault: false,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptAgeCategory(cat);
}

export async function updateAgeCategory(
  id: string,
  data: { name?: string; fromAge?: number | null; toAge?: number | null }
): Promise<RaceCategoryAge | null> {
  const cat = await prisma.raceCategory.findUnique({ where: { id } });
  if (!cat) return null;
  const updated = await prisma.raceCategory.update({ where: { id }, data });
  return adaptAgeCategory(updated);
}

export async function deleteAgeCategory(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const cat = await prisma.raceCategory.findUnique({
    where: { id },
    include: { _count: { select: { races: true } } }
  });
  if (!cat) return { success: false, errorCode: 'NOT_FOUND' };
  if (cat.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (cat._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  await prisma.raceCategory.delete({ where: { id } });
  return { success: true };
}

// === Gender Categories ===

export async function getGenderCategories(organizationId?: string): Promise<RaceCategoryGender[]> {
  const cats = await prisma.raceCategoryGender.findMany({
    where: organizationId
      ? { OR: [{ isGlobal: true }, { organizationId }] }
      : { isGlobal: true },
    orderBy: { name: 'asc' }
  });
  return cats.map(adaptGenderCategory);
}

export async function createGenderCategory(data: {
  name: string;
  organizationId?: string;
}): Promise<RaceCategoryGender> {
  const cat = await prisma.raceCategoryGender.create({
    data: {
      name: data.name,
      isGlobal: !data.organizationId,
      isDefault: false,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptGenderCategory(cat);
}

export async function updateGenderCategory(
  id: string,
  data: { name?: string }
): Promise<RaceCategoryGender | null> {
  const cat = await prisma.raceCategoryGender.findUnique({ where: { id } });
  if (!cat) return null;
  const updated = await prisma.raceCategoryGender.update({ where: { id }, data });
  return adaptGenderCategory(updated);
}

export async function deleteGenderCategory(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const cat = await prisma.raceCategoryGender.findUnique({
    where: { id },
    include: { _count: { select: { races: true } } }
  });
  if (!cat) return { success: false, errorCode: 'NOT_FOUND' };
  if (cat.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (cat._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  await prisma.raceCategoryGender.delete({ where: { id } });
  return { success: true };
}

// === Distance Categories ===

export async function getDistanceCategories(organizationId?: string): Promise<RaceCategoryDistance[]> {
  const cats = await prisma.raceCategoryLength.findMany({
    where: organizationId
      ? { OR: [{ isGlobal: true }, { organizationId }] }
      : { isGlobal: true },
    orderBy: { name: 'asc' }
  });
  return cats.map(adaptDistanceCategory);
}

export async function createDistanceCategory(data: {
  name: string;
  distance?: number;
  organizationId?: string;
}): Promise<RaceCategoryDistance> {
  const cat = await prisma.raceCategoryLength.create({
    data: {
      name: data.name,
      distance: data.distance ?? null,
      isGlobal: !data.organizationId,
      isDefault: false,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptDistanceCategory(cat);
}

export async function updateDistanceCategory(
  id: string,
  data: { name?: string; distance?: number | null }
): Promise<RaceCategoryDistance | null> {
  const cat = await prisma.raceCategoryLength.findUnique({ where: { id } });
  if (!cat) return null;
  const updated = await prisma.raceCategoryLength.update({ where: { id }, data });
  return adaptDistanceCategory(updated);
}

export async function deleteDistanceCategory(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const cat = await prisma.raceCategoryLength.findUnique({
    where: { id },
    include: { _count: { select: { races: true } } }
  });
  if (!cat) return { success: false, errorCode: 'NOT_FOUND' };
  if (cat.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (cat._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  await prisma.raceCategoryLength.delete({ where: { id } });
  return { success: true };
}
```

- [ ] **Step 3: Create categories route**

`apps/backend/src/routes/categories.ts`:
```typescript
import { Hono } from 'hono';
import * as catService from '../services/categories.service.js';

const categories = new Hono();

// === Age ===
categories.get('/age', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getAgeCategories(organizationId || undefined));
});

categories.post('/age', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const cat = await catService.createAgeCategory(body);
  return c.json(cat, 201);
});

categories.patch('/age/:id', async (c) => {
  const cat = await catService.updateAgeCategory(c.req.param('id'), await c.req.json());
  if (!cat) return c.json({ error: 'Not found' }, 404);
  return c.json(cat);
});

categories.delete('/age/:id', async (c) => {
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
  const cat = await catService.createGenderCategory(body);
  return c.json(cat, 201);
});

categories.patch('/gender/:id', async (c) => {
  const cat = await catService.updateGenderCategory(c.req.param('id'), await c.req.json());
  if (!cat) return c.json({ error: 'Not found' }, 404);
  return c.json(cat);
});

categories.delete('/gender/:id', async (c) => {
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
  const cat = await catService.createDistanceCategory(body);
  return c.json(cat, 201);
});

categories.patch('/distance/:id', async (c) => {
  const cat = await catService.updateDistanceCategory(c.req.param('id'), await c.req.json());
  if (!cat) return c.json({ error: 'Not found' }, 404);
  return c.json(cat);
});

categories.delete('/distance/:id', async (c) => {
  const result = await catService.deleteDistanceCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { categories };
```

- [ ] **Step 4: Register route in index.ts**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { categories } from './categories.js';
// ... in registerRoutes:
app.route('/api/categories', categories);
```

- [ ] **Step 5: Verify TypeScript compiles and test manually**

Run: `cd apps/backend && npx tsc --noEmit`

Test categories are returned (seeded data): `curl http://localhost:3000/api/categories/age`
Expected: 26 age categories as JSON array with domain type shape.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/adapters/categories.adapter.ts apps/backend/src/services/categories.service.ts apps/backend/src/routes/categories.ts apps/backend/src/routes/index.ts
git commit -m "feat: add categories CRUD API (age, gender, distance)"
```

---

## Chunk 2: Events + Races + Cyclists

### Task 3: Events adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/events.adapter.ts`
- Create: `apps/backend/src/services/events.service.ts`
- Create: `apps/backend/src/routes/events.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create events adapter**

`apps/backend/src/adapters/events.adapter.ts`:
```typescript
import type { Event } from '@acs/shared';
import type { Event as PrismaEvent } from '@prisma/client';

export function adaptEvent(event: PrismaEvent): Event {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    dateTime: event.dateTime.toISOString(),
    year: event.year,
    city: event.city,
    state: event.state,
    country: event.country,
    eventStatus: event.eventStatus,
    organizationId: event.organizationId,
    createdBy: event.createdBy,
    isPublicVisible: event.isPublicVisible,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  };
}
```

- [ ] **Step 2: Create events service**

`apps/backend/src/services/events.service.ts`:
```typescript
import type { Event } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptEvent } from '../adapters/events.adapter.js';

export async function getFutureEvents(): Promise<Event[]> {
  const events = await prisma.event.findMany({
    where: { isPublicVisible: true, dateTime: { gte: new Date() } },
    orderBy: { dateTime: 'asc' }
  });
  return events.map(adaptEvent);
}

export async function getPastEvents(year?: number): Promise<Event[]> {
  const where: Record<string, unknown> = {
    isPublicVisible: true,
    dateTime: { lt: new Date() }
  };
  if (year) where.year = year;
  const events = await prisma.event.findMany({
    where,
    orderBy: { dateTime: 'desc' }
  });
  return events.map(adaptEvent);
}

export async function getEventsByOrganization(
  organizationId: string,
  filter?: 'all' | 'future' | 'past'
): Promise<Event[]> {
  const where: Record<string, unknown> = { organizationId };
  if (filter === 'future') where.dateTime = { gte: new Date() };
  else if (filter === 'past') where.dateTime = { lt: new Date() };
  const events = await prisma.event.findMany({
    where,
    orderBy: { dateTime: 'desc' }
  });
  return events.map(adaptEvent);
}

// Note: The `Event` domain type has no `races` field. The spec mentions
// "event with races" but this is handled by fetching races separately
// via GET /api/races?eventId=xxx. This keeps the Event type flat.
export async function getEventById(id: string): Promise<Event | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? adaptEvent(event) : null;
}

export async function createEvent(data: {
  name: string;
  dateTime: string;
  year: number;
  country: string;
  state: string;
  city?: string;
  description?: string;
  createdBy: string;
  organizationId?: string;
}): Promise<Event> {
  const event = await prisma.event.create({
    data: {
      name: data.name,
      dateTime: new Date(data.dateTime),
      year: data.year,
      country: data.country,
      state: data.state,
      city: data.city ?? null,
      description: data.description ?? null,
      createdBy: data.createdBy,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptEvent(event);
}

export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    dateTime: string;
    eventStatus: string;
    year: number;
    country: string;
    state: string;
    city: string | null;
    isPublicVisible: boolean;
  }>
): Promise<Event | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return null;
  const updateData: Record<string, unknown> = { ...data };
  if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
  const updated = await prisma.event.update({ where: { id }, data: updateData });
  return adaptEvent(updated);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return false;
  await prisma.event.delete({ where: { id } });
  return true;
}
```

- [ ] **Step 3: Create events route**

`apps/backend/src/routes/events.ts`:
```typescript
import { Hono } from 'hono';
import * as eventsService from '../services/events.service.js';

const events = new Hono();

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

events.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.dateTime || !body.year || !body.country || !body.state || !body.createdBy) {
    return c.json({ error: 'name, dateTime, year, country, state, and createdBy are required' }, 400);
  }
  const event = await eventsService.createEvent(body);
  return c.json(event, 201);
});

events.patch('/:id', async (c) => {
  const event = await eventsService.updateEvent(c.req.param('id'), await c.req.json());
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

events.delete('/:id', async (c) => {
  const deleted = await eventsService.deleteEvent(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { events };
```

- [ ] **Step 4: Register route and verify**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { events } from './events.js';
// ... in registerRoutes:
app.route('/api/events', events);
```

Run: `cd apps/backend && npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/adapters/events.adapter.ts apps/backend/src/services/events.service.ts apps/backend/src/routes/events.ts apps/backend/src/routes/index.ts
git commit -m "feat: add events CRUD API"
```

---

### Task 4: Races adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/races.adapter.ts`
- Create: `apps/backend/src/services/races.service.ts`
- Create: `apps/backend/src/routes/races.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create races adapter**

`apps/backend/src/adapters/races.adapter.ts`:
```typescript
import type { Race } from '@acs/shared';
import type {
  Race as PrismaRace,
  RaceCategory,
  RaceCategoryGender,
  RaceCategoryLength
} from '@prisma/client';

type PrismaRaceWithCategories = PrismaRace & {
  categoryAge: RaceCategory;
  categoryGender: RaceCategoryGender;
  categoryDistance: RaceCategoryLength;
};

export function adaptRace(race: PrismaRaceWithCategories): Race {
  return {
    id: race.id,
    name: race.name,
    description: race.description,
    dateTime: race.dateTime.toISOString(),
    eventId: race.eventId,
    raceCategoryAgeId: race.raceCategoryAgeId,
    raceCategoryGenderId: race.raceCategoryGenderId,
    raceCategoryDistanceId: race.raceCategoryDistanceId,
    raceCategoryAgeName: race.categoryAge.name,
    raceCategoryGenderName: race.categoryGender.name,
    raceCategoryDistanceName: race.categoryDistance.name,
    isPublicVisible: race.isPublicVisible,
    createdAt: race.createdAt.toISOString(),
    updatedAt: race.updatedAt.toISOString()
  };
}

export const raceInclude = {
  categoryAge: true,
  categoryGender: true,
  categoryDistance: true
} as const;
```

- [ ] **Step 2: Create races service**

`apps/backend/src/services/races.service.ts`:
```typescript
import type { Race } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptRace, raceInclude } from '../adapters/races.adapter.js';

export async function getRacesByEventId(eventId: string): Promise<Race[]> {
  const races = await prisma.race.findMany({
    where: { eventId },
    include: raceInclude,
    orderBy: { dateTime: 'asc' }
  });
  return races.map(adaptRace);
}

export async function getRaceById(id: string): Promise<Race | null> {
  const race = await prisma.race.findUnique({
    where: { id },
    include: raceInclude
  });
  return race ? adaptRace(race) : null;
}

export async function createRace(data: {
  eventId: string;
  raceCategoryAgeId: string;
  raceCategoryGenderId: string;
  raceCategoryDistanceId: string;
  dateTime: string;
  name?: string;
  description?: string;
}): Promise<Race> {
  const race = await prisma.race.create({
    data: {
      eventId: data.eventId,
      raceCategoryAgeId: data.raceCategoryAgeId,
      raceCategoryGenderId: data.raceCategoryGenderId,
      raceCategoryDistanceId: data.raceCategoryDistanceId,
      dateTime: new Date(data.dateTime),
      name: data.name ?? null,
      description: data.description ?? null
    },
    include: raceInclude
  });
  return adaptRace(race);
}

export async function updateRace(
  id: string,
  data: Partial<{
    name: string | null;
    description: string | null;
    dateTime: string;
    raceCategoryAgeId: string;
    raceCategoryGenderId: string;
    raceCategoryDistanceId: string;
    isPublicVisible: boolean;
  }>
): Promise<Race | null> {
  const race = await prisma.race.findUnique({ where: { id } });
  if (!race) return null;
  const updateData: Record<string, unknown> = { ...data };
  if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
  const updated = await prisma.race.update({
    where: { id },
    data: updateData,
    include: raceInclude
  });
  return adaptRace(updated);
}

export async function deleteRace(id: string): Promise<boolean> {
  const race = await prisma.race.findUnique({ where: { id } });
  if (!race) return false;
  await prisma.race.delete({ where: { id } });
  return true;
}
```

- [ ] **Step 3: Create races route**

`apps/backend/src/routes/races.ts`:
```typescript
import { Hono } from 'hono';
import * as racesService from '../services/races.service.js';

const races = new Hono();

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

races.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.eventId || !body.raceCategoryAgeId || !body.raceCategoryGenderId || !body.raceCategoryDistanceId || !body.dateTime) {
    return c.json({ error: 'eventId, raceCategoryAgeId, raceCategoryGenderId, raceCategoryDistanceId, and dateTime are required' }, 400);
  }
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
  const race = await racesService.updateRace(c.req.param('id'), await c.req.json());
  if (!race) return c.json({ error: 'Not found' }, 404);
  return c.json(race);
});

races.delete('/:id', async (c) => {
  const deleted = await racesService.deleteRace(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { races };
```

- [ ] **Step 4: Register route, verify, and commit**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { races } from './races.js';
// ... in registerRoutes:
app.route('/api/races', races);
```

Run: `cd apps/backend && npx tsc --noEmit`

```bash
git add apps/backend/src/adapters/races.adapter.ts apps/backend/src/services/races.service.ts apps/backend/src/routes/races.ts apps/backend/src/routes/index.ts
git commit -m "feat: add races CRUD API"
```

---

### Task 5: Cyclists adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/cyclists.adapter.ts`
- Create: `apps/backend/src/services/cyclists.service.ts`
- Create: `apps/backend/src/routes/cyclists.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create cyclists adapter**

`apps/backend/src/adapters/cyclists.adapter.ts`:
```typescript
import type { Cyclist } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type {
  Cyclist as PrismaCyclist,
  User,
  CyclistGender,
  Role
} from '@prisma/client';

type PrismaCyclistWithRelations = PrismaCyclist & {
  user: User & { role: Role };
  gender: CyclistGender | null;
};

export function adaptCyclist(cyclist: PrismaCyclistWithRelations): Cyclist {
  return {
    id: cyclist.id,
    firstName: cyclist.user.firstName,
    lastName: cyclist.user.lastName ?? '',
    email: cyclist.user.email,
    roleType: cyclist.user.role.name === 'CYCLIST' ? RoleTypeEnum.CYCLIST : null,
    status: cyclist.user.status,
    genderName: cyclist.gender?.name ?? null,
    bornYear: cyclist.bornYear,
    createdAt: cyclist.createdAt.toISOString(),
    updatedAt: cyclist.updatedAt.toISOString()
  };
}

export const cyclistInclude = {
  user: { include: { role: true } },
  gender: true
} as const;
```

- [ ] **Step 2: Create cyclists service**

`apps/backend/src/services/cyclists.service.ts`:
```typescript
import type { Cyclist } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptCyclist, cyclistInclude } from '../adapters/cyclists.adapter.js';

export async function getCyclistById(id: string): Promise<Cyclist | null> {
  const cyclist = await prisma.cyclist.findUnique({
    where: { id },
    include: cyclistInclude
  });
  return cyclist ? adaptCyclist(cyclist) : null;
}
```

- [ ] **Step 3: Create cyclists route**

`apps/backend/src/routes/cyclists.ts`:
```typescript
import { Hono } from 'hono';
import * as cyclistsService from '../services/cyclists.service.js';

const cyclists = new Hono();

cyclists.get('/:id', async (c) => {
  const cyclist = await cyclistsService.getCyclistById(c.req.param('id'));
  if (!cyclist) return c.json({ error: 'Not found' }, 404);
  return c.json(cyclist);
});

export { cyclists };
```

- [ ] **Step 4: Register route, verify, and commit**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { cyclists } from './cyclists.js';
// ... in registerRoutes:
app.route('/api/cyclists', cyclists);
```

Run: `cd apps/backend && npx tsc --noEmit`

```bash
git add apps/backend/src/adapters/cyclists.adapter.ts apps/backend/src/services/cyclists.service.ts apps/backend/src/routes/cyclists.ts apps/backend/src/routes/index.ts
git commit -m "feat: add cyclists GET API"
```

---

## Chunk 3: Race Results + Organizers + Invitations

### Task 6: Race Results adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/race-results.adapter.ts`
- Create: `apps/backend/src/services/race-results.service.ts`
- Create: `apps/backend/src/routes/race-results.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create race-results adapter**

The `RaceResult` domain type is a fully denormalized flat structure. The adapter must flatten race→event and race→categories data.

`apps/backend/src/adapters/race-results.adapter.ts`:
```typescript
import type { RaceResult } from '@acs/shared';
import type {
  RaceResult as PrismaRaceResult,
  Race,
  Event,
  RaceCategory,
  RaceCategoryGender,
  RaceCategoryLength,
  Cyclist,
  User
} from '@prisma/client';

type PrismaRaceResultWithRelations = PrismaRaceResult & {
  race: Race & {
    event: Event;
    categoryAge: RaceCategory;
    categoryGender: RaceCategoryGender;
    categoryDistance: RaceCategoryLength;
  };
  cyclist: Cyclist & { user: User };
};

export function adaptRaceResult(result: PrismaRaceResultWithRelations): RaceResult {
  const { race } = result;
  return {
    id: result.id,
    place: result.place,
    time: result.time,
    cyclistId: result.cyclistId,
    eventId: race.eventId,
    raceId: result.raceId,
    raceCategoryAgeId: race.raceCategoryAgeId,
    raceCategoryGenderId: race.raceCategoryGenderId,
    raceCategoryDistanceId: race.raceCategoryDistanceId,
    eventName: race.event.name,
    eventDateTime: race.event.dateTime.toISOString(),
    eventYear: race.event.year,
    eventCity: race.event.city ?? '',
    eventState: race.event.state,
    eventCountry: race.event.country,
    eventStatus: race.event.eventStatus,
    raceName: race.name,
    raceDateTime: race.dateTime.toISOString(),
    raceCategoryType: race.categoryAge.name,
    raceCategoryGenderType: race.categoryGender.name,
    raceCategoryDistanceType: race.categoryDistance.name,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString()
  };
}

export const raceResultInclude = {
  race: {
    include: {
      event: true,
      categoryAge: true,
      categoryGender: true,
      categoryDistance: true
    }
  },
  cyclist: {
    include: { user: true }
  }
} as const;
```

- [ ] **Step 2: Create race-results service**

`apps/backend/src/services/race-results.service.ts`:
```typescript
import type { RaceResult } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptRaceResult, raceResultInclude } from '../adapters/race-results.adapter.js';

export async function getRaceResultsByRaceId(raceId: string): Promise<RaceResult[]> {
  const results = await prisma.raceResult.findMany({
    where: { raceId },
    include: raceResultInclude,
    orderBy: { place: 'asc' }
  });
  return results.map(adaptRaceResult);
}

export async function getRaceResultsByUserId(userId: string): Promise<RaceResult[]> {
  const results = await prisma.raceResult.findMany({
    where: { cyclist: { userId } },
    include: raceResultInclude,
    orderBy: { createdAt: 'desc' }
  });
  return results.map(adaptRaceResult);
}

export async function createRaceResult(data: {
  raceId: string;
  cyclistId: string;
  place: number;
  time?: string;
}): Promise<RaceResult> {
  const result = await prisma.raceResult.create({
    data: {
      raceId: data.raceId,
      cyclistId: data.cyclistId,
      place: data.place,
      time: data.time ?? null
    },
    include: raceResultInclude
  });
  return adaptRaceResult(result);
}

export async function updateRaceResult(
  id: string,
  data: Partial<{ place: number; time: string | null }>
): Promise<RaceResult | null> {
  const result = await prisma.raceResult.findUnique({ where: { id } });
  if (!result) return null;
  const updated = await prisma.raceResult.update({
    where: { id },
    data,
    include: raceResultInclude
  });
  return adaptRaceResult(updated);
}

export async function deleteRaceResult(id: string): Promise<boolean> {
  const result = await prisma.raceResult.findUnique({ where: { id } });
  if (!result) return false;
  await prisma.raceResult.delete({ where: { id } });
  return true;
}
```

- [ ] **Step 3: Create race-results route**

`apps/backend/src/routes/race-results.ts`:
```typescript
import { Hono } from 'hono';
import * as raceResultsService from '../services/race-results.service.js';

const raceResults = new Hono();

raceResults.get('/', async (c) => {
  const raceId = c.req.query('raceId');
  const userId = c.req.query('userId');
  if (raceId) return c.json(await raceResultsService.getRaceResultsByRaceId(raceId));
  if (userId) return c.json(await raceResultsService.getRaceResultsByUserId(userId));
  return c.json({ error: 'raceId or userId query param is required' }, 400);
});

raceResults.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.raceId || !body.cyclistId || body.place === undefined) {
    return c.json({ error: 'raceId, cyclistId, and place are required' }, 400);
  }
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
  const result = await raceResultsService.updateRaceResult(c.req.param('id'), await c.req.json());
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

raceResults.delete('/:id', async (c) => {
  const deleted = await raceResultsService.deleteRaceResult(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { raceResults };
```

- [ ] **Step 4: Register route, verify, and commit**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { raceResults } from './race-results.js';
// ... in registerRoutes:
app.route('/api/race-results', raceResults);
```

Run: `cd apps/backend && npx tsc --noEmit`

```bash
git add apps/backend/src/adapters/race-results.adapter.ts apps/backend/src/services/race-results.service.ts apps/backend/src/routes/race-results.ts apps/backend/src/routes/index.ts
git commit -m "feat: add race results CRUD API with denormalized responses"
```

---

### Task 7: Organizers adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/organizers.adapter.ts`
- Create: `apps/backend/src/services/organizers.service.ts`
- Create: `apps/backend/src/routes/organizers.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create organizers adapter**

`apps/backend/src/adapters/organizers.adapter.ts`:
```typescript
import type { Organizer } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type { Organizer as PrismaOrganizer, User, Role } from '@prisma/client';

type PrismaOrganizerWithRelations = PrismaOrganizer & {
  user: User & { role: Role };
};

// Role names in seed data are exact uppercase: 'ORGANIZER_OWNER', 'ORGANIZER_STAFF'
// matching RoleTypeEnum values. Validated here with explicit check.
export function adaptOrganizer(org: PrismaOrganizerWithRelations): Organizer {
  const roleName = org.user.role.name;
  let roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;
  if (roleName === RoleTypeEnum.ORGANIZER_OWNER) {
    roleType = RoleTypeEnum.ORGANIZER_OWNER;
  } else if (roleName === RoleTypeEnum.ORGANIZER_STAFF) {
    roleType = RoleTypeEnum.ORGANIZER_STAFF;
  } else {
    throw new Error(`Unexpected organizer role: ${roleName}`);
  }
  return {
    id: org.id,
    firstName: org.user.firstName,
    lastName: org.user.lastName ?? '',
    email: org.user.email ?? '',
    roleType,
    organizationId: org.organizationId,
    status: org.user.status,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString()
  };
}

export const organizerInclude = {
  user: { include: { role: true } }
} as const;
```

- [ ] **Step 2: Create organizers service**

`apps/backend/src/services/organizers.service.ts`:
```typescript
import type { Organizer, PartialOrganizer } from '@acs/shared';
import { PG_ERROR_CODES, RoleTypeEnum } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptOrganizer, organizerInclude } from '../adapters/organizers.adapter.js';

// Uses RoleTypeEnum for all role name comparisons to avoid string literal fragility

export async function getOrganizersByOrganizationId(organizationId: string): Promise<Organizer[]> {
  const organizers = await prisma.organizer.findMany({
    where: { organizationId },
    include: organizerInclude
  });
  return organizers.map(adaptOrganizer);
}

export async function getOrganizersCountByOrganizationId(organizationId: string): Promise<number> {
  return prisma.organizer.count({ where: { organizationId } });
}

export async function updateOrganizer(
  id: string,
  data: PartialOrganizer
): Promise<Organizer | null> {
  const organizer = await prisma.organizer.findUnique({
    where: { id },
    include: organizerInclude
  });
  if (!organizer) return null;

  await prisma.$transaction(async (tx) => {
    // Update user fields (firstName, lastName)
    const userUpdate: Record<string, unknown> = {};
    if (data.firstName !== undefined) userUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName;

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id: organizer.userId }, data: userUpdate });
    }

    // Update role if roleType changed
    if (data.roleType !== undefined) {
      const roleName = data.roleType === RoleTypeEnum.ORGANIZER_OWNER
        ? 'ORGANIZER_OWNER'
        : 'ORGANIZER_STAFF';
      const role = await tx.role.findUnique({ where: { name: roleName } });
      if (role) {
        await tx.user.update({
          where: { id: organizer.userId },
          data: { roleId: role.id }
        });
      }
    }
  });

  const updated = await prisma.organizer.findUnique({
    where: { id },
    include: organizerInclude
  });
  return updated ? adaptOrganizer(updated) : null;
}

export async function deleteOrganizer(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const organizer = await prisma.organizer.findUnique({
    where: { id },
    include: { user: { include: { role: true } } }
  });
  if (!organizer) return { success: false, errorCode: 'NOT_FOUND' };

  // Check if this is the last owner — use RoleTypeEnum for safe comparison
  if (organizer.user.role.name === RoleTypeEnum.ORGANIZER_OWNER) {
    const ownerRole = await prisma.role.findUnique({ where: { name: RoleTypeEnum.ORGANIZER_OWNER } });
    if (ownerRole) {
      const ownerCount = await prisma.organizer.count({
        where: {
          organizationId: organizer.organizationId,
          user: { roleId: ownerRole.id }
        }
      });
      if (ownerCount <= 1) {
        return { success: false, errorCode: PG_ERROR_CODES.CANNOT_DELETE_LAST_OWNER };
      }
    }
  }

  await prisma.organizer.delete({ where: { id } });
  return { success: true };
}
```

- [ ] **Step 3: Create organizers route**

`apps/backend/src/routes/organizers.ts`:
```typescript
import { Hono } from 'hono';
import * as organizersService from '../services/organizers.service.js';

const organizers = new Hono();

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

organizers.patch('/:id', async (c) => {
  const body = await c.req.json();
  const organizer = await organizersService.updateOrganizer(c.req.param('id'), body);
  if (!organizer) return c.json({ error: 'Not found' }, 404);
  return c.json(organizer);
});

organizers.delete('/:id', async (c) => {
  const result = await organizersService.deleteOrganizer(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete last owner', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { organizers };
```

- [ ] **Step 4: Register route, verify, and commit**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { organizers } from './organizers.js';
// ... in registerRoutes:
app.route('/api/organizers', organizers);
```

Run: `cd apps/backend && npx tsc --noEmit`

```bash
git add apps/backend/src/adapters/organizers.adapter.ts apps/backend/src/services/organizers.service.ts apps/backend/src/routes/organizers.ts apps/backend/src/routes/index.ts
git commit -m "feat: add organizers API with cross-model update and last-owner protection"
```

---

### Task 8: Invitations adapter + service + route

**Files:**
- Create: `apps/backend/src/adapters/invitations.adapter.ts`
- Create: `apps/backend/src/services/invitations.service.ts`
- Create: `apps/backend/src/routes/invitations.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Create invitations adapter**

`apps/backend/src/adapters/invitations.adapter.ts`:
```typescript
import type { OrganizationInvitation } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type { OrganizationInvitation as PrismaInvitation } from '@prisma/client';

export function adaptInvitation(inv: PrismaInvitation): OrganizationInvitation {
  const roleType = inv.roleType === 'ORGANIZER_OWNER'
    ? RoleTypeEnum.ORGANIZER_OWNER
    : RoleTypeEnum.ORGANIZER_STAFF;
  return {
    id: inv.id,
    organizationId: inv.organizationId,
    email: inv.email,
    invitedByUserId: inv.invitedByUserId,
    roleType,
    status: inv.status,
    retryCount: inv.retryCount,
    lastInvitationSentAt: inv.lastInvitationSentAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString()
  };
}
```

- [ ] **Step 2: Create invitations service**

`apps/backend/src/services/invitations.service.ts`:
```typescript
import type { OrganizationInvitation } from '@acs/shared';
import type { InvitationRoleType, InvitationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { adaptInvitation } from '../adapters/invitations.adapter.js';

export async function getInvitationsByOrganizationId(
  organizationId: string
): Promise<OrganizationInvitation[]> {
  const invitations = await prisma.organizationInvitation.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });
  return invitations.map(adaptInvitation);
}

export async function getInvitationByEmail(
  email: string
): Promise<OrganizationInvitation | null> {
  const invitation = await prisma.organizationInvitation.findFirst({
    where: { email, status: 'PENDING' }
  });
  return invitation ? adaptInvitation(invitation) : null;
}

export async function createInvitation(data: {
  organizationId: string;
  email: string;
  invitedByUserId: string;
  roleType: 'ORGANIZER_OWNER' | 'ORGANIZER_STAFF';
}): Promise<OrganizationInvitation> {
  const invitation = await prisma.organizationInvitation.create({
    data: {
      organizationId: data.organizationId,
      email: data.email,
      invitedByUserId: data.invitedByUserId,
      roleType: data.roleType as InvitationRoleType
    }
  });
  return adaptInvitation(invitation);
}

export async function updateInvitation(
  id: string,
  data: { status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED'; retryCount?: number }
): Promise<OrganizationInvitation | null> {
  const invitation = await prisma.organizationInvitation.findUnique({ where: { id } });
  if (!invitation) return null;
  const updateData: Record<string, unknown> = {};
  if (data.status) updateData.status = data.status as InvitationStatus;
  if (data.retryCount !== undefined) {
    updateData.retryCount = data.retryCount;
    // Only update lastInvitationSentAt when actually resending (retryCount changes)
    updateData.lastInvitationSentAt = new Date();
  }
  const updated = await prisma.organizationInvitation.update({
    where: { id },
    data: updateData
  });
  return adaptInvitation(updated);
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const invitation = await prisma.organizationInvitation.findUnique({ where: { id } });
  if (!invitation) return false;
  await prisma.organizationInvitation.delete({ where: { id } });
  return true;
}
```

- [ ] **Step 3: Create invitations route**

`apps/backend/src/routes/invitations.ts`:
```typescript
import { Hono } from 'hono';
import * as invitationsService from '../services/invitations.service.js';

const invitations = new Hono();

invitations.get('/', async (c) => {
  const organizationId = c.req.query('organizationId');
  const email = c.req.query('email');
  if (organizationId) return c.json(await invitationsService.getInvitationsByOrganizationId(organizationId));
  if (email) {
    const invitation = await invitationsService.getInvitationByEmail(email);
    return c.json(invitation); // Returns null with 200 if no pending invitation found
  }
  return c.json({ error: 'organizationId or email query param is required' }, 400);
});

invitations.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.organizationId || !body.email || !body.invitedByUserId || !body.roleType) {
    return c.json({ error: 'organizationId, email, invitedByUserId, and roleType are required' }, 400);
  }
  const invitation = await invitationsService.createInvitation(body);
  return c.json(invitation, 201);
});

invitations.patch('/:id', async (c) => {
  const invitation = await invitationsService.updateInvitation(c.req.param('id'), await c.req.json());
  if (!invitation) return c.json({ error: 'Not found' }, 404);
  return c.json(invitation);
});

invitations.delete('/:id', async (c) => {
  const deleted = await invitationsService.deleteInvitation(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { invitations };
```

- [ ] **Step 4: Register route, verify, and commit**

Add to `apps/backend/src/routes/index.ts`:
```typescript
import { invitations } from './invitations.js';
// ... in registerRoutes:
app.route('/api/invitations', invitations);
```

Run: `cd apps/backend && npx tsc --noEmit`

```bash
git add apps/backend/src/adapters/invitations.adapter.ts apps/backend/src/services/invitations.service.ts apps/backend/src/routes/invitations.ts apps/backend/src/routes/index.ts
git commit -m "feat: add invitations CRUD API"
```

---

## Chunk 4: Final Verification

### Task 9: Final route aggregator + build + verification

- [ ] **Step 1: Verify final routes/index.ts has all routes**

`apps/backend/src/routes/index.ts` should look like:
```typescript
import { Hono } from 'hono';
import { health } from './health.js';
import { organizations } from './organizations.js';
import { categories } from './categories.js';
import { events } from './events.js';
import { races } from './races.js';
import { cyclists } from './cyclists.js';
import { raceResults } from './race-results.js';
import { organizers } from './organizers.js';
import { invitations } from './invitations.js';

export function registerRoutes(app: Hono) {
  app.route('/health', health);
  app.route('/api/organizations', organizations);
  app.route('/api/categories', categories);
  app.route('/api/events', events);
  app.route('/api/races', races);
  app.route('/api/cyclists', cyclists);
  app.route('/api/race-results', raceResults);
  app.route('/api/organizers', organizers);
  app.route('/api/invitations', invitations);
}
```

- [ ] **Step 2: Run turbo build**

Run from repo root:
```bash
npx turbo build
```
Expected: All packages build without errors.

- [ ] **Step 3: Run turbo check**

Run:
```bash
npx turbo check
```
Expected: TypeScript type checking passes for all packages.

- [ ] **Step 4: Start backend and test key endpoints**

Start backend, then verify:
```bash
# Health
curl http://localhost:3000/health
# Categories (seeded data)
curl http://localhost:3000/api/categories/age
curl http://localhost:3000/api/categories/gender
curl http://localhost:3000/api/categories/distance
# Organizations (may be empty)
curl http://localhost:3000/api/organizations
# 404 handling
curl http://localhost:3000/api/events/nonexistent-id
```

- [ ] **Step 5: Commit any final adjustments**

```bash
git add -A && git commit -m "fix: final Phase 2 adjustments"
```

---

## Success Criteria Checklist

- [ ] All 8 entity endpoints respond with correct HTTP status codes
- [ ] All responses use `@acs/shared` domain types (verified by adapter usage)
- [ ] Categories seeded data returns correctly via GET endpoints
- [ ] Business rule errors return ACS error codes (ACS01 for last owner, ACS02/ACS03 for categories)
- [ ] `turbo build` passes
- [ ] `turbo check` passes
- [ ] Health endpoint still works
