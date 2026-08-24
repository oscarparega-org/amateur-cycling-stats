## ADDED Requirements

### Requirement: Event enrollment

Authorized organization members SHALL enroll a new or existing cyclist in an event and SHALL prevent duplicate active enrollment for the same cyclist and event.

#### Scenario: Existing cyclist is enrolled

- **WHEN** an organizer selects an existing cyclist and confirms a valid event registration
- **THEN** one event registration is created for that cyclist

### Requirement: Race assignment

An event registration SHALL support assignment to one or more races in that event for which the cyclist is eligible.

#### Scenario: Assign race from another event

- **WHEN** registration input references a race outside the registered event
- **THEN** the backend rejects the assignment

### Requirement: Eligibility

Race assignment SHALL validate event/race availability and applicable age and gender category rules.

#### Scenario: Cyclist does not match category

- **WHEN** the cyclist's known age or gender conflicts with a restricted race category
- **THEN** assignment is rejected with an explainable eligibility reason

### Requirement: Registration states

Registrations SHALL distinguish at least preregistered and confirmed participation without implying payment state.

#### Scenario: Organizer confirms participation

- **WHEN** a valid preregistration is confirmed
- **THEN** its state changes without creating a duplicate registration

### Requirement: Organization authorization

Only admins or organizers belonging to the event organization SHALL create or manage registrations for that event.

#### Scenario: Organizer targets another organization

- **WHEN** an organizer attempts to register a cyclist in another organization's event
- **THEN** the backend returns HTTP 403

### Requirement: Registration auditability

Registration and race-assignment records SHALL retain stable identifiers and timestamps needed for future payment and result linkage.

#### Scenario: Registration is updated

- **WHEN** race assignments or state change
- **THEN** the registration identity remains stable and the update time changes
