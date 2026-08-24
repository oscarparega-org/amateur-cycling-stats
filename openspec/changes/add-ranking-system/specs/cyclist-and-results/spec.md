## ADDED Requirements

### Requirement: Ranking points on results

Finalizing a result for a ranked race SHALL resolve the applicable place value and persist the awarded-point snapshot with the result.

#### Scenario: No point rule exists for place

- **WHEN** a cyclist finishes outside the configured point positions
- **THEN** the result remains valid and records zero awarded points

### Requirement: Ranking history

Cyclist history SHALL expose awarded points with ranking identity and SHALL support future aggregation without changing original result records.

#### Scenario: View ranked cyclist history

- **WHEN** a public user views eligible ranked results
- **THEN** each row shows the ranking and points awarded at finalization
