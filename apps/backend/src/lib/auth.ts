import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { prisma } from './prisma.js';
import { sendEmail, consumePendingInvitation } from './email.js';
import { resetPasswordEmail, magicLinkEmail, invitationEmail, verificationEmail } from './email-templates.js';
import { loadAuthEnvironment, type AuthEnvironment } from './env.js';
import type { PrismaClient } from '@prisma/client';

export type EmailSender = typeof sendEmail;

export function createAuth(options: {
  database?: PrismaClient;
  emailSender?: EmailSender;
  environment?: AuthEnvironment;
} = {}) {
  const database = options.database || prisma;
  const emailSender = options.emailSender || sendEmail;
  const environment = options.environment || loadAuthEnvironment();

  return betterAuth({
  baseURL: environment.betterAuthUrl,
  secret: environment.betterAuthSecret,
  database: prismaAdapter(database, { provider: 'postgresql' }),
  trustedOrigins: environment.trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await emailSender({ to: user.email, ...resetPasswordEmail(url) });
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await emailSender({ to: user.email, ...verificationEmail(url) });
    }
  },
  socialProviders: environment.googleClientId && environment.googleClientSecret ? {
    google: {
      clientId: environment.googleClientId,
      clientSecret: environment.googleClientSecret,
      requireEmailVerification: true
    }
  } : undefined,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      requireLocalEmailVerified: true,
      allowDifferentEmails: false
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const pending = consumePendingInvitation(email);
        if (pending) {
          await sendEmail({ to: email, ...invitationEmail(url, pending.organizationName) });
        } else {
          await sendEmail({ to: email, ...magicLinkEmail(url) });
        }
      }
    })
  ],
  user: {
    additionalFields: {
      firstName: { type: 'string', required: false },
      lastName: { type: 'string', required: false },
      roleId: { type: 'string', required: false },
      status: { type: 'string', required: false, defaultValue: 'ACTIVE' }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Inject CYCLIST roleId before DB insert
          const cyclistRole = await database.role.findUnique({ where: { name: 'CYCLIST' } });
          if (!cyclistRole) throw new Error('CYCLIST role not found in database');
          return {
            data: {
              ...user,
              roleId: user.roleId || cyclistRole.id,
              status: user.status || 'ACTIVE'
            }
          };
        },
        after: async (user) => {
          // Re-query to reliably access custom fields
          const dbUser = await database.user.findUnique({ where: { id: user.id } });
          if (!dbUser) return;

          const cyclistRole = await database.role.findUnique({ where: { name: 'CYCLIST' } });
          if (cyclistRole && dbUser.roleId === cyclistRole.id) {
            await database.cyclist.upsert({
              where: { userId: user.id },
              update: {},
              create: { userId: user.id }
            });
          }
        }
      }
    }
  }
  });
}

export const auth = createAuth();
