## Why

The backend has organization, organizer, invitation, and authentication primitives, but it does not yet implement the complete onboarding and member-management lifecycle described by the product documentation. Completing that lifecycle gives admins and owners a coherent, safe way to activate organizations and manage owner/staff membership.

## What Changes

- Create organizations in an inactive state and make activation/deactivation explicit admin actions.
- Add role-aware member list, detail, invite, edit, resend, and delete workflows for admins and organization owners.
- Complete invitation acceptance as an atomic organizer-account setup flow while keeping invitation expiration deferred for the MVP.
- Enforce owner/staff permission differences and protect the last organization owner.
- Add clear validation, empty states, confirmation dialogs, and success/error feedback.

## Non-Goals

- Invitation expiration, automatic organization disabling, account merging, and multi-organization organizer accounts.
- Reintroducing Supabase Auth, RPC functions, or SvelteKit form actions.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `organization-management`: Add inactive onboarding, lifecycle controls, and complete member administration.
- `invitation-and-email`: Add resend and acceptance workflows with explicit role and status rules.
- `identity-and-access`: Define organizer-account conversion and owner/staff authorization behavior.

## Impact

This affects organization defaults, organizer and invitation APIs/services, Better Auth setup, transactional email, Prisma constraints/migrations, shared types, and new Next.js admin/organizer screens.

## Legacy provenance

- `archive/svelte-supabase-v1/specs/001-org-members-management/`
- `archive/svelte-supabase-v1/documentation/business/02-USER_ROLES.md`
- `archive/svelte-supabase-v1/documentation/business/04-BUSINESS_RULES.md`
- `docs/superpowers/specs/2026-03-16-phase3-authentication-design.md`
- Archive snapshot `2b96361`; adapted to the current Better Auth/Hono/Prisma stack.
