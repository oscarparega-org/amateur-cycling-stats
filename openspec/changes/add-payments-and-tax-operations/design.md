## Context

The archived finance document describes Stripe Connect, a historical commission model, Mexican taxes, CFDI invoicing, payouts, reports, and projections. These details are time-sensitive and have not been validated for August 2026 or for the new architecture.

## Goals / Non-Goals

**Goals:**

- Preserve stable payment, ledger, audit, and compliance intent.
- Define a hard research and approval gate before money movement is implemented.

**Non-Goals:**

- Approving historical rates, choosing a final charge type, or implementing checkout now.

## Decisions

- Use provider-hosted connected-account onboarding and payment collection; never store raw payment credentials.
- Model an internal immutable financial ledger keyed to registration and provider identifiers rather than deriving business state only from provider dashboards.
- Treat webhooks as authoritative, verify signatures, store provider event IDs, and process each event idempotently.
- Version commission/tax rules and snapshot all calculated amounts and currency on each transaction.
- Require official Stripe Mexico documentation, SAT material, and qualified Mexican legal/accounting review before tasks are generated.
- Keep the historical 10% model and cost projections only as research inputs, not normative configuration.

## Research snapshot (2026-08-23)

- Stripe's current [Mexico Connect pricing](https://stripe.com/mx/connect/pricing) confirms that platform cost and responsibility depend on whether Stripe or the platform controls connected-account pricing; quoted rates are therefore time-sensitive configuration inputs, not specification constants.
- Stripe's [Connect charge-type documentation](https://docs.stripe.com/connect/charges) confirms that direct, destination, and separate charge flows assign fees, refunds, chargebacks, merchant presentation, and negative-balance exposure differently. The product must select a charge model only after its business-of-record and liability decisions are approved.
- SAT's [CFDI 4.0 receiver-data guidance](https://www.sat.gob.mx/minisitio/Factura/documentos/Infografia_FacturaElectronica_Datos_Receptor.pdf) identifies regulated receiver data and catalog relationships, while the [2026 Resolución Miscelánea Fiscal](https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rmf/rmf/RMF_2026-DOF-28122025.pdf) is part of the current ruleset. These sources support the research gate but do not determine who invoices whom for this business model without professional review.
- This snapshot validates the architecture's need for versioned rules and legal review; it does not approve the archive's commission, IVA/ISR, fee, or CFDI assertions.

## Risks / Trade-offs

- [Tax/legal guidance changes] → Record validation dates and source links, version rules, and require review before rollout.
- [Incorrect connected-account charge model changes liability] → Decide destination charges versus separate charges/transfers with counsel and provider documentation.
- [Webhook gaps create inconsistent registration state] → Add replayable event storage and scheduled reconciliation.
- [Refunds/disputes can exceed organizer balance] → Define reserves, negative-balance ownership, and payout timing before implementation.

## Migration Plan

Discovery stage only: refresh official research, obtain accounting/legal review, select the provider flow, define ledger/state diagrams and test-mode acceptance criteria, then create implementation tasks. No production credentials or transactions are introduced by this change.

## Open Questions

- Approved commission and tax treatment, invoice issuer relationships, and CFDI provider.
- Connected-account type, charge model, payout schedule, refund ownership, and dispute reserves.
- Supported currencies, price tax-inclusion policy, and registration cancellation rules.
