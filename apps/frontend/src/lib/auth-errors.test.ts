import { describe, expect, it } from 'vitest';
import { getAuthErrorMessage, getAuthQueryErrorMessage } from './auth-errors';

describe('authentication error messages', () => {
  it('translates known Better Auth error codes', () => {
    expect(getAuthErrorMessage({ code: 'EMAIL_NOT_VERIFIED' })).toContain('Verifica tu correo');
    expect(getAuthQueryErrorMessage('TOKEN_EXPIRED')).toContain('expiró');
  });

  it('does not expose unknown backend messages', () => {
    expect(getAuthErrorMessage({ code: 'UNKNOWN', message: 'internal detail' })).not.toContain('internal detail');
  });
});
