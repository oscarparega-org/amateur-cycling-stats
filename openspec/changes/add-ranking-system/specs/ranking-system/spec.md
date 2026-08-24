## ADDED Requirements

### Requirement: Ranking definitions

Admins SHALL manage named ranking systems and their active status independently from races.

#### Scenario: Deactivate a ranking

- **WHEN** an admin deactivates a ranking system
- **THEN** existing historical references remain readable while new assignment is prevented

### Requirement: Position points

A ranking system SHALL define validated point awards by finishing position without requiring code changes for custom schedules.

#### Scenario: Duplicate position rule

- **WHEN** an admin defines two point values for the same position in one ranking
- **THEN** the backend rejects the duplicate

### Requirement: Awarded-point snapshot

Each ranked result SHALL retain the points actually awarded so later schedule edits do not silently rewrite historical totals.

#### Scenario: Point schedule changes

- **WHEN** an admin edits future point values
- **THEN** previously awarded result points remain unchanged unless an explicit recalculation is performed

### Requirement: Ranking visibility

Public result and cyclist-history views SHALL display ranking name and awarded points for publicly eligible ranked races.

#### Scenario: Race has no ranking

- **WHEN** a result belongs to an unranked race
- **THEN** ranking fields are omitted or shown as not applicable without an error
