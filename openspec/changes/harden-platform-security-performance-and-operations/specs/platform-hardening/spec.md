## ADDED Requirements

### Requirement: Runtime input validation

Every state-changing API SHALL validate request shape, types, bounds, and business invariants at the HTTP boundary before persistence.

#### Scenario: Unknown or malformed field is submitted

- **WHEN** request data violates the endpoint schema
- **THEN** the backend returns a stable validation response without reaching persistence

### Requirement: Abuse protection

Authentication, invitation, password-reset, registration, and other abuse-sensitive operations SHALL use rate limits and monitoring keyed appropriately to user, IP, and resource.

#### Scenario: Repeated magic-link requests exceed policy

- **WHEN** a caller exceeds the configured limit
- **THEN** further attempts are throttled without revealing account existence

### Requirement: Security headers and transport

Production responses SHALL use HTTPS and an approved set of security headers, including an application-appropriate content security policy.

#### Scenario: Inspect production response

- **WHEN** a browser receives an application page
- **THEN** transport and headers meet the documented production security baseline

### Requirement: Observability

The platform SHALL emit structured logs, health signals, error metrics, and audit events without exposing secrets or unnecessary personal data.

#### Scenario: Privileged mutation occurs

- **WHEN** an admin changes organization state or deletes protected business data
- **THEN** an audit event records actor, target, action, outcome, and timestamp

### Requirement: Backup and recovery

Production data SHALL have encrypted backups, documented retention, periodic restore tests, and recovery objectives approved before launch.

#### Scenario: Scheduled restore exercise

- **WHEN** a restore test is performed
- **THEN** recovery time, data-loss window, integrity checks, and remediation are recorded

### Requirement: Deployment safety

Production deployment SHALL run validation, migration checks, health verification, and a documented rollback or forward-fix procedure.

#### Scenario: Post-deployment health fails

- **WHEN** required health checks fail after deployment
- **THEN** rollout stops and the documented recovery procedure is initiated

### Requirement: Performance budgets

Critical public and management flows SHALL have measured response and rendering budgets based on realistic data volumes.

#### Scenario: Query exceeds its budget

- **WHEN** continuous or release testing detects a regression
- **THEN** the release reports the affected flow and blocks according to the agreed severity policy
