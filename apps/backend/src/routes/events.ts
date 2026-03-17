import { Hono } from 'hono';
import * as eventsService from '../services/events.service.js';
import { requireAuth, requireOrgMember, requireEventOrgMember } from '../lib/auth-helpers.js';

const events = new Hono();

// GET endpoints — public
events.get('/', async (c) => {
  const type = c.req.query('type');
  const organizationId = c.req.query('organizationId');

  if (organizationId) {
    const filter = (c.req.query('filter') as 'all' | 'future' | 'past') || undefined;
    return c.json(await eventsService.getEventsByOrganization(organizationId, filter));
  }
  if (type === 'future') return c.json(await eventsService.getFutureEvents());
  if (type === 'past') {
    const year = c.req.query('year');
    return c.json(await eventsService.getPastEvents(year ? parseInt(year, 10) : undefined));
  }
  return c.json(await eventsService.getFutureEvents());
});

events.get('/:id', async (c) => {
  const event = await eventsService.getEventById(c.req.param('id'));
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

// Write endpoints — require org membership or admin
events.post('/', async (c) => {
  requireAuth(c); // Always require auth for event creation
  const body = await c.req.json();
  if (!body.name || !body.dateTime || !body.year || !body.country || !body.state || !body.createdBy) {
    return c.json({ error: 'name, dateTime, year, country, state, and createdBy are required' }, 400);
  }
  if (body.organizationId) {
    await requireOrgMember(c, body.organizationId);
  }
  const event = await eventsService.createEvent(body);
  return c.json(event, 201);
});

events.patch('/:id', async (c) => {
  await requireEventOrgMember(c, c.req.param('id'));
  const event = await eventsService.updateEvent(c.req.param('id'), await c.req.json());
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

events.delete('/:id', async (c) => {
  await requireEventOrgMember(c, c.req.param('id'));
  const deleted = await eventsService.deleteEvent(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { events };
