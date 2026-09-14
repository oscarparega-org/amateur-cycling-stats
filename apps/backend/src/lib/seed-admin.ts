import type { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';

export type AdminSeedResult = 'created' | 'already-exists' | 'not-configured';

export interface AdminCredentials {
  email: string;
  password: string;
}

export function loadAdminCredentials(source: NodeJS.ProcessEnv = process.env): AdminCredentials | undefined {
  const email = source.ADMIN_USER?.trim().toLowerCase();
  const password = source.ADMIN_PASSWORD;

  if (!email && !password) return undefined;
  if (!email || !password) {
    throw new Error('ADMIN_USER and ADMIN_PASSWORD must be configured together');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('ADMIN_USER must be a valid email address');
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error('ADMIN_PASSWORD must contain between 8 and 128 characters');
  }

  return { email, password };
}

export async function seedAdminAccount(
  database: PrismaClient,
  source: NodeJS.ProcessEnv = process.env,
  hash: typeof hashPassword = hashPassword
): Promise<AdminSeedResult> {
  const credentials = loadAdminCredentials(source);
  if (!credentials) return 'not-configured';

  const existing = await database.user.findUnique({ where: { email: credentials.email }, select: { id: true } });
  if (existing) return 'already-exists';

  const adminRole = await database.role.findUniqueOrThrow({ where: { name: 'ADMIN' }, select: { id: true } });
  const password = await hash(credentials.password);

  try {
    return await database.$transaction(async (transaction: Prisma.TransactionClient) => {
      const concurrentlyCreated = await transaction.user.findUnique({
        where: { email: credentials.email },
        select: { id: true }
      });
      if (concurrentlyCreated) return 'already-exists';

      const user = await transaction.user.create({
        data: {
          email: credentials.email,
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          emailVerified: true,
          status: 'ACTIVE',
          roleId: adminRole.id
        },
        select: { id: true }
      });
      await transaction.account.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          issuer: 'local:credential',
          accountId: user.id,
          providerId: 'credential',
          password
        }
      });
      return 'created';
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const concurrentlyCreated = await database.user.findUnique({
        where: { email: credentials.email },
        select: { id: true }
      });
      if (concurrentlyCreated) return 'already-exists';
    }
    throw error;
  }
}
