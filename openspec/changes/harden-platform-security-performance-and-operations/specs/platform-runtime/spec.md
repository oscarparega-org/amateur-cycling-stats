## ADDED Requirements

### Requirement: Environment promotion

The platform SHALL separate development, staging, and production configuration and data, with secrets managed outside source control.

#### Scenario: Deploy to staging

- **WHEN** a release is promoted to staging
- **THEN** it uses staging credentials, database, URLs, and provider modes without production data access

### Requirement: Database migration safety

Schema changes SHALL use new reviewable migrations, include compatibility and rollback analysis, and SHALL NOT rewrite committed migration history.

#### Scenario: Destructive migration is proposed

- **WHEN** a migration drops or rewrites data
- **THEN** the release requires an explicit backfill, backup, verification, and recovery plan
