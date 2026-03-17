import { Hono } from 'hono';
import * as racesService from '../services/races.service.js';
import { requireEventOrgMember } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';

const races = new Hono();

// GET endpoints — public
races.get('/', async (c) => {
  const eventId = c.req.query('eventId');
  if (!eventId) return c.json({ error: 'eventId query param is required' }, 400);
  return c.json(await racesService.getRacesByEventId(eventId));
});

races.get('/:id', async (c) => {
  const race = await racesService.getRaceById(c.req.param('id'));
  if (!race) return c.json({ error: 'Not found' }, 404);
  return c.json(race);
});

// Write endpoints — require event org membership or admin
races.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.eventId || !body.raceCategoryAgeId || !body.raceCategoryGenderId || !body.raceCategoryDistanceId || !body.dateTime) {
    return c.json({ error: 'eventId, raceCategoryAgeId, raceCategoryGenderId, raceCategoryDistanceId, and dateTime are required' }, 400);
  }
  await requireEventOrgMember(c, body.eventId);
  try {
    const race = await racesService.createRace(body);
    return c.json(race, 201);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return c.json({ error: 'Race with this category combination already exists', code: 'ACS04' }, 409);
    }
    throw err;
  }
});

races.patch('/:id', async (c) => {
  const race = await prisma.race.findUnique({ where: { id: c.req.param('id') } });
  if (!race) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  const updated = await racesService.updateRace(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

races.delete('/:id', async (c) => {
  const race = await prisma.race.findUnique({ where: { id: c.req.param('id') } });
  if (!race) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  const deleted = await racesService.deleteRace(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { races };
