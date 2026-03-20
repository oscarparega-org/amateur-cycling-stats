# Phase 4: Resend Email Integration — Design Spec

## Overview

Replace placeholder `console.log` email callbacks in BetterAuth with real email delivery via the Resend SDK. Covers password reset, magic link sign-in, and organization invitation emails.

## Approach

Direct Resend SDK calls (Approach A) — a thin `sendEmail` helper wrapping the Resend client, plus template functions for each email type. No provider abstraction.

## New Files

### `apps/backend/src/lib/email.ts`

Resend client initialization and helpers:

- **`sendEmail({ to, subject, html })`** — sends an email via Resend. Errors are logged, never thrown (matches current error handling pattern).
- **`setPendingInvitation({ email, organizationName })`** — sets a module-level flag used to differentiate invitation magic links from regular magic links.
- **`consumePendingInvitation()`** — reads and clears the pending invitation flag. Returns `null` if no invitation is pending.

Configuration:
- `RESEND_API_KEY` env var — required for Resend SDK
- `EMAIL_FROM` env var — defaults to `onboarding@resend.dev` (Resend's sandbox sender, no domain setup required)

### `apps/backend/src/lib/email-templates.ts`

Three template functions, each returning `{ subject: string; html: string }`:

- **`magicLinkEmail(url)`** — generic "Sign in" email with a CTA button
- **`resetPasswordEmail(url)`** — "Reset your password" email with a CTA button
- **`invitationEmail(url, organizationName)`** — "You've been invited to [org]" email with a CTA button

All templates use minimal inline-styled HTML: heading, message, styled button, disclaimer. No external CSS.

## Modified Files

### `apps/backend/src/lib/auth.ts`

Replace the two `console.log` placeholder callbacks:

- **`sendResetPassword({ user, url })`** — calls `sendEmail` with `resetPasswordEmail(url)`
- **`sendMagicLink({ email, url })`** — checks `consumePendingInvitation()`:
  - If an invitation is pending → sends `invitationEmail(url, organizationName)`
  - Otherwise → sends `magicLinkEmail(url)`

This avoids the double-email problem: when the invitation route triggers `auth.api.signInMagicLink`, the callback detects the pending invitation and sends the branded invitation email instead of the generic magic link email.

### `apps/backend/src/routes/invitations.ts`

Before calling `auth.api.signInMagicLink`:

1. Look up the organization name via Prisma (`prisma.organization.findUnique`)
2. Call `setPendingInvitation({ email, organizationName })`
3. Then trigger `auth.api.signInMagicLink` as before

The magic link callback handles sending the correct email.

### `apps/backend/.env.example`

Add:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

## Dependencies

- Install `resend` npm package in the backend workspace

## Error Handling

Matches existing pattern: email failures are logged via `console.error` and never block the main operation. The invitation route already catches and logs magic link failures.

## Environment Setup for Development

1. Create a free Resend account at resend.com
2. Generate an API key
3. Add `RESEND_API_KEY=re_xxxxx` to `apps/backend/.env`
4. Default sender `onboarding@resend.dev` works without domain verification (Resend sandbox)
5. When ready for production, verify your domain in Resend and update `EMAIL_FROM`

## Out of Scope

- Rich/branded email templates (deferred to later improvement)
- Email delivery tracking/webhooks
- Email queue/retry logic beyond what Resend provides
- Localization of email content (Spanish templates deferred)
