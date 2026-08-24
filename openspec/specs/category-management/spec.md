# Category Management Specification

## Purpose

Define the current global and organization-scoped race-category API.

## Requirements

### Requirement: Category types

The system SHALL manage age, gender, and distance race categories as distinct resources with shared scope and protection behavior.

#### Scenario: Read a category type

- **WHEN** a caller requests an age, gender, or distance category collection
- **THEN** the API returns that category type ordered by name

### Requirement: Category read scope

Category reads without `organizationId` SHALL return global categories; reads with `organizationId` SHALL return global categories plus categories belonging to that organization.

#### Scenario: Organization category lookup

- **WHEN** a caller supplies an organization ID
- **THEN** categories belonging to other organizations are excluded

### Requirement: Category write authorization

Only admins SHALL create or modify global categories; admins or the target organization's owner SHALL create or modify organization categories.

#### Scenario: Staff writes an organization category

- **WHEN** an organizer staff member attempts an organization-category write
- **THEN** the backend returns HTTP 403

### Requirement: Category creation scope

A category created without `organizationId` SHALL be global; one created with `organizationId` SHALL belong to that organization and SHALL not be global.

#### Scenario: Create an organization age category

- **WHEN** an authorized caller supplies a name and organization ID
- **THEN** the category is stored with `isGlobal: false`, `isDefault: false`, and the target organization ID

### Requirement: Required category name

All category creation operations SHALL require a non-empty name.

#### Scenario: Name is omitted

- **WHEN** a caller creates a category without a name
- **THEN** the backend returns HTTP 400

### Requirement: Protected default categories

Default categories SHALL not be deleted.

#### Scenario: Delete a default category

- **WHEN** an authorized caller attempts to delete a category with `isDefault: true`
- **THEN** the backend returns HTTP 409 with error code `ACS03`

### Requirement: Categories in use

Categories referenced by a race SHALL not be deleted.

#### Scenario: Delete a referenced category

- **WHEN** an authorized caller attempts to delete a category used by at least one race
- **THEN** the backend returns HTTP 409 with error code `ACS02`
