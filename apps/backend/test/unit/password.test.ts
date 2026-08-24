import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from 'better-auth/crypto';

describe('organizer credential hashing', () => {
  it('uses a hash accepted by Better Auth', async () => {
    const password = 'correct-horse-battery-staple';
    const hash = await hashPassword(password);

    await expect(verifyPassword({ hash, password })).resolves.toBe(true);
    await expect(verifyPassword({ hash, password: 'incorrect' })).resolves.toBe(false);
  });
});
