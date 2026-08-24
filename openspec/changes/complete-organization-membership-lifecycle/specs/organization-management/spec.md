## MODIFIED Requirements

### Requirement: Current organization default state

New organizations SHALL default to `INACTIVE` and SHALL remain read-only for organizer operations until an admin activates them.

#### Scenario: Admin creates an organization

- **WHEN** an admin creates an organization without supplying a state
- **THEN** the organization is stored as `INACTIVE`

### Requirement: Organizer maintenance

Admins SHALL update or delete owners and staff; organization owners SHALL update or delete staff but SHALL NOT modify another owner.

#### Scenario: Owner edits staff

- **WHEN** an organization owner updates a staff member in their organization
- **THEN** the permitted profile and role fields are persisted

#### Scenario: Owner targets another owner

- **WHEN** an organization owner attempts to edit or delete another owner
- **THEN** the backend returns HTTP 403

## ADDED Requirements

### Requirement: Organization lifecycle controls

Admins SHALL explicitly activate or deactivate an organization, and no automatic invitation or time-based transition SHALL change its state.

#### Scenario: Admin activates an organization

- **WHEN** an admin confirms activation of an inactive organization
- **THEN** the organization becomes `ACTIVE` and organizer operations are enabled

### Requirement: Member management navigation

The admin organization detail and organizer panel SHALL expose a Members area with list, detail, invite, edit, resend, and delete workflows appropriate to the caller's role.

#### Scenario: Organization has no members

- **WHEN** an authorized user opens an empty member list
- **THEN** the page displays an empty state and an invite action when the user has invite permission

### Requirement: Member edit contract

Member editing SHALL keep email read-only and SHALL permit changes only to first name, last name, and organizer role within the caller's permission boundary.

#### Scenario: Attempt to change member email

- **WHEN** an authorized user edits a member
- **THEN** the email is displayed but cannot be submitted as a mutable field
