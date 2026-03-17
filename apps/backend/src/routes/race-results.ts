import { Hono } from 'hono';
import * as raceResultsService from '../services/race-results.service.js';

const raceResults = new Hono();

raceResults.get('/', async (c) => {
  const raceId = c.req.query('raceId');
  const userId = c.req.query('userId');
  if (raceId) return c.json(await raceResultsService.getRaceResultsByRaceId(raceId));
  if (userId) return c.json(await raceResultsService.getRaceResultsByUserId(userId));
  return c.json({ error: 'raceId or userId query param is required' }, 400);
});

raceResults.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.raceId || !body.cyclistId || body.place === undefined) {
    return c.json({ error: 'raceId, cyclistId, and place are required' }, 400);
  }
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
  const result = await raceResultsService.updateRaceResult(c.req.param('id'), await c.req.json());
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

raceResults.delete('/:id', async (c) => {
  const deleted = await raceResultsService.deleteRaceResult(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { raceResults };
