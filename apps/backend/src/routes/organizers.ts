import { Hono } from 'hono';
import * as organizersService from '../services/organizers.service.js';
import { requireOrgMember } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';

const organizers = new Hono();

// GET — public
organizers.get('/', async (c) => {
  const organizationId = c.req.query('organizationId');
  if (!organizationId) return c.json({ error: 'organizationId query param is required' }, 400);
  return c.json(await organizersService.getOrganizersByOrganizationId(organizationId));
});

organizers.get('/count', async (c) => {
  const organizationId = c.req.query('organizationId');
  if (!organizationId) return c.json({ error: 'organizationId query param is required' }, 400);
  const count = await organizersService.getOrganizersCountByOrganizationId(organizationId);
  return c.json({ count });
});

// PATCH — admin or organization member
organizers.patch('/:id', async (c) => {
  const organizer = await prisma.organizer.findUnique({ where: { id: c.req.param('id') } });
  if (!organizer) return c.json({ error: 'Not found' }, 404);
  await requireOrgMember(c, organizer.organizationId);
  const body = await c.req.json();
  const updated = await organizersService.updateOrganizer(c.req.param('id'), body);
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

// DELETE — admin or organization member (ACS01 protection in service)
organizers.delete('/:id', async (c) => {
  const organizer = await prisma.organizer.findUnique({ where: { id: c.req.param('id') } });
  if (!organizer) return c.json({ error: 'Not found' }, 404);
  await requireOrgMember(c, organizer.organizationId);
  const result = await organizersService.deleteOrganizer(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete last organizer', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { organizers };
