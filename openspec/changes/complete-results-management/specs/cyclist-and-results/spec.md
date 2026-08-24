## MODIFIED Requirements

### Requirement: Public result reads

The API SHALL publicly list results only when the associated event and race are publicly eligible; admins and organization members SHALL read managed results regardless of public visibility.

#### Scenario: Public reads hidden-race results

- **WHEN** a caller requests results for a hidden race
- **THEN** the API does not disclose the results

### Requirement: Result write authorization

Admins or organizers belonging to the result race's event organization SHALL create, update, or delete results through event- and race-scoped management operations.

#### Scenario: Authorized organizer enters results

- **WHEN** an organizer belongs to the event organization and submits valid result rows
- **THEN** the system persists them and returns the updated ordered result set

## ADDED Requirements

### Requirement: Result validation

Each result SHALL require a positive integer place, a cyclist registered or otherwise eligible for the race, and an optional time value in the accepted race-time format.

#### Scenario: Invalid place submitted

- **WHEN** a result has a missing, zero, negative, or non-integer place
- **THEN** the backend rejects it with field-level validation

### Requirement: Result management interface

Admins and organizers SHALL manage results from an event race with accessible add, edit, and delete controls and deterministic place ordering.

#### Scenario: Race has no results

- **WHEN** an authorized user opens an empty result list
- **THEN** the interface shows an empty state and an Enter Results action

### Requirement: Public event results

Public event detail SHALL group visible results by race and present place, cyclist identity, time, and category context.

#### Scenario: Event has multiple visible races

- **WHEN** a public user opens event results
- **THEN** each visible race has a distinct ordered result section

### Requirement: Cyclist result history

The system SHALL present a cyclist's eligible results most recent first with event, race, category, place, time, and future ranking context.

#### Scenario: Cyclist has no public history

- **WHEN** no eligible result exists
- **THEN** the profile displays a non-error empty state
