## 1. Scope migration

- [x] 1.1 Audit existing category names, ownership, defaults, and race references across all three category tables.
- [x] 1.2 Finalize scope-aware name uniqueness and add `eventId`, ownership constraints, relations, and indexes in an expand migration.
- [x] 1.3 Backfill ownership and remove `isGlobal` atomically with the shared/API contract migration.
- [x] 1.4 Update shared category contracts to expose derived scope and event ownership.

## 2. Backend behavior

- [x] 2.1 Refactor category services and routes around explicit global, organization, and event management scopes.
- [x] 2.2 Implement admin/organizer-membership authorization, age-range validation, default protection, and foreign-key-backed in-use protection.
- [x] 2.3 Validate category ownership compatibility on every race create/edit request.

## 3. Frontend behavior

- [x] 3.1 Build reusable age/gender/distance list, detail, form, tab, confirmation, and feedback components.
- [x] 3.2 Add global admin, organization admin/panel, and event admin/panel category routes.
- [x] 3.3 Add the shared three-column Global/Organization/Event selector to race create/edit flows.

## 4. Verification

- [ ] 4.1 Test all role/scope combinations, dual ownership rejection, default/in-use deletion, invalid age ranges, and cross-organization race references.
- [ ] 4.2 Test backfill and rollback on a disposable copy of representative development data.
- [ ] 4.3 Run `npm run check`, relevant lint/build commands, Prisma migration validation, and OpenSpec verification.
