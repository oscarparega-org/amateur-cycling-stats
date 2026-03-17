import { Hono } from 'hono';
import * as catService from '../services/categories.service.js';
import { requireRole, requireOrgOwner, isAdmin } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';

const categories = new Hono();

// Helper: check auth for category write operations
async function requireCategoryWriteAuth(c: import('hono').Context, organizationId?: string) {
  if (!organizationId) {
    // Global category — admin only
    await requireRole(c, [RoleTypeEnum.ADMIN]);
  } else {
    // Org-scoped category — admin or org owner
    await requireOrgOwner(c, organizationId);
  }
}

// === Age ===
categories.get('/age', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getAgeCategories(organizationId || undefined));
});

categories.post('/age', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createAgeCategory(body);
  return c.json(cat, 201);
});

categories.patch('/age/:id', async (c) => {
  const cat = await catService.getAgeCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateAgeCategory(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

categories.delete('/age/:id', async (c) => {
  const cat = await catService.getAgeCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const result = await catService.deleteAgeCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

// === Gender ===
categories.get('/gender', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getGenderCategories(organizationId || undefined));
});

categories.post('/gender', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createGenderCategory(body);
  return c.json(cat, 201);
});

categories.patch('/gender/:id', async (c) => {
  const cat = await catService.getGenderCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateGenderCategory(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

categories.delete('/gender/:id', async (c) => {
  const cat = await catService.getGenderCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const result = await catService.deleteGenderCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

// === Distance ===
categories.get('/distance', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getDistanceCategories(organizationId || undefined));
});

categories.post('/distance', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createDistanceCategory(body);
  return c.json(cat, 201);
});

categories.patch('/distance/:id', async (c) => {
  const cat = await catService.getDistanceCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateDistanceCategory(c.req.param('id'), await c.req.json());
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

categories.delete('/distance/:id', async (c) => {
  const cat = await catService.getDistanceCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const result = await catService.deleteDistanceCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { categories };
