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
