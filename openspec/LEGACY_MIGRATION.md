# Legacy documentation migration

This index records how the Superpowers documents and the ignored Svelte/Supabase archive were classified during the OpenSpec bootstrap. It is provenance, not a product requirement. The archive snapshot is `2b96361`; the active migration began from repository commit `1fc2dca`.

## Disposition rules

- Current code and Prisma behavior became main specs in `openspec/specs/`.
- Desired but unimplemented behavior became capability-sized changes in `openspec/changes/`.
- Newer detailed feature specs override older consolidated summaries when they conflict.
- SvelteKit, Supabase Auth/RLS/RPC, MailerSend, old ports, and Coolify-specific mechanics were not migrated as implementation requirements.
- Security, performance, tax, payment, and provider claims that can change remain research-gated.

## Superpowers source map

| Source                                    | Migrated destination                                                    | Discarded or deferred detail                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Phase 1 monorepo scaffold design and plan | `config.yaml`, `platform-runtime`                                       | SvelteKit scaffold steps and file-by-file completed tasks                          |
| Phase 2 backend CRUD design and plan      | Organization, category, event, race, cyclist/result main specs          | No-auth phase assumptions and obsolete implementation checklist                    |
| Phase 3 authentication design and plan    | `identity-and-access`, `invitation-and-email`, membership future change | Old migration steps already represented by current code                            |
| Phase 4 Resend design and plan            | `invitation-and-email`, membership future change                        | Temporary in-memory technique is documented only where it remains current behavior |
| Phase 5.1 frontend design and plan        | `build-next-frontend-experience`                                        | Svelte, bits-ui, shadcn-svelte, Vite, and Vitest-specific setup                    |
| Phase 5.2 i18n design                     | `build-next-frontend-experience`                                        | SvelteKit hooks, stores, route loaders, and copied locale implementation           |

## Archived feature-spec map

| Source area                                            | Destination                                  | Governing decision                                                                                              |
| ------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `001-admin-categories`                                 | `complete-multi-scope-category-management`   | Global CRUD remains admin-only; default and in-use protection retained                                          |
| `001-event-management`                                 | `complete-event-management-workflows`        | Lifecycle, visibility, filters, and deletion protection retained; automatic race generation superseded          |
| `001-org-members-management`                           | `complete-organization-membership-lifecycle` | Latest MVP clarification defers invitation expiry; owner/staff boundaries retained                              |
| `002-admin-event-management`                           | `complete-event-management-workflows`        | Admin and organizer contexts share behavior and components                                                      |
| `003-org-categories`                                   | `complete-multi-scope-category-management`   | Owner and staff may manage their organization's categories in the target behavior                               |
| `004-race-management` and `newSpec.md`                 | `complete-race-management-workflows`         | Manual CRUD, generated names, visibility, and confirmed result-cascade deletion supersede older no-delete rules |
| `005-event-categories` and `categoriesAtEventLevel.md` | `complete-multi-scope-category-management`   | Add event ownership; derive scope from mutually exclusive owner IDs; remove `isGlobal` through staged migration |

The archived research, data models, contracts, quickstarts, checklists, and task files were used to enrich these artifacts but were not copied because their Svelte/Supabase interfaces are not active contracts.

## Archived product and technical documentation map

| Documentation                              | Destination                                                               | Treatment                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Overview and architecture                  | `config.yaml`, `platform-runtime`                                         | Current stack replaces archived stack                                                            |
| User roles and business rules              | Identity, organization, event, category, race, and registration artifacts | Newest detailed feature clarification wins on conflict                                           |
| Feature catalog and roadmap                | Ten future changes                                                        | Implemented status from the old application was not transferred to the new project               |
| Payments and taxes                         | `add-payments-and-tax-operations`                                         | Stable intent retained; all rates, legal conclusions, and projections require current validation |
| Ranking system                             | `add-ranking-system`                                                      | Domain intent retained; point schedules remain unapproved assumptions                            |
| Data models and API/RPC docs               | Current specs and future designs                                          | Domain concepts retained; Supabase wire and SQL mechanics discarded                              |
| RLS and security                           | `harden-platform-security-performance-and-operations`                     | Policy intent moved to Hono authorization and PostgreSQL constraints                             |
| CRUD, design-system, and UI patterns       | `build-next-frontend-experience` and feature workflow changes             | UX semantics retained; Svelte components/actions discarded                                       |
| Deployment, configuration, and performance | `platform-runtime` and platform-hardening change                          | Provider-neutral requirements retained; old commands, ports, and providers discarded             |
| Validation and accessibility               | Platform-hardening and frontend-experience changes                        | Stable quality requirements retained and adapted to React/Hono                                   |

## Known current-to-target gaps

- The active frontend is a minimal Next.js shell; role-specific product screens and i18n are future work.
- Current organization creation defaults to `ACTIVE`; target onboarding defaults to `INACTIVE`.
- Several list/detail reads are currently public; target event/result management makes disclosure visibility- and membership-aware.
- Current categories have global/organization scope and owner-only organization writes; target adds event scope and staff management.
- Current race names are caller-controlled, visibility defaults hidden, and result deletion is not an explicit cascade; target requirements change all three.
- Event lifecycle transitions, registration, ranking, payments, and operational hardening are not implemented.

## Implementation dependency order

1. `build-next-frontend-experience` and `complete-organization-membership-lifecycle`
2. `complete-event-management-workflows`, `complete-multi-scope-category-management`, and `complete-race-management-workflows`
3. `add-cyclist-event-registration`, `complete-results-management`, and `add-ranking-system`
4. `add-payments-and-tax-operations` after authoritative review
5. `harden-platform-security-performance-and-operations` as smaller follow-up implementation changes throughout the roadmap
