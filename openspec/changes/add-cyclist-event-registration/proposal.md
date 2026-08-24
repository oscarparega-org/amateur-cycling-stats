## Why

Cyclist profiles and races exist, but there is no domain model for registering a cyclist in an event or assigning them to races. Registration is required before organizer-entered results and future payments can represent real participation.

## What Changes

- Introduce event registration and race-entry concepts linked to cyclists, events, and races.
- Allow organizers to register a new unregistered cyclist or select an existing cyclist.
- Assign registered cyclists to eligible races and track preregistration/confirmation state.
- Enforce event/race availability, organization authorization, duplicate prevention, and age/gender eligibility.

## Non-Goals

- Online self-service checkout, payment settlement, team management, waitlists, refunds, and registration-capacity pricing.

## Capabilities

### New Capabilities

- `event-registration`: Cyclist enrollment in events and assignment to eligible races.

### Modified Capabilities

- `cyclist-and-results`: Relate organizer-created cyclist profiles to registrations without changing result behavior yet.

## Impact

This will require new Prisma entities and migrations, shared contracts, registration APIs/services, authorization, and organizer UI. Capacity, cancellation, and self-service rules need further product discovery before implementation tasks are created.

## Legacy provenance

- `archive/svelte-supabase-v1/documentation/business/03-FEATURES.md`
- `archive/svelte-supabase-v1/documentation/business/04-BUSINESS_RULES.md`
- `archive/svelte-supabase-v1/documentation/technical/02-DATA_MODELS.md`
- Archive snapshot `2b96361`; legacy registration entities were documented as future work.
