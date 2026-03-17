# Phase 3 Design: Authentication with BetterAuth

## Overview

Add authentication to the Hono backend using BetterAuth with email/password and magic link support. Integrate with the existing Prisma schema by extending the `User` model and adding BetterAuth-managed tables. Implement per-handler role and organization-based authorization checks mirroring the existing Supabase RLS policies.

## Architecture

### Auth Flow

```
Client → /api/auth/* (BetterAuth handles) → Session cookie
Client → /api/events (with cookie) → Session middleware → Route handler → Auth helper check → Service → Response
```

### New/Modified Files

```
apps/backend/src/
├── lib/
│   ├── prisma.ts              # existing
│   ├── auth.ts                # NEW: BetterAuth instance configuration
│   └── auth-helpers.ts        # NEW: requireAuth, requireRole, requireOrgMember, requireEventOrgMember
├── middleware/
│   ├── error-handler.ts       # existing
│   └── session.ts             # NEW: session middleware (populates c.user/c.session)
├── routes/
│   └── *.ts                   # MODIFY: add per-handler auth checks to write endpoints
├── services/
│   └── *.ts                   # existing (unchanged)
└── index.ts                   # MODIFY: mount /api/auth/*, add session middleware
```

## BetterAuth Configuration

### `auth.ts` — BetterAuth Instance

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
      console.log(`Password reset for ${user.email}: ${url}`);
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Placeholder — Resend integration in Phase 4
        console.log(`Magic link for ${email}: ${url}`);
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
          // Inject CYCLIST roleId before BetterAuth inserts the User row
          // This runs BEFORE the DB insert, so roleId is set at write time
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
          // Re-query user from Prisma to reliably access custom fields
          // (BetterAuth hook argument may not include additionalFields)
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

### Key Configuration Points

- **Prisma adapter** with `provider: 'postgresql'`
- **Email/password** enabled with placeholder `sendResetPassword`
- **Magic link plugin** with placeholder `sendMagicLink`
- **Additional user fields**: `firstName`, `lastName`, `roleId`, `status` — stored on the same `User` table
- **Database hooks**: `user.create.after` for auto-creating cyclist profiles on signup
- **Trusted origins**: frontend URL for CORS/cookie handling

## Session Middleware

### `session.ts` — Non-Blocking Session Middleware

Runs on every request. Populates `c.var.user` and `c.var.session` but does NOT block unauthenticated requests — that's the handler's responsibility via auth helpers.

```typescript
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', session?.user || null);
  c.set('session', session?.session || null);
  await next();
});
```

### Hono Context Typing

```typescript
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  }
}>();
```

## Auth Helpers

### `auth-helpers.ts` — Per-Handler Authorization

```typescript
getAuthUser(c)                         // Returns user or null
requireAuth(c)                         // Returns user or throws 401
requireRole(c, [RoleTypeEnum.ADMIN])   // Returns user or throws 401/403
requireOrgMember(c, organizationId)    // Verifies user has ORGANIZER_* role AND is in the org, or is admin. Else 403.
requireOrgOwner(c, organizationId)     // Verifies user has ORGANIZER_OWNER role AND is in the org, or is admin. Else 403.
requireEventOrgMember(c, eventId)      // Verifies user has ORGANIZER_* role AND is in the event's org, or is admin. Else 403.
```

**Important:** `requireOrgMember` checks both role type (must be ORGANIZER_OWNER or ORGANIZER_STAFF) AND organization membership via the `organizers` junction table. A CYCLIST who somehow has an organizer record would still be rejected because their `User.role` is not an ORGANIZER_* role. `requireOrgOwner` additionally enforces ORGANIZER_OWNER only (not STAFF).

These query Prisma to check organization membership and role, mirroring the Supabase `is_in_event_organization()`, `is_organizer()`, `is_organizer_owner()`, and `is_admin()` helper functions.

## Per-Handler Authorization Rules

Derived from the existing Supabase RLS policies. Public reads stay open, writes check role + organization ownership.

### Events (`/api/events`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/events` (public listing) | Public | Only `isPublicVisible=true` returned |
| `GET` | `/api/events?organizationId=x` | Public | — |
| `GET` | `/api/events/:id` | Public (visible) / Auth (org member sees all) | — |
| `POST` | `/api/events` | Auth | Must be organizer in specified org, or admin |
| `PATCH` | `/api/events/:id` | Auth | Must be in event's org, or admin |
| `DELETE` | `/api/events/:id` | Auth | Must be in event's org, or admin |

### Races (`/api/races`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/races?eventId=x` | Public (visible) / Auth (org member sees all) | — |
| `GET` | `/api/races/:id` | Public (visible) / Auth | — |
| `POST` | `/api/races` | Auth | Must be in event's org, or admin |
| `PATCH` | `/api/races/:id` | Auth | Must be in race's event org, or admin |
| `DELETE` | `/api/races/:id` | Auth | Must be in race's event org, or admin |

### Race Results (`/api/race-results`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/race-results?raceId=x` | Public (if race+event public) / Auth (org member) | — |
| `GET` | `/api/race-results?userId=x` | Public (visible only) | — |
| `POST` | `/api/race-results` | Auth | Must be in race's event org, or admin |
| `PATCH` | `/api/race-results/:id` | Auth | Must be in result's event org, or admin |
| `DELETE` | `/api/race-results/:id` | Auth | Must be in result's event org, or admin |

### Cyclists (`/api/cyclists`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/cyclists/:id` | Public | — |
| `POST` | `/api/cyclists` | Auth | Organizer in org (for unregistered cyclists) or admin |
| `PATCH` | `/api/cyclists/:id` | Auth | Own profile, or organizer who created the cyclist (via org), or admin |
| `DELETE` | `/api/cyclists/:id` | Auth | Organizer (unlinked cyclists created by their org only) or admin |

Note: `POST /api/cyclists` creates an unregistered cyclist (with a new `User` record with `status: UNREGISTERED` and no `Account`). This is used by organizers when adding race results for cyclists not yet in the system.

### Organizations (`/api/organizations`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/organizations` | Public | Only `ACTIVE` state returned for public; org members see own (any state); admin sees all |
| `GET` | `/api/organizations/:id` | Public (if ACTIVE) / Auth | — |
| `POST` | `/api/organizations` | Auth | Admin only |
| `PATCH` | `/api/organizations/:id` | Auth | Admin or org owner |
| `DELETE` | `/api/organizations/:id` | Auth | Admin only |

### Organizers (`/api/organizers`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/organizers?orgId=x` | Public | — |
| `GET` | `/api/organizers/count?orgId=x` | Public | — |
| `PATCH` | `/api/organizers/:id` | Auth | Admin or org owner (`requireOrgOwner`) |
| `DELETE` | `/api/organizers/:id` | Auth | Admin or org owner (`requireOrgOwner`, ACS01 protection) |

Note: `POST /api/organizers` is not needed — organizer creation is handled exclusively through the invitation flow (`POST /api/invitations` → magic link → `POST /api/auth/complete-organizer-setup`).

### Categories (`/api/categories`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/categories/*` | Public (global) / Auth (org members see org-scoped) | — |
| `POST` | `/api/categories/*` | Auth | Admin (global) or org owner (org-scoped) |
| `PATCH` | `/api/categories/*` | Auth | Admin (global) or org owner (org-scoped) |
| `DELETE` | `/api/categories/*` | Auth | Admin (global) or org owner (org-scoped, ACS02/ACS03) |

### Invitations (`/api/invitations`)

| Method | Path | Auth | Additional Check |
|--------|------|------|-----------------|
| `GET` | `/api/invitations?orgId=x` | Auth | Admin or linked org owner |
| `GET` | `/api/invitations?email=x` | Auth | Own email match, or admin |
| `POST` | `/api/invitations` | Auth | Admin or linked org owner (own org only) |
| `PATCH` | `/api/invitations/:id` | Auth | Admin, org owner, or invited user (accept only) |
| `DELETE` | `/api/invitations/:id` | Auth | Admin, org owner, or invited user (reject) |

## Prisma Schema Changes

### Modified: `User` Model

Add BetterAuth-required fields:
- `name` String? (optional — BetterAuth always writes non-null for auth users; null for unregistered users)
- `emailVerified` Boolean default `false`
- `image` String? (optional)
- Add relations: `sessions Session[]`, `accounts Account[]`

Change `firstName` to **optional** (`String?`) — magic link users don't provide `firstName` at creation time; they set it later in the complete-organizer-setup flow. The `user.create.before` hook injects `firstName` for standard signups.

Keep `email` as **optional** — unregistered cyclists (created by organizers) may not have an email. BetterAuth only manages users that authenticate (have an `Account` record).

Keep `name` as **optional** (`String?`) — unregistered users aren't created through BetterAuth. BetterAuth always writes a non-null `name` for auth-created users, so the nullable column is safe for BetterAuth's reads. Unregistered users (created by organizers directly via Prisma) will have `name = null`, but these users never go through BetterAuth's session system so no adapter conflict occurs.

### New: `Session` Model

```
id            String    PK
userId        String    FK → User
token         String    unique
expiresAt     DateTime
ipAddress     String?
userAgent     String?
createdAt     DateTime
updatedAt     DateTime
@@map("sessions")
```

### New: `Account` Model

```
id                      String    PK
userId                  String    FK → User
accountId               String
providerId              String
accessToken             String?
refreshToken            String?
accessTokenExpiresAt    DateTime?
refreshTokenExpiresAt   DateTime?
scope                   String?
idToken                 String?
password                String?   (hashed password for email/password auth)
createdAt               DateTime
updatedAt               DateTime
@@map("accounts")
```

### New: `Verification` Model

```
id          String    PK
identifier  String
value       String
expiresAt   DateTime
createdAt   DateTime
updatedAt   DateTime
@@map("verifications")
```

## Signup Flow

### Email/Password Signup (Cyclist — default)

1. Client calls `authClient.signUp.email({ email, password, name, firstName, lastName })`
2. `databaseHooks.user.create.before` hook fires:
   - Looks up CYCLIST role ID
   - Injects `roleId` and `status: ACTIVE` into the user data before DB insert
3. BetterAuth inserts `User` row (with `name`, `email`, `emailVerified: false`, `firstName`, `lastName`, `roleId`, `status`)
4. `databaseHooks.user.create.after` hook fires:
   - Re-queries user via Prisma to reliably get `roleId` (not relying on hook argument)
   - Creates `Cyclist` record linked to the user
5. BetterAuth creates `Account` (with hashed password, `providerId: 'credential'`)
6. BetterAuth creates `Session` and sets cookie
7. User is logged in

### Magic Link Invitation (Organizer)

1. Admin/owner calls `POST /api/invitations` → creates invitation record in DB
2. `POST /api/invitations` handler then calls `auth.api.signInMagicLink({ body: { email }, headers })` server-side to trigger BetterAuth's magic link generation
3. BetterAuth's `sendMagicLink` callback fires with the generated URL (placeholder console.log for now, Resend in Phase 4)
4. Invited user clicks link → BetterAuth verifies token, creates `User` + `Account` + `Session` (the `user.create.before` hook assigns CYCLIST role as default)
5. Frontend detects new user with pending invitation → redirects to `/auth/complete-setup`
6. User sets password + name on the setup page
7. User calls `POST /api/auth/complete-organizer-setup` which atomically:
   - Updates the user's `roleId` to ORGANIZER_OWNER or ORGANIZER_STAFF
   - Updates `firstName`, `lastName`, `name`
   - Creates `Organizer` record linking user to organization
   - Updates invitation status to `ACCEPTED`
   - Sets password via BetterAuth's `auth.api.setPassword()` or account update

### `POST /api/auth/complete-organizer-setup` Endpoint

This is a **custom endpoint** (not handled by BetterAuth) that completes the organizer invitation flow.

**Auth:** Authenticated user only (must have a valid session from the magic link)
**Body:** `{ firstName, lastName, password, invitationId }`
**Logic:**
1. Verify the authenticated user has a pending invitation matching `invitationId`
2. Look up the invitation to get `organizationId` and `roleType`
3. In a Prisma transaction:
   - Update `User`: set `firstName`, `lastName`, `name`, `roleId` (to the invitation's roleType)
   - Create `Organizer` record: `{ userId, organizationId }`
   - Update `OrganizationInvitation`: set `status: ACCEPTED`
   - Create a new `Account` record with `providerId: 'credential'` and hashed password. The magic link flow creates an account with `providerId: 'magic-link'` which is separate — password login requires a credential-type account. Hash the password using BetterAuth's scrypt hasher (`ctx.context.password.hash(password)`) and insert the credential `Account` via Prisma directly
4. Return the updated user

## Account Claiming (Architecture — Deferred Implementation)

For unregistered cyclists who later want to create an account:

**Approach:** Use a custom `/api/auth/claim-account` endpoint (not BetterAuth's standard signup) that:
1. Accepts `{ email, password, firstName, lastName }`
2. Looks up existing `User` with matching email and `status: UNREGISTERED`
3. If found: updates the user (`status: ACTIVE`, `name`, `firstName`, `lastName`, `emailVerified: false`), then creates an `Account` record with hashed password linked to the existing `User.id`, creates a `Session`, and returns session cookie
4. If not found: returns 404 (user should use standard signup instead)
5. Cyclist data is preserved since the `User.id` doesn't change

**Why not `databaseHooks.user.create.before`:** BetterAuth's before hook cannot abort user creation and substitute an existing record — it can only modify the data being inserted. The custom endpoint approach bypasses BetterAuth's signup entirely for this specific flow, directly managing the Prisma records.

**This flow is architecturally sound but implementation is deferred.**

## Environment Variables (New)

```
BETTER_AUTH_SECRET=<random-32-char-secret>
BETTER_AUTH_URL=http://localhost:3000
```

## Auth Routes

BetterAuth handles all auth endpoints automatically, mounted at `/api/auth/*`:

- `POST /api/auth/sign-up/email` — email/password signup
- `POST /api/auth/sign-in/email` — email/password login
- `POST /api/auth/sign-out` — logout
- `GET /api/auth/session` — get current session
- `POST /api/auth/forgot-password` — request password reset
- `POST /api/auth/reset-password` — reset password with token
- `POST /api/auth/magic-link/sign-in` — send magic link
- `GET /api/auth/magic-link/verify` — verify magic link token

## Phase 3 Success Criteria

1. Email/password signup creates user + cyclist + account + session
2. Email/password login returns session cookie
3. Session middleware populates user on authenticated requests
4. Protected endpoints return 401 for unauthenticated requests
5. Protected endpoints return 403 for unauthorized roles
6. Organization-scoped endpoints verify org membership
7. Public endpoints remain accessible without auth
8. Magic link flow generates token and logs user in on verification
9. `turbo build` and `turbo check` pass
10. Health endpoint still works

## Future Phases

- **Phase 4:** Email (Resend replaces placeholder callbacks)
- **Phase 5:** Frontend migration (auth client, login/signup pages, session handling)
