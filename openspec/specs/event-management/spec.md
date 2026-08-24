# Event Management Specification

## Purpose

Define the current event read, filtering, persistence, visibility, and authorization behavior.

## Requirements

### Requirement: Public future-event listing

The event API SHALL publicly return visible future events ordered by date ascending when no organization-specific query is supplied.

#### Scenario: Request default event list

- **WHEN** a caller requests `GET /api/events` without filters
- **THEN** only public events at or after the current time are returned

### Requirement: Public past-event listing

The event API SHALL publicly return visible past events ordered most recent first and SHALL optionally filter them by year.

#### Scenario: Request past events for a year

- **WHEN** a caller supplies `type=past` and a year
- **THEN** only public past events for that year are returned

### Requirement: Organization event listing

The event API SHALL publicly return all events for a supplied organization and SHALL support `all`, `future`, and `past` date filters.

#### Scenario: Request organization future events

- **WHEN** a caller supplies an organization ID and `filter=future`
- **THEN** that organization's future events are returned regardless of public visibility

### Requirement: Event detail read

The event API SHALL publicly return a flat event record by ID and SHALL return HTTP 404 when it does not exist.

#### Scenario: Read an existing event

- **WHEN** a caller requests an existing event ID
- **THEN** the API returns its identity, location, date, status, organization, creator, and visibility fields

### Requirement: Event creation

An authenticated caller SHALL create an event when required identity, date, location, creator, and year fields are supplied; organization-scoped events additionally require membership or admin access.

#### Scenario: Create an organization event without membership

- **WHEN** an authenticated non-admin submits an event for an unrelated organization
- **THEN** the backend returns HTTP 403

### Requirement: Event updates and deletion

Admins or organizers belonging to the event's organization SHALL update or delete an event.

#### Scenario: Unauthorized organizer deletes an event

- **WHEN** an organizer does not belong to the event's organization
- **THEN** the backend returns HTTP 403

### Requirement: Current lifecycle storage

Events SHALL store status values `DRAFT`, `AVAILABLE`, `SOLD_OUT`, `ON_GOING`, or `FINISHED` and an independent public-visibility flag; the current API SHALL not enforce ordered status transitions.

#### Scenario: Update an event status

- **WHEN** an authorized caller patches a supported event status
- **THEN** the value is persisted without an automatic lifecycle transition check
