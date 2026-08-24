# Race Management Specification

## Purpose

Define the current race API, category combination, and event authorization behavior.

## Requirements

### Requirement: Public race reads

The API SHALL publicly list races for a required event ID and retrieve a race by ID with human-readable category names.

#### Scenario: Event ID is omitted

- **WHEN** a caller requests the race collection without `eventId`
- **THEN** the backend returns HTTP 400

### Requirement: Race category combination

Every race SHALL reference exactly one age category, one gender category, and one distance category.

#### Scenario: Create an incomplete race

- **WHEN** a caller omits any required category identifier, event identifier, or race date
- **THEN** the backend returns HTTP 400

### Requirement: Unique event combination

The same age, gender, and distance category combination SHALL occur at most once within an event.

#### Scenario: Create a duplicate combination

- **WHEN** a caller creates a race whose category combination already exists in the event
- **THEN** the backend returns HTTP 409 with error code `ACS04`

### Requirement: Race write authorization

Only admins or organizers belonging to the race event's organization SHALL create, update, or delete races.

#### Scenario: Organizer creates a race for another organization

- **WHEN** an organizer posts a race for an event outside their organization
- **THEN** the backend returns HTTP 403

### Requirement: Race ordering

Races listed for an event SHALL be ordered by race date and time ascending.

#### Scenario: Event has multiple races

- **WHEN** the event's races are requested
- **THEN** earlier race times appear before later race times

### Requirement: Race visibility storage

Each race SHALL store a public-visibility flag independently from its event, defaulting currently to hidden.

#### Scenario: Create a race without visibility

- **WHEN** an authorized caller omits `isPublicVisible`
- **THEN** the race is stored with `isPublicVisible: false`

### Requirement: Current race deletion

An authorized caller SHALL delete a race through `DELETE /api/races/:id`; database referential constraints determine whether related records permit the deletion.

#### Scenario: Delete an existing unreferenced race

- **WHEN** an authorized caller deletes a race that the database permits removing
- **THEN** the API returns `{ "success": true }`
