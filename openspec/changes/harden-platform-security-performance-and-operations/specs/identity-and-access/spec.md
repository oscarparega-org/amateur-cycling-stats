## ADDED Requirements

### Requirement: Session hardening

Production sessions SHALL use secure cookie settings, bounded lifetime, rotation or revocation behavior, and server-side authorization on every protected operation.

#### Scenario: Session is expired or revoked

- **WHEN** a protected request presents the invalid session
- **THEN** the backend returns HTTP 401 without performing the operation

### Requirement: Authorization regression coverage

Every protected resource SHALL have automated positive and negative tests for admin, owner, staff, cyclist, unrelated authenticated user, and anonymous access as applicable.

#### Scenario: New protected route is added

- **WHEN** the route is submitted for review
- **THEN** its role and ownership matrix has executable coverage

### Requirement: Authentication privacy

Authentication recovery and invitation endpoints SHALL avoid responses that unnecessarily reveal whether an account exists.

#### Scenario: Unknown email requests reset

- **WHEN** a password-reset request uses an unknown email
- **THEN** the public response is indistinguishable from a request for a known email
