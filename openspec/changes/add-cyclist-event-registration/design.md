## Context

The current schema links cyclists directly to results but has no event registration or race-entry entities. Archived material identifies the workflow but leaves capacity, cancellation, self-service, and payment semantics unresolved.

## Goals / Non-Goals

**Goals:**

- Establish event enrollment and race assignment as durable domain concepts.
- Support organizer-created and existing cyclists with auditable authorization.

**Non-Goals:**

- Checkout, refunds, teams, waitlists, capacity pricing, and cyclist self-service.

## Decisions

- Model `EventRegistration` separately from `RaceEntry`; event enrollment exists once while race assignments can vary.
- Reference `Cyclist`, `Event`, and `Race` by foreign key and enforce unique cyclist/event plus cyclist/race membership.
- Keep payment state outside registration until the payments change is validated; later payment records reference registration IDs.
- Perform new-cyclist creation and enrollment in one Prisma transaction.
- Centralize eligibility evaluation in a service returning structured reasons for API and UI reuse.

## Risks / Trade-offs

- [Category rules are not fully formalized] → Define unknown demographic handling and override policy before tasks are generated.
- [Event deletion semantics change] → Registration presence must participate in event deletion protection.
- [Future self-service may need consent/contact fields] → Avoid overfitting organizer-only request shapes into the persistence model.

## Migration Plan

Discovery stage only: decide registration state machine, cancellation, eligibility override, and privacy rules; then finalize Prisma design and implementation tasks.

## Open Questions

- Whether unknown age/gender blocks restricted-race assignment.
- Cancellation/deletion policy and retained audit history.
- Capacity, waitlist, organizer override, and future cyclist self-service behavior.
