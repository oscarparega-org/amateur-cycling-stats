import { Hono } from 'hono';
import * as cyclistsService from '../services/cyclists.service.js';
import { requireAuth, requireRole } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';
import { prisma } from '../lib/prisma.js';

const cyclists = new Hono();

// GET — public
cyclists.get('/:id', async (c) => {
  const cyclist = await cyclistsService.getCyclistById(c.req.param('id'));
  if (!cyclist) return c.json({ error: 'Not found' }, 404);
  return c.json(cyclist);
});

// POST — organizer (for unregistered cyclists) or admin
cyclists.post('/', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN, RoleTypeEnum.ORGANIZER]);
  const body = await c.req.json();
  if (!body.firstName) return c.json({ error: 'firstName is required' }, 400);
  // Create unregistered user + cyclist via service
  // (This will be implemented as a new service function)
  const cyclist = await cyclistsService.createUnregisteredCyclist(body);
  return c.json(cyclist, 201);
});

// PATCH — own profile, or organizer, or admin
cyclists.patch('/:id', async (c) => {
  const user = requireAuth(c);
  const cyclist = await prisma.cyclist.findUnique({ where: { id: c.req.param('id') } });
  if (!cyclist) return c.json({ error: 'Not found' }, 404);
  // Allow if own profile
  if (cyclist.userId !== user.id) {
    // Must be admin or organizer
    await requireRole(c, [RoleTypeEnum.ADMIN, RoleTypeEnum.ORGANIZER]);
  }
  const updated = await cyclistsService.updateCyclist(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

// DELETE — admin or organizer (unlinked only)
cyclists.delete('/:id', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN, RoleTypeEnum.ORGANIZER]);
  const deleted = await cyclistsService.deleteCyclist(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { cyclists };
