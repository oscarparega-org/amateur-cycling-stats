# Phase 2 Design: Backend CRUD API

## Overview

Add RESTful CRUD API endpoints to the Hono backend for all entities, with a service layer and adapter layer that returns domain types from `@acs/shared`. No authentication — all endpoints are open (auth comes in Phase 3).

## Architecture

### Request Flow

```
HTTP Request → Route (validation, params) → Service (business logic, Prisma) → Adapter (Prisma→Domain) → JSON Response
```

### Backend Structure

```
apps/backend/src/
├── index.ts                       # Hono app entry (existing)
├── lib/
│   └── prisma.ts                  # Prisma client singleton (existing)
├── middleware/
│   └── error-handler.ts           # Global error handler (existing)
├── types/
│   └── env.ts                     # Environment types (existing)
├── adapters/
│   ├── events.adapter.ts          # Prisma Event → Domain Event
│   ├── races.adapter.ts           # Prisma Race → Domain Race
│   ├── race-results.adapter.ts    # Prisma RaceResult → Domain RaceResult (flat/denormalized)
│   ├── cyclists.adapter.ts        # Prisma Cyclist → Domain Cyclist
│   ├── organizations.adapter.ts   # Prisma Organization → Domain Organization
│   ├── organizers.adapter.ts      # Prisma Organizer → Domain Organizer (with user data)
│   ├── categories.adapter.ts      # Prisma RaceCategory* → Domain RaceCategory*
│   └── invitations.adapter.ts     # Prisma OrganizationInvitation → Domain OrganizationInvitation
├── routes/
│   ├── index.ts                   # Route aggregator (modify existing)
│   ├── health.ts                  # GET /health (existing)
│   ├── events.ts                  # /api/events
│   ├── races.ts                   # /api/races
│   ├── race-results.ts            # /api/race-results
│   ├── cyclists.ts                # /api/cyclists
│   ├── organizations.ts           # /api/organizations
│   ├── organizers.ts              # /api/organizers
│   ├── categories.ts              # /api/categories
│   └── invitations.ts             # /api/invitations
└── services/
    ├── events.service.ts
    ├── races.service.ts
    ├── race-results.service.ts
    ├── cyclists.service.ts
    ├── organizations.service.ts
    ├── organizers.service.ts
    ├── categories.service.ts
    └── invitations.service.ts
```

## Adapter Layer

Adapters transform Prisma query results into `@acs/shared` domain types. This is the single point of Prisma→Domain conversion.

**Key transformations:**
- `DateTime` objects → ISO 8601 strings
- Flattening related data (e.g., `RaceResult` includes event/race/category names)
- Ensuring return shape exactly matches `@acs/shared` interfaces
- No renaming needed — Prisma `@map` annotations already provide camelCase fields

**Pattern:**
```typescript
// adapters/events.adapter.ts
import type { Event } from '@acs/shared';

export function adaptEvent(prismaEvent: PrismaEventWithRelations): Event {
  return {
    id: prismaEvent.id,
    name: prismaEvent.name,
    description: prismaEvent.description,
    dateTime: prismaEvent.dateTime.toISOString(),
    year: prismaEvent.year,
    city: prismaEvent.city,
    state: prismaEvent.state,
    country: prismaEvent.country,
    eventStatus: prismaEvent.eventStatus,
    organizationId: prismaEvent.organizationId,
    createdBy: prismaEvent.createdBy,
    isPublicVisible: prismaEvent.isPublicVisible,
    createdAt: prismaEvent.createdAt.toISOString(),
    updatedAt: prismaEvent.updatedAt.toISOString()
  };
}
```

**Adapter files and their domain type targets:**

| Adapter | Prisma Source | Domain Type (`@acs/shared`) |
|---------|-------------|---------------------------|
| `events.adapter.ts` | `Event` (+ races) | `Event` |
| `races.adapter.ts` | `Race` (+ categories) | `Race` |
| `race-results.adapter.ts` | `RaceResult` (+ race + event + categories) | `RaceResult` (flat denormalized) |
| `cyclists.adapter.ts` | `Cyclist` (+ user + gender) | `Cyclist` |
| `organizations.adapter.ts` | `Organization` (+ event count) | `Organization` |
| `organizers.adapter.ts` | `Organizer` (+ `user` include with `role` for name/email/roleType) | `Organizer` |
| `categories.adapter.ts` | Prisma models: `RaceCategory` → `RaceCategoryAge`, `RaceCategoryGender` → `RaceCategoryGender`, `RaceCategoryLength` → `RaceCategoryDistance` | `RaceCategoryAge`, `RaceCategoryGender`, `RaceCategoryDistance` |
| `invitations.adapter.ts` | `OrganizationInvitation` (has `invited_by_user_id` FK in Prisma schema) | `OrganizationInvitation` (includes `invitedByUserId`) |

## Service Layer

Services encapsulate business logic and Prisma queries. They use adapters to return domain types.

**Conventions:**
- Services return domain types (from `@acs/shared`), never raw Prisma objects
- Return `null` for expected not-found cases
- Throw errors for business rule violations (with ACS error codes)
- Each service function is a standalone export (no classes)

## API Endpoints

All API routes prefixed with `/api/`. Health stays at `/health`.

### Events (`/api/events`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/events` | `type=future` | Future public visible events | `getFutureEvents()` |
| `GET` | `/api/events` | `type=past&year=2025` | Past events, optional year filter | `getPastEvents(year?)` |
| `GET` | `/api/events` | `organizationId=xxx&filter=all\|future\|past` | Events by organization with optional time filter (defaults to `all`) | `getEventsByOrganization(orgId, filter?)` |
| `GET` | `/api/events/:id` | — | Event with races | `getEventById(id)` |
| `POST` | `/api/events` | — | Create event | `createEvent(data)` |
| `PATCH` | `/api/events/:id` | — | Update event | `updateEvent(id, data)` |
| `DELETE` | `/api/events/:id` | — | Delete event | `deleteEvent(id)` |

### Races (`/api/races`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/races` | `eventId=xxx` | Races by event | `getRacesByEventId(eventId)` |
| `GET` | `/api/races/:id` | — | Race with results | `getRaceById(id)` |
| `POST` | `/api/races` | — | Create race | `createRace(data)` |
| `PATCH` | `/api/races/:id` | — | Update race | `updateRace(id, data)` |
| `DELETE` | `/api/races/:id` | — | Delete race | `deleteRace(id)` |

### Race Results (`/api/race-results`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/race-results` | `raceId=xxx` | Results by race (full denormalized `RaceResult`) | `getRaceResultsByRaceId(raceId)` |
| `GET` | `/api/race-results` | `userId=xxx` | Results by user (full denormalized `RaceResult`) | `getRaceResultsByUserId(userId)` |
| `POST` | `/api/race-results` | — | Create result | `createRaceResult(data)` |
| `PATCH` | `/api/race-results/:id` | — | Update result | `updateRaceResult(id, data)` |
| `DELETE` | `/api/race-results/:id` | — | Delete result | `deleteRaceResult(id)` |

### Cyclists (`/api/cyclists`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/cyclists/:id` | — | Cyclist by ID | `getCyclistById(id)` |

### Organizations (`/api/organizations`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/organizations` | — | All organizations | `getAllOrganizations()` |
| `GET` | `/api/organizations/:id` | — | Organization by ID | `getOrganizationById(id)` |
| `POST` | `/api/organizations` | — | Create organization | `createOrganization(data)` |
| `PATCH` | `/api/organizations/:id` | — | Update organization | `updateOrganization(id, data)` |
| `DELETE` | `/api/organizations/:id` | — | Permanently delete | `deleteOrganization(id)` |

### Organizers (`/api/organizers`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/organizers` | `organizationId=xxx` | Organizers by organization (includes user name, email, role) | `getOrganizersByOrganizationId(orgId)` |
| `GET` | `/api/organizers/count` | `organizationId=xxx` | Count by organization | `getOrganizersCountByOrganizationId(orgId)` |
| `PATCH` | `/api/organizers/:id` | — | Update organizer. Note: `firstName`/`lastName` are stored on `User`, `roleType` is via `User.roleId` → `Role`. Service must update across models in a transaction. | `updateOrganizer(id, data)` |
| `DELETE` | `/api/organizers/:id` | — | Remove organizer | `deleteOrganizer(id)` |

### Categories (`/api/categories`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/categories/age` | `organizationId=xxx (optional)` | Age categories (global + org) | `getAgeCategories(orgId?)` |
| `GET` | `/api/categories/gender` | `organizationId=xxx (optional)` | Gender categories | `getGenderCategories(orgId?)` |
| `GET` | `/api/categories/distance` | `organizationId=xxx (optional)` | Distance categories | `getDistanceCategories(orgId?)` |
| `POST` | `/api/categories/age` | — | Create age category | `createAgeCategory(data)` |
| `POST` | `/api/categories/gender` | — | Create gender category | `createGenderCategory(data)` |
| `POST` | `/api/categories/distance` | — | Create distance category | `createDistanceCategory(data)` |
| `PATCH` | `/api/categories/age/:id` | — | Update age category | `updateAgeCategory(id, data)` |
| `PATCH` | `/api/categories/gender/:id` | — | Update gender category | `updateGenderCategory(id, data)` |
| `PATCH` | `/api/categories/distance/:id` | — | Update distance category | `updateDistanceCategory(id, data)` |
| `DELETE` | `/api/categories/age/:id` | — | Delete age category | `deleteAgeCategory(id)` |
| `DELETE` | `/api/categories/gender/:id` | — | Delete gender category | `deleteGenderCategory(id)` |
| `DELETE` | `/api/categories/distance/:id` | — | Delete distance category | `deleteDistanceCategory(id)` |

### Invitations (`/api/invitations`)

| Method | Path | Query Params | Description | Service Function |
|--------|------|-------------|-------------|-----------------|
| `GET` | `/api/invitations` | `organizationId=xxx` | All invitations for organization (all statuses) → `OrganizationInvitation[]` | `getInvitationsByOrganizationId(orgId)` |
| `GET` | `/api/invitations` | `email=xxx` | Single pending invitation by email → `OrganizationInvitation \| null` | `getInvitationByEmail(email)` |
| `POST` | `/api/invitations` | — | Create invitation | `createInvitation(data)` |
| `PATCH` | `/api/invitations/:id` | — | Update invitation status | `updateInvitation(id, data)` |
| `DELETE` | `/api/invitations/:id` | — | Delete invitation | `deleteInvitation(id)` |

## Response Format

**Single entity:**
```json
GET /api/events/123 → { "id": "...", "name": "...", "dateTime": "...", ... }
```

**List:**
```json
GET /api/events?type=future → [{ "id": "...", ... }, { "id": "...", ... }]
```

**Error:**
```json
GET /api/events/nonexistent → { "error": "Not found" } (404)
```

**Business rule error:**
```json
DELETE /api/organizers/123 → { "error": "Cannot delete last owner", "code": "ACS01" } (409)
```

## Error Handling

| Scenario | HTTP Status | Response Body |
|----------|------------|---------------|
| Resource not found | 404 | `{ "error": "Not found" }` |
| Validation error (missing/invalid field) | 400 | `{ "error": "field is required" }` |
| Business rule violation (ACS01-04) | 409 | `{ "error": "description", "code": "ACS01" }` |
| Prisma unique constraint violation | 409 | `{ "error": "Resource already exists" }` |
| Unexpected error | 500 | `{ "error": "Internal server error" }` |

### Custom Error Codes

- `ACS01` — `CANNOT_DELETE_LAST_OWNER`: Thrown when deleting the last organizer owner of an organization
- `ACS02` — `CATEGORY_IN_USE`: Category cannot be deleted because it's referenced by races
- `ACS03` — `PROTECTED_CATEGORY`: Default/system categories cannot be deleted
- `ACS04` — `DUPLICATE_RACE_COMBINATION`: Race with same category combination already exists in event (handled by Prisma unique constraint)

## Prisma Includes for Related Data

Key queries that need related data:

- **`getEventById`** — includes `races` with category age, gender, distance names
- **`getRaceById`** — includes `results` with cyclist user data
- **`getRaceResultsByRaceId`** — includes `race` (with `event` and all three category models: `categoryAge`, `categoryGender`, `categoryDistance`), `cyclist` (with `user`) for full denormalized `RaceResult`
- **`getRaceResultsByUserId`** — same includes as above: `race` (with `event` and all three categories), `cyclist` (with `user`) for full denormalized `RaceResult`
- **`getCyclistById`** — includes user (for name/email) and gender (for gender name)
- **`getOrganizersByOrganizationId`** — includes `user` (with `role`) for name, email, and roleType
- **`getAllOrganizations`** — includes `_count.events` for `eventCount`

## Authentication

No authentication in Phase 2. All endpoints are open. Auth middleware will be added in Phase 3 (BetterAuth), wrapping protected routes without modifying service logic.

## Phase 2 Success Criteria

1. All endpoints return correct data with proper HTTP status codes
2. All domain types from `@acs/shared` are used as response types
3. Adapters correctly transform Prisma objects to domain types
4. Business rule errors return appropriate ACS error codes
5. `turbo build` and `turbo check` pass with no errors
6. Health endpoint still works

## Future Phases

- **Phase 3:** Authentication (BetterAuth — email/password, magic links, role-based middleware)
- **Phase 4:** Email (Resend integration, invitation templates)
- **Phase 5:** Frontend migration (replace Supabase calls with API calls, keep UI identical)
