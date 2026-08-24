# Organization Management Specification

## Purpose

Define the current organization and organizer API behavior.

## Requirements

### Requirement: Public organization reads

The API SHALL allow unauthenticated callers to list organizations and retrieve an organization by ID, including its event count when available.

#### Scenario: List organizations

- **WHEN** a caller requests `GET /api/organizations`
- **THEN** organizations are returned in ascending name order

### Requirement: Organization creation and deletion

Only an admin SHALL create or delete an organization.

#### Scenario: Non-admin attempts organization creation

- **WHEN** an authenticated non-admin posts an organization
- **THEN** the backend returns HTTP 403

### Requirement: Organization updates

An admin or owner of the target organization SHALL be able to update its name, description, or state.

#### Scenario: Organization owner updates their organization

- **WHEN** an owner patches the organization to which they belong
- **THEN** the persisted organization and its timestamps are returned

### Requirement: Current organization default state

New organizations SHALL currently default to `ACTIVE` unless an explicit supported state is provided.

#### Scenario: Admin omits state during creation

- **WHEN** an admin creates an organization with a name and no state
- **THEN** the organization is stored with state `ACTIVE`

### Requirement: Organizer reads

The API SHALL publicly list organizers and organizer counts for a specified organization.

#### Scenario: Organization identifier is missing

- **WHEN** an organizer list or count request omits `organizationId`
- **THEN** the backend returns HTTP 400

### Requirement: Organizer maintenance

Admins and organization owners SHALL update or delete organizers in the target organization.

#### Scenario: Update organizer details

- **WHEN** an authorized caller changes an organizer's name or role type
- **THEN** the linked user record and role assignment are updated atomically

### Requirement: Last-owner protection

The system SHALL prevent deletion of the last `ORGANIZER_OWNER` in an organization.

#### Scenario: Delete the only owner

- **WHEN** an authorized caller deletes an owner and no other owner exists
- **THEN** the backend returns HTTP 409 with error code `ACS01`
