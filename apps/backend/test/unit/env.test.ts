import { describe, expect, it } from 'vitest';
import { loadAuthEnvironment } from '../../src/lib/env.js';

const base = {
  NODE_ENV: 'test',
  BETTER_AUTH_SECRET: 'a-secure-test-secret-with-32-characters',
  BETTER_AUTH_URL: 'http://localhost:3000'
};

describe('loadAuthEnvironment', () => {
  it('normalizes and deduplicates trusted origins', () => {
    const env = loadAuthEnvironment({
      ...base,
      TRUSTED_ORIGINS: ' http://localhost:5173,https://app.example.com,http://localhost:5173 '
    });

    expect(env.trustedOrigins).toEqual(['http://localhost:5173', 'https://app.example.com']);
  });

  it('requires both Google credentials together', () => {
    expect(() => loadAuthEnvironment({ ...base, GOOGLE_CLIENT_ID: 'client-id' }))
      .toThrow('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  });

  it('requires Google and a strong auth secret in production', () => {
    expect(() => loadAuthEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'short',
      BETTER_AUTH_URL: 'https://app.example.com'
    })).toThrow('Google authentication requires');

    expect(() => loadAuthEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'short',
      BETTER_AUTH_URL: 'https://app.example.com',
      GOOGLE_CLIENT_ID: 'id',
      GOOGLE_CLIENT_SECRET: 'secret',
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'auth@example.com'
    })).toThrow('at least 32 characters');
  });

  it('requires transactional email configuration in production', () => {
    expect(() => loadAuthEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'a-secure-production-secret-32-characters',
      BETTER_AUTH_URL: 'https://app.example.com',
      GOOGLE_CLIENT_ID: 'id',
      GOOGLE_CLIENT_SECRET: 'secret'
    })).toThrow('RESEND_API_KEY and EMAIL_FROM');
  });
});
