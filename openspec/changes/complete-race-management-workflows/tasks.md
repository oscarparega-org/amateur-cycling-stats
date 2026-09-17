## 1. Persistence and backend

- [x] 1.1 Add explicit race-result cascade semantics and change only the new-race visibility default through a new Prisma migration.
- [x] 1.2 Make category ownership validation and race-name generation server-authoritative.
- [x] 1.3 Add visibility-aware public reads, secure management reads, transactional deletion, and stable validation/conflict responses.
- [x] 1.4 Resolve category-rename name behavior and implement the chosen snapshot or propagation policy.

## 2. Frontend workflows

- [x] 2.1 Build shared race list/detail/create/edit components with live generated-name preview and category selectors.
- [x] 2.2 Add admin and organizer event-scoped race routes with consistent breadcrumbs, tabs, empty states, and notifications.
- [x] 2.3 Add accessible visibility and deletion confirmations, including result-count impact.

## 3. Verification

- [ ] 3.1 Test combination uniqueness on create/edit, invalid category ownership, name generation, and existing-record visibility compatibility.
- [ ] 3.2 Test public/member/admin visibility and transactional deletion under concurrent result creation.
- [ ] 3.3 Run migration checks on a disposable development database, `npm run check`, relevant lint/build commands, and OpenSpec verification.
