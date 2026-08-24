## Why

The archived project contains a detailed commercial model for registration payments, platform commission, organizer payouts, Mexican taxes, and CFDI invoicing. These concerns are strategically important but legally and financially time-sensitive, so they must be preserved as a research-gated change.

## What Changes

- Define the intended Stripe Connect money flow between cyclists, organizers, and the platform.
- Define auditable registration charges, platform fees, organizer balances, refunds, disputes, payouts, and reconciliation.
- Define invoicing and tax-reporting responsibilities without freezing historical rates or legal claims.
- Require current official-source validation and professional legal/accounting review before implementation.

## Non-Goals

- Treating the archived 10% commission, Stripe fee examples, IVA/ISR rates, CFDI fields, or projections as currently approved facts.
- Implementing payment code or collecting money during the documentation migration.

## Capabilities

### New Capabilities

- `payments-and-tax`: Registration payments, commissions, connected-account payouts, refunds, invoicing, and tax reporting.

### Modified Capabilities

- None. Payment work depends on the separate `event-registration` proposal and SHALL coordinate with it before implementation.

## Impact

Future implementation will affect registration persistence, Stripe integration, webhooks, idempotency, ledger/audit data, organizer onboarding, secrets, reporting, and compliance operations. The change is blocked from task creation until research is refreshed.

## Legacy provenance

- `archive/svelte-supabase-v1/documentation/business/06-PAYMENTS_AND_TAXES.md`
- Archive snapshot `2b96361`. All monetary, provider, tax, and CFDI details are historical assumptions requiring authoritative revalidation.
