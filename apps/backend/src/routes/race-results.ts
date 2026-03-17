import { Hono } from 'hono';
import * as raceResultsService from '../services/race-results.service.js';
import { requireEventOrgMember } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';

const raceResults = new Hono();

// GET endpoints — public
raceResults.get('/', async (c) => {
  const raceId = c.req.query('raceId');
  const userId = c.req.query('userId');
  if (raceId) return c.json(await raceResultsService.getRaceResultsByRaceId(raceId));
  if (userId) return c.json(await raceResultsService.getRaceResultsByUserId(userId));
  return c.json({ error: 'raceId or userId query param is required' }, 400);
});

// Write endpoints — require event org membership or admin
raceResults.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.raceId || !body.cyclistId || body.place === undefined) {
    return c.json({ error: 'raceId, cyclistId, and place are required' }, 400);
  }
  // Look up race to get eventId for auth check
  const race = await prisma.race.findUnique({ where: { id: body.raceId } });
  if (!race) return c.json({ error: 'Race not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  try {
    const result = await raceResultsService.createRaceResult(body);
    return c.json(result, 201);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return c.json({ error: 'Result for this cyclist in this race already exists' }, 409);
    }
    throw err;
  }
});

raceResults.patch('/:id', async (c) => {
  const raceResult = await prisma.raceResult.findUnique({
    where: { id: c.req.param('id') },
    include: { race: true }
  });
  if (!raceResult) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, raceResult.race.eventId);
  const result = await raceResultsService.updateRaceResult(c.req.param('id'), await c.req.json());
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

raceResults.delete('/:id', async (c) => {
  const raceResult = await prisma.raceResult.findUnique({
    where: { id: c.req.param('id') },
    include: { race: true }
  });
  if (!raceResult) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, raceResult.race.eventId);
  const deleted = await raceResultsService.deleteRaceResult(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { raceResults };
