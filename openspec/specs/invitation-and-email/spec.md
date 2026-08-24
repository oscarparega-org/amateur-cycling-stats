# Invitation and Email Specification

## Purpose

Define the current organization invitation, organizer setup, and transactional email behavior.

## Requirements

### Requirement: Invitation creation

Admins and organization owners SHALL create invitations for `ORGANIZER_OWNER` or `ORGANIZER_STAFF` recipients in organizations they may manage.

#### Scenario: Create an invitation

- **WHEN** an authorized caller supplies organization, email, inviter, and role type
- **THEN** a pending invitation is persisted and the system attempts to send a branded magic-link email

### Requirement: Durable invitation on delivery failure

An invitation SHALL remain persisted when magic-link delivery fails so it can be retried later.

#### Scenario: Email provider call fails

- **WHEN** invitation creation succeeds but magic-link delivery throws an error
- **THEN** the API still returns the created invitation and records the delivery failure in server logs

### Requirement: Invitation queries

Organization owners and admins SHALL list invitations for a managed organization; an authenticated user SHALL query a pending invitation for their own email.

#### Scenario: User queries another email

- **WHEN** a non-admin requests an invitation for an email different from their session email
- **THEN** the backend returns HTTP 403

### Requirement: Invitation mutation permissions

Admins, owners of the invitation's organization, and the invited authenticated user SHALL update or delete the invitation.

#### Scenario: Unrelated user mutates an invitation

- **WHEN** an authenticated user is neither an admin, organization owner, nor the matching invitee
- **THEN** the backend returns HTTP 403

### Requirement: Organizer setup transaction

The organizer setup endpoint SHALL validate a pending invitation belonging to the authenticated email and atomically update the user, create organizer membership, accept the invitation, and create credential authentication when absent.

#### Scenario: Complete valid organizer setup

- **WHEN** the invitee submits first name, last name, password, and their pending invitation ID
- **THEN** their role and profile are updated, organizer membership is created, the invitation becomes accepted, and any auto-created cyclist record is removed

### Requirement: Email provider behavior

The system SHALL use Resend when `RESEND_API_KEY` is configured and SHALL log email details as a development fallback when it is absent.

#### Scenario: Development has no provider key

- **WHEN** the system sends an email without a configured Resend API key
- **THEN** it logs the recipient, subject, and body without calling the provider
