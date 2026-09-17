## 1. Backend policy and data

- [x] 1.1 Add runtime event schemas and derive year from normalized date/time input.
- [x] 1.2 Implement forward-only lifecycle transitions, publication eligibility, and role-aware public/management queries.
- [x] 1.3 Define result-aware deletion in a transaction and add any required cascade/restrict migration without rewriting history.
- [x] 1.4 Introduce explicit public and authenticated management endpoints, with a compatibility/deprecation path for current public organization reads.

## 2. Frontend workflows

- [x] 2.1 Build shared event list/detail/form primitives with future/past filters and empty/loading/error states.
- [x] 2.2 Add organizer and admin routes using shared components and context-specific navigation.
- [x] 2.3 Add public detail/list views that enforce lifecycle and visibility semantics.
- [x] 2.4 Add accessible publication and deletion confirmations plus deterministic success redirects.

## 3. Verification

- [ ] 3.1 Add lifecycle transition, public disclosure, organization isolation, validation, ordering, and deletion integration tests.
- [ ] 3.2 Test timezone/date boundaries and failure rollback using a disposable development database.
- [ ] 3.3 Run `npm run check`, frontend lint/build, backend build, and OpenSpec verification; document unavailable test coverage.
