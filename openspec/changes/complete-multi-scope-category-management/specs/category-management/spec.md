## MODIFIED Requirements

### Requirement: Category read scope

Category reads SHALL distinguish global, organization, and event scope. A race-management query SHALL return global categories plus categories for the race event's organization and event, while a scope-management query SHALL return only the requested scope.

#### Scenario: Read event-scope categories

- **WHEN** an authorized user opens an event's category page
- **THEN** only categories whose `eventId` matches that event are listed

### Requirement: Category write authorization

Only admins SHALL write global categories; admins and organizers belonging to an organization SHALL write categories owned by that organization or one of its events.

#### Scenario: Organizer writes an event category in their organization

- **WHEN** an organizer member submits a valid event category for their organization's event
- **THEN** the write is authorized

### Requirement: Category creation scope

A category SHALL derive its scope from ownership: both owner IDs null means global, `organizationId` means organization scope, and `eventId` means event scope. A category SHALL NOT have both owner IDs.

#### Scenario: Invalid dual ownership

- **WHEN** a write supplies both organization and event ownership
- **THEN** database and API validation reject the category

## ADDED Requirements

### Requirement: Scope migration

The system SHALL remove `isGlobal` after migrating existing global categories to null ownership and retaining organization ownership for existing organization categories.

#### Scenario: Migrate a global category

- **WHEN** an existing category has `isGlobal: true`
- **THEN** its organization and event ownership are null after migration

### Requirement: Category management interfaces

Admin, organization, and event contexts SHALL provide age, gender, and distance tabs with list, detail, create, edit, and confirmed delete workflows.

#### Scenario: Open default category route

- **WHEN** a user opens a category management root without a type
- **THEN** the interface redirects to the age category tab

### Requirement: Category field validation

Names SHALL be required; age categories SHALL enforce `fromAge <= toAge` when both exist; all fields SHALL use scope-appropriate uniqueness rules established by the database.

#### Scenario: Invalid age range

- **WHEN** a caller submits `fromAge` greater than `toAge`
- **THEN** the request is rejected with field-level validation

#### Scenario: Reuse a global label in an event

- **WHEN** an event category uses a name that already exists globally but not in that event
- **THEN** creation succeeds because uniqueness is enforced within the owning scope

### Requirement: Inherited category reference

Organization and event management interfaces SHALL show inherited categories as read-only references while limiting mutations to the current scope.

#### Scenario: View event categories

- **WHEN** an authorized user opens an event category page
- **THEN** global and organization categories are visible without mutation actions and event categories are manageable

### Requirement: Default category immutability

Default categories SHALL not be edited or deleted, and management interfaces SHALL hide edit/delete actions while the API continues to enforce protection.

#### Scenario: Direct default-category edit

- **WHEN** an authorized user bypasses the UI and submits an edit for a default category
- **THEN** the API rejects the operation
