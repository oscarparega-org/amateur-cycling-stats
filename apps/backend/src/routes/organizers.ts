import { Hono } from 'hono';
import * as organizersService from '../services/organizers.service.js';

const organizers = new Hono();

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

organizers.patch('/:id', async (c) => {
  const body = await c.req.json();
  const organizer = await organizersService.updateOrganizer(c.req.param('id'), body);
  if (!organizer) return c.json({ error: 'Not found' }, 404);
  return c.json(organizer);
});

organizers.delete('/:id', async (c) => {
  const result = await organizersService.deleteOrganizer(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete last owner', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { organizers };
