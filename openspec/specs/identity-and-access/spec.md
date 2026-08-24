# Identity and Access Specification

## Purpose

Define the current authentication, session, role, and organization-access behavior.

## Requirements

### Requirement: Authentication methods

The backend SHALL support Better Auth email/password authentication, password-reset email delivery, and magic-link authentication.

#### Scenario: Request a magic link

- **WHEN** Better Auth receives a valid magic-link sign-in request
- **THEN** it invokes the configured email delivery flow for that address

### Requirement: Default cyclist identity

The system SHALL assign the `CYCLIST` role to a newly created user that has no explicit role and SHALL create a linked cyclist profile.

#### Scenario: Create a regular account

- **WHEN** Better Auth creates a user without an organizer or admin role
- **THEN** the user receives the `CYCLIST` role and a cyclist record is created

### Requirement: Session context

The backend SHALL resolve a request session without requiring authentication for every endpoint and SHALL make an authenticated user available to authorization helpers.

#### Scenario: Access an endpoint requiring authentication

- **WHEN** no authenticated user exists in request context
- **THEN** the authorization helper rejects the request with HTTP 401

### Requirement: Role authorization

The backend SHALL authorize role-restricted operations using the persisted role associated with the authenticated user.

#### Scenario: User lacks an allowed role

- **WHEN** an authenticated user calls a role-restricted operation without an accepted role
- **THEN** the backend returns HTTP 403

### Requirement: Organization authorization

Admins SHALL bypass organization membership checks; organizer owners and staff SHALL be limited to organizations with a matching organizer membership.

#### Scenario: Organizer accesses another organization

- **WHEN** an organizer calls an organization-member operation for an organization to which they do not belong
- **THEN** the backend returns HTTP 403

### Requirement: Owner-only organization authorization

Operations requiring organization ownership SHALL permit admins or an `ORGANIZER_OWNER` linked to the organization and SHALL reject staff.

#### Scenario: Staff performs an owner operation

- **WHEN** an `ORGANIZER_STAFF` user calls an owner-only operation
- **THEN** the backend returns HTTP 403

### Requirement: Event organization authorization

Event write authorization SHALL resolve the event's organization and permit admins or organizers belonging to that organization.

#### Scenario: Authorized organizer updates an event resource

- **WHEN** an organizer belongs to the event's organization
- **THEN** the organizer may perform event-member write operations
