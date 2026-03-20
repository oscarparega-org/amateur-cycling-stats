# Phase 4: Resend Email Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder `console.log` email callbacks with real Resend-powered email delivery for password reset, magic link sign-in, and organization invitations.

**Architecture:** Thin `sendEmail` wrapper around Resend SDK with console.log fallback when no API key is set. Email templates are pure functions returning `{ subject, html }`. A `Map<string, InvitationData>` differentiates invitation magic links from regular ones to avoid double emails.

**Tech Stack:** Resend SDK, Hono, BetterAuth, Prisma

---

### Task 1: Install Resend and update env config

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/backend/.env.example`

- [ ] **Step 1: Install resend package**

Run from repo root:
```bash
npm install resend --workspace=apps/backend
```

- [ ] **Step 2: Add env vars to .env.example**

Append to `apps/backend/.env.example`:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/package.json apps/backend/.env.example package-lock.json
git commit -m "feat(email): install resend and add email env vars"
```

---

### Task 2: Create email templates

**Files:**
- Create: `apps/backend/src/lib/email-templates.ts`

- [ ] **Step 1: Create email-templates.ts**

```typescript
// apps/backend/src/lib/email-templates.ts

export function magicLinkEmail(url: string) {
  return {
    subject: 'Sign in to Amateur Cycling Stats',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Sign in</h2>
        <p>Click the button below to sign in to your account.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
          Sign in
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}

export function resetPasswordEmail(url: string) {
  return {
    subject: 'Reset your password — Amateur Cycling Stats',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the button below to reset your password.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
          Reset password
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}

export function invitationEmail(url: string, organizationName: string) {
  return {
    subject: `You've been invited to ${organizationName} — Amateur Cycling Stats`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You're invited</h2>
        <p>You've been invited to join <strong>${organizationName}</strong> on Amateur Cycling Stats.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
          Accept invitation
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">If you weren't expecting this, you can safely ignore this email.</p>
      </div>
    `,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/lib/email-templates.ts
git commit -m "feat(email): add minimal HTML email templates"
```

---

### Task 3: Create email module with Resend client

**Files:**
- Create: `apps/backend/src/lib/email.ts`

- [ ] **Step 1: Create email.ts**

```typescript
// apps/backend/src/lib/email.ts
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    console.log(`[EMAIL] (dev) To: ${opts.to} | Subject: ${opts.subject}`);
    console.log(`[EMAIL] (dev) Body: ${opts.html}`);
    return;
  }

  try {
    await resend.emails.send({
      from: DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
  }
}

// Pending invitation map — keyed by email to avoid race conditions
interface InvitationData {
  organizationName: string;
}

const pendingInvitations = new Map<string, InvitationData>();

export function setPendingInvitation(email: string, data: InvitationData): void {
  pendingInvitations.set(email, data);
}

export function consumePendingInvitation(email: string): InvitationData | null {
  const data = pendingInvitations.get(email) ?? null;
  pendingInvitations.delete(email);
  return data;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/lib/email.ts
git commit -m "feat(email): add sendEmail helper with Resend client and dev fallback"
```

---

### Task 4: Wire email into BetterAuth callbacks

**Files:**
- Modify: `apps/backend/src/lib/auth.ts` (lines 1-4 imports, lines 11-14 sendResetPassword, lines 17-21 sendMagicLink)

- [ ] **Step 1: Update auth.ts imports**

Add these imports at the top of `apps/backend/src/lib/auth.ts` (after line 4):

```typescript
import { sendEmail, consumePendingInvitation } from './email.js';
import { resetPasswordEmail, magicLinkEmail, invitationEmail } from './email-templates.js';
```

- [ ] **Step 2: Replace sendResetPassword callback**

Replace lines 11-14 in `auth.ts`:

Old:
```typescript
    sendResetPassword: async ({ user, url }) => {
      // Placeholder — Resend integration in Phase 4
      console.log(`[AUTH] Password reset for ${user.email}: ${url}`);
    }
```

New:
```typescript
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...resetPasswordEmail(url) });
    }
```

- [ ] **Step 3: Replace sendMagicLink callback**

Replace lines 17-21 in `auth.ts`:

Old:
```typescript
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Placeholder — Resend integration in Phase 4
        console.log(`[AUTH] Magic link for ${email}: ${url}`);
      }
    })
```

New:
```typescript
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const pending = consumePendingInvitation(email);
        if (pending) {
          await sendEmail({ to: email, ...invitationEmail(url, pending.organizationName) });
        } else {
          await sendEmail({ to: email, ...magicLinkEmail(url) });
        }
      }
    })
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/lib/auth.ts
git commit -m "feat(email): wire Resend emails into BetterAuth callbacks"
```

---

### Task 5: Update invitation route to set pending invitation context

**Files:**
- Modify: `apps/backend/src/routes/invitations.ts` (lines 1-5 imports, lines 38-48 POST handler)

- [ ] **Step 1: Add import**

Add to the imports at the top of `apps/backend/src/routes/invitations.ts` (after line 4):

```typescript
import { setPendingInvitation } from '../lib/email.js';
```

- [ ] **Step 2: Update POST handler**

Replace lines 38-50 in `invitations.ts` (the section after `createInvitation` through the return):

Old:
```typescript
  // Create invitation record
  const invitation = await invitationsService.createInvitation(body);

  // Trigger BetterAuth magic link for the invited email
  try {
    await auth.api.signInMagicLink({ body: { email: body.email }, headers: c.req.raw.headers });
  } catch (err) {
    console.error('[AUTH] Failed to send magic link:', err);
    // Invitation is created even if magic link fails — can be resent later
  }

  return c.json(invitation, 201);
```

New:
```typescript
  // Create invitation record
  const invitation = await invitationsService.createInvitation(body);

  // Look up organization name for the invitation email
  const org = await prisma.organization.findUnique({ where: { id: body.organizationId } });

  // Set pending invitation context so the magic link callback sends the branded email
  setPendingInvitation(body.email, { organizationName: org?.name ?? 'an organization' });

  // Trigger BetterAuth magic link for the invited email
  try {
    await auth.api.signInMagicLink({ body: { email: body.email }, headers: c.req.raw.headers });
    // Update invitation tracking fields
    await invitationsService.updateInvitation(invitation.id, {
      retryCount: (invitation.retryCount ?? 0) + 1,
    });
  } catch (err) {
    console.error('[AUTH] Failed to send magic link:', err);
    // Invitation is created even if magic link fails — can be resent later
  }

  return c.json(invitation, 201);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/backend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/routes/invitations.ts
git commit -m "feat(email): add invitation context and tracking to invitation route"
```

---

### Task 6: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
cd apps/backend && npm run dev
```

- [ ] **Step 2: Verify dev fallback logging**

Without `RESEND_API_KEY` set, trigger a magic link request and confirm that `[EMAIL] (dev)` log lines appear in the console instead of `[AUTH]` placeholder lines.

- [ ] **Step 3: Verify TypeScript build**

```bash
cd apps/backend && npm run build
```
Expected: clean build, no errors
