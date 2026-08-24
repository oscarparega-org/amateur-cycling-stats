export interface Env {
  DATABASE_URL: string;
  PORT: string;
  FRONTEND_URL: string;
  TRUSTED_ORIGINS?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}
