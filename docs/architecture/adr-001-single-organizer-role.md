# ADR-001: Use one organization-scoped organizer role

## Status

Accepted

## Context

The application modeled organizers as `ORGANIZER_OWNER` or `ORGANIZER_STAFF`, while authorization also depended on an `Organizer` membership linking a user to an organization. The product no longer needs different organizer privilege levels.

## Decision

Replace both organizer roles with `ORGANIZER`. All organizers have the same permissions, but those permissions remain scoped to organizations represented by their `Organizer` memberships. Administrators retain their global bypass. Invitations always create organizers and no longer accept a role choice.

Existing owner and staff users are migrated to `ORGANIZER`. The last organizer in an organization remains protected from deletion so the organization cannot be left unmanaged.

## Alternatives considered

- Keep owner and staff roles: preserves finer-grained authorization but retains product complexity that is no longer required.
- Store ownership on the membership: supports a future per-organization permission model, but adds an unused distinction now.

## Consequences

- Organizer authorization and invitation flows are simpler.
- Every organizer can manage their organization, including invitations and other organizer memberships.
- Reintroducing privilege levels later should use organization-membership permissions rather than a global user role, because a user can belong to multiple organizations.
