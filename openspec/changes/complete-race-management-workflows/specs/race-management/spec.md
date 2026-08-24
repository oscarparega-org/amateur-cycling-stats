## MODIFIED Requirements

### Requirement: Race visibility storage

Each race SHALL store visibility independently from its event, SHALL default to public, and SHALL be publicly retrievable only when both race and event visibility/lifecycle permit it.

#### Scenario: Create a race without visibility

- **WHEN** an authorized caller creates a race without specifying visibility
- **THEN** the race is stored as public

### Requirement: Current race deletion

An authorized caller SHALL delete a race only after confirmation; deletion SHALL atomically remove all associated results and return the deleted result count for user feedback.

#### Scenario: Delete race with results

- **WHEN** an authorized user confirms deletion after being shown the result count
- **THEN** the race and all its results are deleted in one transaction

## ADDED Requirements

### Requirement: Race management navigation

Admin and organizer event detail pages SHALL expose a Races tab with consistent list, detail, create, edit, visibility, and delete experiences.

#### Scenario: Event has no races

- **WHEN** an authorized user opens the Races tab for an empty event
- **THEN** the interface shows an empty state and a Create Race action

### Requirement: Generated race name

The system SHALL generate a race name from the selected age, gender, and distance category names and SHALL regenerate it when the combination changes.

#### Scenario: Select all categories

- **WHEN** a user selects one category of each type
- **THEN** the form previews and saves `<Age> - <Gender> - <Distance>`

### Requirement: Race form behavior

Create and edit forms SHALL require one category of each type, show current selections during edit, and validate combination uniqueness excluding the edited race.

#### Scenario: Edit to a duplicate combination

- **WHEN** an edit selects a combination used by another race in the event
- **THEN** the API returns a conflict and preserves the original race

### Requirement: Race visibility action

Authorized users SHALL toggle race visibility only after a confirmation explaining public-access impact.

#### Scenario: Hide a public race

- **WHEN** an authorized user confirms hiding the race
- **THEN** public users can no longer access it while admins and organization members retain access

### Requirement: Race detail

Race detail SHALL present generated name, all category names, visibility, date/time, description, and timestamps as read-only data with permitted actions in the toolbar.

#### Scenario: Open race detail

- **WHEN** an authorized user selects a race row
- **THEN** the event-scoped detail view shows human-readable category values and allowed actions
