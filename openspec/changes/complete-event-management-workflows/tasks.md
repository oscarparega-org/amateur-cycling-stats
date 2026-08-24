## 1. Backend policy and data

- [ ] 1.1 Add runtime event schemas and derive year from normalized date/time input.
- [ ] 1.2 Implement forward-only lifecycle transitions, publication eligibility, and role-aware public/management queries.
- [ ] 1.3 Define result-aware deletion in a transaction and add any required cascade/restrict migration without rewriting history.
- [ ] 1.4 Introduce explicit public and authenticated management endpoints, with a compatibility/deprecation path for current public organization reads.

## 2. Frontend workflows

- [ ] 2.1 Build shared event list/detail/form primitives with future/past filters and empty/loading/error states.
- [ ] 2.2 Add organizer and admin routes using shared components and context-specific navigation.
- [ ] 2.3 Add public detail/list views that enforce lifecycle and visibility semantics.
- [ ] 2.4 Add accessible publication and deletion confirmations plus deterministic success redirects.

## 3. Verification

- [ ] 3.1 Add lifecycle transition, public disclosure, organization isolation, validation, ordering, and deletion integration tests.
- [ ] 3.2 Test timezone/date boundaries and failure rollback using a disposable development database.
- [ ] 3.3 Run `npm run check`, frontend lint/build, backend build, and OpenSpec verification; document unavailable test coverage.
