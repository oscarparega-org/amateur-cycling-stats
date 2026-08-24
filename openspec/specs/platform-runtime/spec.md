# Platform Runtime Specification

## Purpose

Define the current application boundaries and runtime health behavior shared by the frontend, backend, and shared package.

## Requirements

### Requirement: Workspace boundaries

The project SHALL operate as an npm-workspaces monorepo with a Next.js frontend, a Hono backend, and an `@acs/shared` TypeScript package coordinated by Turborepo.

#### Scenario: Run a repository command

- **WHEN** a developer runs a root build, check, lint, test, or development command
- **THEN** Turborepo dispatches the corresponding workspace scripts in dependency order

### Requirement: Shared contracts

Application contracts used by more than one workspace SHALL be exported from `@acs/shared`.

#### Scenario: Backend returns a domain object

- **WHEN** a backend adapter maps a database record for an API response
- **THEN** the result conforms to the corresponding shared domain contract

### Requirement: Backend health endpoint

The backend SHALL expose `GET /health` and report whether PostgreSQL is reachable.

#### Scenario: Database is available

- **WHEN** the health query succeeds
- **THEN** the endpoint returns HTTP 200 with `status: "ok"`, a timestamp, and `database: "connected"`

#### Scenario: Database is unavailable

- **WHEN** the health query fails
- **THEN** the endpoint returns HTTP 503 with `status: "error"`, a timestamp, and `database: "disconnected"`

### Requirement: Frontend runtime shell

The frontend SHALL use the Next.js App Router and SHALL expose a server-side health proxy for the backend health check.

#### Scenario: Load the current home page

- **WHEN** a user opens the frontend root route
- **THEN** the application renders the migration-ready shell and displays backend health through the frontend health integration

### Requirement: Environment isolation

Runtime secrets SHALL be supplied through environment variables and SHALL NOT be committed to the repository.

#### Scenario: Document required configuration

- **WHEN** a workspace requires a configurable runtime value
- **THEN** its `.env.example` contains a safe placeholder without a real credential
