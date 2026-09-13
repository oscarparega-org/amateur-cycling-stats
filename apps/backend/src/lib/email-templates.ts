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
    `
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
    `
  };
}

export function verificationEmail(url: string) {
  return {
    subject: 'Verify your email — Amateur Cycling Stats',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Confirm your email address to finish creating your account.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
          Verify email
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">If you didn't create this account, you can safely ignore this email.</p>
      </div>
    `
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
    `
  };
}
