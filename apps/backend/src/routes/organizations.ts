import { Hono } from 'hono';
import { z } from 'zod';
import * as orgService from '../services/organizations.service.js';
import { requireRole, requireOrgMember } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';
import { atLeastOneField, parseJson } from '../lib/validation.js';

const organizations = new Hono();
const organizationName = z.string().trim().min(3).max(120);
const organizationDescription = z.string().trim().max(1_000).nullable().optional();

const createOrganizationSchema = z
  .object({
    name: organizationName,
    description: organizationDescription
  })
  .strict();

const updateOrganizationSchema = atLeastOneField({
  name: organizationName.optional(),
  description: organizationDescription,
  state: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

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
  const body = await parseJson(c, createOrganizationSchema);
  const org = await orgService.createOrganization({ ...body, state: 'INACTIVE' });
  return c.json(org, 201);
});

// PATCH — admin or organization member
organizations.patch('/:id', async (c) => {
  await requireOrgMember(c, c.req.param('id'));
  const body = await parseJson(c, updateOrganizationSchema);
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
