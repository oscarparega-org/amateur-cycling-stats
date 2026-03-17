import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { prisma } from './prisma.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Placeholder — Resend integration in Phase 4
      console.log(`[AUTH] Password reset for ${user.email}: ${url}`);
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Placeholder — Resend integration in Phase 4
        console.log(`[AUTH] Magic link for ${email}: ${url}`);
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
          const cyclistRole = await prisma.role.findUnique({ where: { name: 'CYCLIST' } });
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
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          if (!dbUser) return;

          const cyclistRole = await prisma.role.findUnique({ where: { name: 'CYCLIST' } });
          if (cyclistRole && dbUser.roleId === cyclistRole.id) {
            await prisma.cyclist.create({ data: { userId: user.id } });
          }
        }
      }
    }
  }
});
