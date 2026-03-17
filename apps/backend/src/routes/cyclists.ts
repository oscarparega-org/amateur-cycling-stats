import { Hono } from 'hono';
import * as cyclistsService from '../services/cyclists.service.js';

const cyclists = new Hono();

cyclists.get('/:id', async (c) => {
  const cyclist = await cyclistsService.getCyclistById(c.req.param('id'));
  if (!cyclist) return c.json({ error: 'Not found' }, 404);
  return c.json(cyclist);
});

export { cyclists };
