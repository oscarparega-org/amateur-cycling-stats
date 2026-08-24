## MODIFIED Requirements

### Requirement: Invitation creation

Admins SHALL invite owners or staff; an organization owner SHALL invite staff only. The system SHALL reject invitations for an email already registered as a user.

#### Scenario: Owner invites another owner

- **WHEN** an organization owner submits an owner invitation
- **THEN** the backend returns HTTP 403

#### Scenario: Invitation email already exists

- **WHEN** an authorized caller invites an email already registered in the system
- **THEN** creation is blocked with guidance to use a future membership-transfer flow

### Requirement: Organizer setup transaction

The organizer setup endpoint SHALL validate a pending invitation belonging to the authenticated email and atomically update the user, create organizer membership, accept the invitation, and create credential authentication when absent.

#### Scenario: Complete valid organizer setup

- **WHEN** the invitee submits a valid pending invitation, first name, last name, and a compliant password
- **THEN** all organizer setup changes commit together and any auto-created cyclist record is removed

#### Scenario: Setup transaction fails

- **WHEN** any organizer setup write fails
- **THEN** no partial role, organizer, invitation, or credential changes remain

## ADDED Requirements

### Requirement: Invitation resend

Admins and organization owners SHALL resend a pending invitation they may manage, generating a new magic link and incrementing delivery tracking.

#### Scenario: Resend pending invitation

- **WHEN** an authorized caller confirms resend
- **THEN** a new link is attempted and retry count plus last-sent time are updated only for the attempt

### Requirement: Invitation expiration deferred

The MVP SHALL not reject an otherwise pending invitation solely because of age or retry count.

#### Scenario: Accept an old pending invitation

- **WHEN** a pending invitation has no explicit expired status
- **THEN** its age and retry count alone do not block organizer setup
