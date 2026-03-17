import { Hono } from 'hono';
import * as invitationsService from '../services/invitations.service.js';

const invitations = new Hono();

invitations.get('/', async (c) => {
  const organizationId = c.req.query('organizationId');
  const email = c.req.query('email');
  if (organizationId) return c.json(await invitationsService.getInvitationsByOrganizationId(organizationId));
  if (email) {
    const invitation = await invitationsService.getInvitationByEmail(email);
    return c.json(invitation); // Returns null with 200 if no pending invitation found
  }
  return c.json({ error: 'organizationId or email query param is required' }, 400);
});

invitations.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.organizationId || !body.email || !body.invitedByUserId || !body.roleType) {
    return c.json({ error: 'organizationId, email, invitedByUserId, and roleType are required' }, 400);
  }
  const invitation = await invitationsService.createInvitation(body);
  return c.json(invitation, 201);
});

invitations.patch('/:id', async (c) => {
  const invitation = await invitationsService.updateInvitation(c.req.param('id'), await c.req.json());
  if (!invitation) return c.json({ error: 'Not found' }, 404);
  return c.json(invitation);
});

invitations.delete('/:id', async (c) => {
  const deleted = await invitationsService.deleteInvitation(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { invitations };
