## ADDED Requirements

### Requirement: Research gate

The payment implementation SHALL NOT begin until current provider capabilities, fees, Mexican tax obligations, CFDI responsibilities, refund/dispute rules, and legal/accounting assumptions are documented from authoritative sources and approved by qualified reviewers.

#### Scenario: Historical rate lacks validation

- **WHEN** a fee, commission, tax rate, or invoicing claim exists only in the archived document
- **THEN** it remains a labeled historical assumption and is not used in production calculations

### Requirement: Connected organizer payouts

The target payment system SHALL use connected organizer accounts so registration proceeds, platform fees, provider fees, refunds, and payouts are attributable to the correct legal party.

#### Scenario: Organizer is not payment-ready

- **WHEN** a registration would require payment for an organizer without completed provider onboarding
- **THEN** checkout is blocked with an actionable organizer status

### Requirement: Idempotent payment processing

Payment creation and webhook processing SHALL be idempotent and SHALL preserve an auditable mapping among registration, provider transaction, fee, refund, dispute, and payout records.

#### Scenario: Provider retries a webhook

- **WHEN** the same provider event is delivered more than once
- **THEN** financial state changes exactly once

### Requirement: Server-authoritative amounts

Registration price, tax, platform fee, organizer net amount, currency, and refundable amount SHALL be calculated or verified server-side using versioned rules.

#### Scenario: Client changes a displayed amount

- **WHEN** submitted checkout data conflicts with the server calculation
- **THEN** the backend rejects or replaces the client value before payment creation

### Requirement: Financial state reconciliation

The system SHALL distinguish initiated, pending, succeeded, failed, refunded, disputed, and paid-out states and SHALL support reconciliation against provider records.

#### Scenario: Webhook delivery is delayed

- **WHEN** browser completion occurs before authoritative provider confirmation
- **THEN** registration does not become paid solely from the browser redirect

### Requirement: Tax and invoicing records

The system SHALL retain the validated fiscal identities, invoice relationships, tax breakdowns, and immutable source amounts needed for compliant invoicing and reporting.

#### Scenario: Financial rule changes

- **WHEN** a commission or tax rule changes
- **THEN** historical transactions retain the rule version and amounts originally applied

### Requirement: Sensitive financial data

The application SHALL minimize stored payment data and SHALL rely on provider-hosted collection or tokenization for card and bank details.

#### Scenario: Card details are collected

- **WHEN** a cyclist enters payment credentials
- **THEN** raw credentials do not pass through or persist in the application database
