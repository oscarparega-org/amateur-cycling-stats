import { Hono } from 'hono';
import * as orgService from '../services/organizations.service.js';
import { requireRole, requireOrgMember } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';

const organizations = new Hono();

// GET — public
organizations.get('/', async (c) => {
  const data = await orgService.getAllOrganizations();
  return c.json(data);
});

organizations.get('/:id', async (c) => {
  const org = await orgService.getOrganizationById(c.req.param('id'));
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

// POST — admin only
organizations.post('/', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN]);
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const org = await orgService.createOrganization(body);
  return c.json(org, 201);
});

// PATCH — admin or organization member
organizations.patch('/:id', async (c) => {
  await requireOrgMember(c, c.req.param('id'));
  const body = await c.req.json();
  const org = await orgService.updateOrganization(c.req.param('id'), body);
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

// DELETE — admin only
organizations.delete('/:id', async (c) => {
  await requireRole(c, [RoleTypeEnum.ADMIN]);
  const deleted = await orgService.deleteOrganization(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { organizations };
