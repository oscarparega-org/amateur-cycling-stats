## ADDED Requirements

### Requirement: Organizer account conversion

Invitation acceptance SHALL convert the authenticated invitation account to the invited organizer role and SHALL ensure it is not simultaneously represented as a cyclist.

#### Scenario: Magic-link account has a cyclist profile

- **WHEN** the invited user completes organizer setup
- **THEN** the cyclist profile is removed and exactly one organizer membership is created

### Requirement: Password policy for invited organizers

Organizer setup SHALL require at least eight characters with an uppercase letter, lowercase letter, and number.

#### Scenario: Weak password submitted

- **WHEN** an invitee submits a password that does not meet every required class
- **THEN** setup is rejected without changing invitation or membership state

### Requirement: Single-organization organizer scope

An organizer account SHALL belong to exactly one organization in this product phase.

#### Scenario: Existing organizer accepts another organization invitation

- **WHEN** an organizer already belongs to an organization
- **THEN** acceptance for a different organization is rejected without adding membership
