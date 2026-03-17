import { Hono } from 'hono';
import { requireAuth } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';
import { RoleTypeEnum } from '@acs/shared';

const authSetup = new Hono();

/**
 * POST /api/auth/complete-organizer-setup
 * Completes the organizer invitation flow after magic link authentication.
 * Body: { firstName, lastName, password, invitationId }
 */
authSetup.post('/complete-organizer-setup', async (c) => {
  const user = requireAuth(c);
  const body = await c.req.json();

  if (!body.firstName || !body.lastName || !body.password || !body.invitationId) {
    return c.json({ error: 'firstName, lastName, password, and invitationId are required' }, 400);
  }

  // Verify invitation exists and is pending
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { id: body.invitationId }
  });
  if (!invitation || invitation.status !== 'PENDING') {
    return c.json({ error: 'Invalid or expired invitation' }, 400);
  }
  if (invitation.email !== user.email) {
    return c.json({ error: 'Invitation email does not match authenticated user' }, 403);
  }

  // Determine role from invitation
  const roleName = invitation.roleType === 'ORGANIZER_OWNER'
    ? RoleTypeEnum.ORGANIZER_OWNER
    : RoleTypeEnum.ORGANIZER_STAFF;

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return c.json({ error: 'Role not found' }, 500);

  // Atomic transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update user profile
    await tx.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        name: `${body.firstName} ${body.lastName}`,
        roleId: role.id
      }
    });

    // 2. Create organizer record
    await tx.organizer.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId
      }
    });

    // 3. Accept invitation
    await tx.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    // 4. Create credential account with password
    // Hash password using Node.js built-in scrypt (same algorithm BetterAuth uses)
    const { scrypt, randomBytes } = await import('node:crypto');
    const { promisify } = await import('node:util');
    const scryptAsync = promisify(scrypt);
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(body.password, salt, 64) as Buffer;
    const hashedPassword = `${salt}:${derivedKey.toString('hex')}`;

    // Check if credential account already exists
    const existingCredential = await tx.account.findFirst({
      where: { userId: user.id, providerId: 'credential' }
    });
    if (!existingCredential) {
      await tx.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: hashedPassword
        }
      });
    }
  });

  // Remove cyclist record if one was auto-created during magic link signup
  await prisma.cyclist.deleteMany({ where: { userId: user.id } });

  // Return updated user
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });

  return c.json({
    id: updatedUser!.id,
    email: updatedUser!.email,
    firstName: updatedUser!.firstName,
    lastName: updatedUser!.lastName,
    role: updatedUser!.role!.name
  });
});

export { authSetup };
