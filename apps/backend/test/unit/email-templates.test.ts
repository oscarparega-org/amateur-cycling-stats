import { describe, expect, it } from 'vitest';
import { invitationEmail, resetPasswordEmail, verificationEmail } from '../../src/lib/email-templates.js';

describe('authentication email templates', () => {
  it('includes the verification URL', () => {
    const url = 'https://app.example.com/api/auth/verify-email?token=abc';
    const message = verificationEmail(url);
    expect(message.subject).toContain('Verify');
    expect(message.html).toContain(url);
  });

  it('includes the reset URL without exposing credentials', () => {
    const url = 'https://app.example.com/reset-password?token=abc';
    const message = resetPasswordEmail(url);
    expect(message.subject).toContain('Reset');
    expect(message.html).toContain(url);
    expect(message.html).not.toContain('password123');
  });

  it('includes invitation context and URL', () => {
    const message = invitationEmail('https://app.example.com/invite', 'Pedal Norte');
    expect(message.subject).toContain('Pedal Norte');
    expect(message.html).toContain('https://app.example.com/invite');
  });
});
