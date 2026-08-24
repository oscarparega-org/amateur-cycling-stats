export interface AuthEnvironment {
  nodeEnv: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  trustedOrigins: string[];
  googleClientId?: string;
  googleClientSecret?: string;
  resendApiKey?: string;
  emailFrom?: string;
}

function required(source: NodeJS.ProcessEnv, name: string, fallback?: string): string {
  const value = source[name] || fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function loadAuthEnvironment(source: NodeJS.ProcessEnv = process.env): AuthEnvironment {
  const nodeEnv = source.NODE_ENV || 'development';
  const betterAuthSecret = required(
    source,
    'BETTER_AUTH_SECRET',
    nodeEnv === 'production' ? undefined : 'development-only-change-me-32-characters'
  );
  const betterAuthUrl = required(source, 'BETTER_AUTH_URL', 'http://localhost:3000');
  const origins = source.TRUSTED_ORIGINS || source.FRONTEND_URL || 'http://localhost:5173';
  const trustedOrigins = [...new Set(origins.split(',').map((origin) => origin.trim()).filter(Boolean))];
  const googleClientId = source.GOOGLE_CLIENT_ID?.trim() || undefined;
  const googleClientSecret = source.GOOGLE_CLIENT_SECRET?.trim() || undefined;
  const resendApiKey = source.RESEND_API_KEY?.trim() || undefined;
  const emailFrom = source.EMAIL_FROM?.trim() || undefined;

  if ((googleClientId && !googleClientSecret) || (!googleClientId && googleClientSecret)) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together');
  }
  if (nodeEnv === 'production' && (!googleClientId || !googleClientSecret)) {
    throw new Error('Google authentication requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in production');
  }
  if (nodeEnv === 'production' && (!resendApiKey || !emailFrom)) {
    throw new Error('Authentication email requires RESEND_API_KEY and EMAIL_FROM in production');
  }
  if (betterAuthSecret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters');
  }

  return {
    nodeEnv,
    betterAuthSecret,
    betterAuthUrl,
    trustedOrigins,
    googleClientId,
    googleClientSecret,
    resendApiKey,
    emailFrom
  };
}
