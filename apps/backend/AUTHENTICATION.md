# Backend authentication

Hono mounts Better Auth at `/api/auth/*`. Email/password accounts must verify
their email before login, Google accounts require a verified provider email,
and password resets revoke every active session.

## Google callback

Register this callback in Google Cloud for each public environment:

```text
https://app.example.com/api/auth/callback/google
```

`BETTER_AUTH_URL` must be the same public origin. During the backend-only phase
it may point directly to Hono locally; once the Next.js BFF is added it must point
to the BFF origin.

The frontend proxies `/api/auth/*` to Hono. Configure `BETTER_AUTH_URL` with the
frontend origin (for example `http://localhost:5173`) and keep `API_URL` pointed
at Hono (`http://localhost:3000`). The browser stores the session cookie for the
frontend origin, and server-side frontend requests forward it to Hono.

## Verification

```bash
npm run test:unit --workspace=apps/backend
npm run test:e2e --workspace=apps/backend
```

The E2E suite starts a disposable PostgreSQL 16 container and mocks Google and
email delivery. It never uses the configured development database.

Before production release, smoke-test with real Google and Resend credentials:

1. Register by email, receive the verification message, and consume its link.
2. Log in, inspect the session, log out, and confirm the session is revoked.
3. Request a password reset, reset it, and confirm all older sessions are invalid.
4. Complete Google consent for a new address and for an existing verified address.
5. Confirm every email and OAuth callback uses the public BFF-compatible origin.
