## MODIFIED Requirements

### Requirement: Organization event listing

The event API SHALL return all events for an organization only to admins or organizers belonging to that organization and SHALL support `all`, `future`, and `past` date filters.

#### Scenario: Public caller requests organization events

- **WHEN** an unauthenticated caller requests an organization's complete event list
- **THEN** the backend rejects the request rather than exposing non-public events

### Requirement: Current lifecycle storage

Events SHALL follow `DRAFT → AVAILABLE → SOLD_OUT → ON_GOING → FINISHED`, SHALL start as `DRAFT`, and SHALL not transition backward.

#### Scenario: Attempt a backward transition

- **WHEN** an authorized caller changes an `ON_GOING` event to `AVAILABLE`
- **THEN** the backend rejects the transition and preserves `ON_GOING`

### Requirement: Event updates and deletion

Admins or organizers belonging to the event's organization SHALL update an event and SHALL delete it only when it is a draft with no registered participants and no protected result history.

#### Scenario: Delete draft without participants

- **WHEN** an authorized caller confirms deletion of a draft event with no registrations or results
- **THEN** the event and database-owned dependent races/results are deleted atomically

#### Scenario: Delete protected event

- **WHEN** the event has registered participants or finished results
- **THEN** deletion is rejected with a reason suitable for display

## ADDED Requirements

### Requirement: Event management interfaces

Admins and organizers SHALL have consistent organization-scoped list, detail, create, edit, visibility, and delete interfaces.

#### Scenario: Organizer opens their event list

- **WHEN** an organizer opens the panel
- **THEN** only their organization's events are shown with future/past filters and create access

### Requirement: Event form validation

Event creation and editing SHALL validate name, date/time, country, state, and organization context and SHALL derive year from the submitted date rather than trusting a separate client value.

#### Scenario: Invalid event date submitted

- **WHEN** a caller submits an invalid date/time
- **THEN** the API returns field-level validation and does not persist an event

### Requirement: Event visibility

Public users SHALL see an event only when its lifecycle and `isPublicVisible` state permit publication; organization members and admins SHALL see managed events regardless of public visibility.

#### Scenario: Public user requests a hidden event

- **WHEN** an event is not public or remains a draft
- **THEN** the public endpoint does not disclose the event

### Requirement: Event feedback and navigation

Event forms and destructive or visibility actions SHALL provide confirmations, field errors, success feedback, and deterministic redirects to the relevant list or detail page.

#### Scenario: Event update succeeds

- **WHEN** an authorized user saves a valid edit
- **THEN** the user returns to event detail and receives a success notification
