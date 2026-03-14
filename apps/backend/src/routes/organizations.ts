import { Hono } from 'hono';
import * as orgService from '../services/organizations.service.js';

const organizations = new Hono();

organizations.get('/', async (c) => {
  const data = await orgService.getAllOrganizations();
  return c.json(data);
});

organizations.get('/:id', async (c) => {
  const org = await orgService.getOrganizationById(c.req.param('id'));
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

organizations.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const org = await orgService.createOrganization(body);
  return c.json(org, 201);
});

organizations.patch('/:id', async (c) => {
  const body = await c.req.json();
  const org = await orgService.updateOrganization(c.req.param('id'), body);
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

organizations.delete('/:id', async (c) => {
  const deleted = await orgService.deleteOrganization(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { organizations };
