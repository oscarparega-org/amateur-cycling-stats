import { Hono } from 'hono';
import * as invitationsService from '../services/invitations.service.js';
import { requireAuth, requireOrgOwner, isAdmin, getAuthUser } from '../lib/auth-helpers.js';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { setPendingInvitation } from '../lib/email.js';

const invitations = new Hono();

// GET — auth required
invitations.get('/', async (c) => {
  const organizationId = c.req.query('organizationId');
  const email = c.req.query('email');

  if (organizationId) {
    await requireOrgOwner(c, organizationId);
    return c.json(await invitationsService.getInvitationsByOrganizationId(organizationId));
  }
  if (email) {
    const user = requireAuth(c);
    // Can only query own email unless admin
    const admin = await isAdmin(c);
    if (!admin && user.email !== email) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    const invitation = await invitationsService.getInvitationByEmail(email);
    return c.json(invitation);
  }
  return c.json({ error: 'organizationId or email query param is required' }, 400);
});

// POST — admin or org owner, then trigger magic link
invitations.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.organizationId || !body.email || !body.invitedByUserId || !body.roleType) {
    return c.json({ error: 'organizationId, email, invitedByUserId, and roleType are required' }, 400);
  }
  await requireOrgOwner(c, body.organizationId);

  // Create invitation record
  const invitation = await invitationsService.createInvitation(body);

  // Look up organization name for the invitation email
  const org = await prisma.organization.findUnique({ where: { id: body.organizationId } });

  // Set pending invitation context so the magic link callback sends the branded email
  setPendingInvitation(body.email, { organizationName: org?.name ?? 'an organization' });

  // Trigger BetterAuth magic link for the invited email
  try {
    await auth.api.signInMagicLink({
      body: {
        email: body.email,
        callbackURL: '/aceptar-invitacion',
        newUserCallbackURL: '/aceptar-invitacion',
        errorCallbackURL: '/error-autenticacion'
      },
      headers: c.req.raw.headers
    });
    // Update invitation tracking fields
    await invitationsService.updateInvitation(invitation.id, {
      retryCount: invitation.retryCount + 1,
    });
  } catch (err) {
    console.error('[AUTH] Failed to send magic link:', err);
    // Invitation is created even if magic link fails — can be resent later
  }

  return c.json(invitation, 201);
});

// PATCH — admin, org owner, or invited user (accept only)
invitations.patch('/:id', async (c) => {
  const user = requireAuth(c);
  const existing = await prisma.organizationInvitation.findUnique({ where: { id: c.req.param('id') } });
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const admin = await isAdmin(c);
  const isInvitedUser = user.email === existing.email;
  if (!admin && !isInvitedUser) {
    // Check if org owner
    try { await requireOrgOwner(c, existing.organizationId); } catch {
      return c.json({ error: 'Forbidden' }, 403);
    }
  }

  const invitation = await invitationsService.updateInvitation(c.req.param('id'), await c.req.json());
  if (!invitation) return c.json({ error: 'Not found' }, 404);
  return c.json(invitation);
});

// DELETE — admin, org owner, or invited user (reject)
invitations.delete('/:id', async (c) => {
  const user = requireAuth(c);
  const existing = await prisma.organizationInvitation.findUnique({ where: { id: c.req.param('id') } });
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const admin = await isAdmin(c);
  const isInvitedUser = user.email === existing.email;
  if (!admin && !isInvitedUser) {
    try { await requireOrgOwner(c, existing.organizationId); } catch {
      return c.json({ error: 'Forbidden' }, 403);
    }
  }

  const deleted = await invitationsService.deleteInvitation(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { invitations };
