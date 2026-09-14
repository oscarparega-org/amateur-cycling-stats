import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { loadAdminCredentials, seedAdminAccount } from '../../src/lib/seed-admin.js';

function databaseMock(existingUser: { id: string } | null = null) {
  const transaction = {
    user: {
      findUnique: vi.fn().mockResolvedValue(existingUser),
      create: vi.fn().mockResolvedValue({ id: 'admin-id' })
    },
    account: { create: vi.fn().mockResolvedValue({}) }
  };
  const database = {
    user: { findUnique: vi.fn().mockResolvedValue(existingUser) },
    role: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'admin-role-id' }) },
    $transaction: vi.fn(async (operation: (client: typeof transaction) => Promise<unknown>) => operation(transaction))
  };

  return { database: database as unknown as PrismaClient, transaction, mocks: database };
}

describe('admin account seed', () => {
  it('does nothing when the optional credentials are absent', async () => {
    const { database, mocks } = databaseMock();

    await expect(seedAdminAccount(database, {})).resolves.toBe('not-configured');
    expect(mocks.user.findUnique).not.toHaveBeenCalled();
  });

  it('requires the username and password to be configured together', () => {
    expect(() => loadAdminCredentials({ ADMIN_USER: 'admin@example.com' })).toThrow(/configured together/);
    expect(() => loadAdminCredentials({ ADMIN_PASSWORD: 'password123' })).toThrow(/configured together/);
  });

  it('leaves an existing account unchanged', async () => {
    const { database, mocks } = databaseMock({ id: 'existing-admin' });
    const hash = vi.fn();

    await expect(
      seedAdminAccount(database, { ADMIN_USER: 'ADMIN@example.com', ADMIN_PASSWORD: 'password123' }, hash)
    ).resolves.toBe('already-exists');
    expect(hash).not.toHaveBeenCalled();
    expect(mocks.role.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(mocks.$transaction).not.toHaveBeenCalled();
  });

  it('creates a verified admin and credential account atomically', async () => {
    const { database, transaction } = databaseMock();
    const hash = vi.fn().mockResolvedValue('hashed-password');

    await expect(
      seedAdminAccount(database, { ADMIN_USER: ' Admin@Example.com ', ADMIN_PASSWORD: 'password123' }, hash)
    ).resolves.toBe('created');
    expect(transaction.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'admin@example.com',
        emailVerified: true,
        status: 'ACTIVE',
        roleId: 'admin-role-id'
      }),
      select: { id: true }
    });
    expect(transaction.account.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'admin-id',
        accountId: 'admin-id',
        issuer: 'local:credential',
        providerId: 'credential',
        password: 'hashed-password'
      })
    });
  });
});
