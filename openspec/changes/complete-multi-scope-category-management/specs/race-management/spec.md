## ADDED Requirements

### Requirement: Three-scope category selection

Race create and edit forms SHALL display Global, Organization, and Event columns for each category type, with one shared selection group per type.

#### Scenario: Select an event category

- **WHEN** an event has an event-scoped category
- **THEN** the user can select it as the single age, gender, or distance value for the race

#### Scenario: Event scope is empty

- **WHEN** an event has no categories of a type
- **THEN** the Event column displays an explicit empty state without disabling global or organization choices

### Requirement: Category ownership compatibility

A race SHALL reference only a global category, a category belonging to its event's organization, or a category belonging to the event itself.

#### Scenario: Submit another organization's category

- **WHEN** race input references a category owned by another organization
- **THEN** the backend rejects the race write even if the category ID exists
