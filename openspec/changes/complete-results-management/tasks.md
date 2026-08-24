## 1. Backend results behavior

- [ ] 1.1 Add runtime result schemas and stable errors for invalid place, time, cyclist, and duplicate-race participation.
- [ ] 1.2 Split visibility-aware public result queries from event/race-scoped management queries.
- [ ] 1.3 Centralize event-organization authorization and add the future registration-eligibility integration seam.
- [ ] 1.4 Decide and document tie handling and canonical duration representation before adding related constraints.

## 2. Frontend workflows

- [ ] 2.1 Build accessible management tables/forms for add, edit, delete, validation, ordering, and empty states.
- [ ] 2.2 Add public event results grouped by visible race.
- [ ] 2.3 Add public cyclist history ordered most recent first with event/race/category context.

## 3. Verification

- [ ] 3.1 Add public visibility, organization isolation, validation, duplicate, ordering, and authorization integration tests.
- [ ] 3.2 Test hidden event/race disclosure and database-error rollback.
- [ ] 3.3 Run `npm run check`, relevant lint/build commands, and OpenSpec verification; document the registration dependency.
