## ADDED Requirements

### Requirement: Registration cyclist resolution

Organizer registration SHALL allow selection of an existing cyclist or atomic creation of an unregistered cyclist before enrollment.

#### Scenario: Register a new cyclist

- **WHEN** an organizer supplies valid new-cyclist details with event registration data
- **THEN** cyclist creation and registration either both succeed or both roll back

### Requirement: Registration-aware result eligibility

After registration is implemented, result entry SHALL accept only cyclists assigned to the result's race unless an audited administrative override is explicitly added.

#### Scenario: Result cyclist is not assigned

- **WHEN** an organizer enters a result for a cyclist not assigned to the race
- **THEN** the backend rejects the result
