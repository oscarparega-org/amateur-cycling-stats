## ADDED Requirements

### Requirement: Role-aware application shells

The Next.js application SHALL provide distinct public, cyclist, organizer, and admin navigation contexts while reusing common layout and feedback primitives.

#### Scenario: Organizer opens the panel

- **WHEN** an authenticated organizer navigates to their panel
- **THEN** navigation presents organization-appropriate destinations without admin-only actions

### Requirement: Localization

The frontend SHALL support Spanish and English, default to Spanish when no preference exists, and persist an explicit locale choice across navigation and subsequent visits.

#### Scenario: First visit has no locale preference

- **WHEN** a user opens the application without a supported locale signal
- **THEN** server-rendered content and the document language use Spanish

### Requirement: Shared management patterns

Management pages SHALL use consistent breadcrumbs, contextual tabs, right-aligned actions, list/detail/create/edit flows, confirmation dialogs, and success/error notifications.

#### Scenario: Delete action is available

- **WHEN** a user invokes a permitted destructive action
- **THEN** an accessible confirmation explains impact before submission and focus returns predictably after cancellation

### Requirement: Accessible interaction

Interactive components SHALL support keyboard operation, visible focus, associated labels and errors, semantic tables, announced asynchronous feedback, and WCAG AA color contrast.

#### Scenario: Form validation fails

- **WHEN** a keyboard or screen-reader user submits invalid data
- **THEN** focus moves to an error summary or first invalid field and each error is programmatically associated

### Requirement: Responsive presentation

Application workflows SHALL remain usable on supported mobile and desktop viewports without hiding required actions or forcing horizontal page scrolling.

#### Scenario: Data table is viewed on mobile

- **WHEN** available width cannot display every desktop column
- **THEN** the interface preserves essential identity/status/action access using an accessible responsive pattern

### Requirement: Standard async states

Data-driven pages SHALL distinguish loading, empty, recoverable error, forbidden, not-found, and success states.

#### Scenario: API request fails recoverably

- **WHEN** a page cannot load data because of a transient error
- **THEN** it presents a localized error and an accessible retry action
