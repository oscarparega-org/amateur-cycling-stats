## ADDED Requirements

### Requirement: Race ranking assignment

An authorized race manager SHALL assign at most one active ranking system to a race and SHALL be able to leave a race unranked.

#### Scenario: Assign inactive ranking

- **WHEN** a manager selects an inactive ranking for a new race assignment
- **THEN** the backend rejects the assignment
