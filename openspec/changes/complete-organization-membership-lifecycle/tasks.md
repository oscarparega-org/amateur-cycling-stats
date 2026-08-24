## 1. Data and contracts

- [ ] 1.1 Audit organization and organizer data for state defaults, duplicate memberships, and last-owner edge cases.
- [ ] 1.2 Add a new Prisma migration for inactive organization defaults and the approved single-organization organizer constraint.
- [ ] 1.3 Update shared organization, organizer, invitation, validation, and error contracts.

## 2. Backend lifecycle

- [ ] 2.1 Implement transactional member permission and last-owner enforcement with role/ownership tests.
- [ ] 2.2 Implement invitation email uniqueness, owner/staff invite rules, resend tracking, and delivery-failure behavior.
- [ ] 2.3 Make organizer setup fully atomic, including cyclist removal and password-policy validation.
- [ ] 2.4 Add organization activation/deactivation services and admin-only endpoints.

## 3. Frontend workflows

- [ ] 3.1 Build shared member list/detail/invite/edit/delete components and role-derived capability presentation.
- [ ] 3.2 Add admin organization member routes and organizer-panel member routes with accessible feedback and confirmations.
- [ ] 3.3 Add invitation acceptance/setup and resend experiences with localized validation.

## 4. Verification

- [ ] 4.1 Add integration tests for admin, owner, staff, invitee, unrelated user, and anonymous permission paths.
- [ ] 4.2 Test setup rollback, duplicate email, concurrent last-owner deletion, and email-provider failure.
- [ ] 4.3 Run Prisma migration checks against a disposable development database, then run `npm run check`, relevant lint/build commands, and OpenSpec verification.
