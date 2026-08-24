# Cyclist and Results Specification

## Purpose

Define the current cyclist-profile and race-result API behavior.

## Requirements

### Requirement: Public cyclist detail

The API SHALL publicly return a cyclist by ID with linked identity, role, status, gender, and birth-year information.

#### Scenario: Cyclist does not exist

- **WHEN** a caller requests an unknown cyclist ID
- **THEN** the backend returns HTTP 404

### Requirement: Unregistered cyclist creation

Admins, organizer owners, and organizer staff SHALL create an unregistered cyclist with a required first name.

#### Scenario: Organizer creates an unregistered cyclist

- **WHEN** an authorized organizer supplies a first name and optional profile details
- **THEN** the system atomically creates an `UNREGISTERED` user with the `CYCLIST` role and a linked cyclist record

### Requirement: Cyclist updates

An authenticated cyclist SHALL update their own profile; admins and organizers SHALL update other cyclist profiles.

#### Scenario: Cyclist updates another profile

- **WHEN** a cyclist attempts to patch a cyclist record linked to another user
- **THEN** the backend returns HTTP 403

### Requirement: Cyclist deletion

Admins and organizers SHALL delete cyclist records; the current endpoint does not independently enforce the documented “unlinked only” comment.

#### Scenario: Authorized caller deletes a cyclist

- **WHEN** the cyclist exists and database constraints permit deletion
- **THEN** the API returns `{ "success": true }`

### Requirement: Public result reads

The API SHALL publicly list results by race ID or by cyclist user ID and SHALL require one of those query parameters.

#### Scenario: Read race results

- **WHEN** a caller supplies a race ID
- **THEN** results are returned ordered by finishing place ascending with denormalized event, race, and category details

### Requirement: Unique cyclist result

A cyclist SHALL have at most one result per race.

#### Scenario: Create a duplicate result

- **WHEN** an authorized caller creates a second result for the same cyclist and race
- **THEN** the backend returns HTTP 409

### Requirement: Result write authorization

Admins or organizers belonging to the result race's event organization SHALL create, update, or delete results.

#### Scenario: Unauthorized organizer edits a result

- **WHEN** an organizer does not belong to the associated event organization
- **THEN** the backend returns HTTP 403
