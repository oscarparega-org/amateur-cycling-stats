import { Hono, type Context } from 'hono';
import { z } from 'zod';
import * as catService from '../services/categories.service.js';
import { requireOrgMember, requireRole } from '../lib/auth-helpers.js';
import { RoleTypeEnum } from '@acs/shared';
import { atLeastOneField, parseJson, shortText, uuid } from '../lib/validation.js';

const categories = new Hono();

const createAgeCategorySchema = z
  .object({
    name: shortText,
    fromAge: z.number().int().min(0).max(150).optional(),
    toAge: z.number().int().min(0).max(150).optional(),
    organizationId: uuid.optional()
  })
  .strict()
  .refine(
    ({ fromAge, toAge }) => fromAge === undefined || toAge === undefined || fromAge <= toAge,
    'fromAge must be less than or equal to toAge'
  );
const updateAgeCategorySchema = atLeastOneField({
  name: shortText.optional(),
  fromAge: z.number().int().min(0).max(150).nullable().optional(),
  toAge: z.number().int().min(0).max(150).nullable().optional()
});
const createGenderCategorySchema = z.object({ name: shortText, organizationId: uuid.optional() }).strict();
const updateGenderCategorySchema = atLeastOneField({ name: shortText.optional() });
const createDistanceCategorySchema = z
  .object({
    name: shortText,
    distance: z.number().nonnegative().max(100_000).optional(),
    organizationId: uuid.optional()
  })
  .strict();
const updateDistanceCategorySchema = atLeastOneField({
  name: shortText.optional(),
  distance: z.number().nonnegative().max(100_000).nullable().optional()
});

// Helper: check auth for category write operations
async function requireCategoryWriteAuth(c: Context, organizationId?: string) {
  if (!organizationId) {
    // Global category — admin only
    await requireRole(c, [RoleTypeEnum.ADMIN]);
  } else {
    // Org-scoped category — admin or organization member
    await requireOrgMember(c, organizationId);
  }
}

// === Age ===
categories.get('/age', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getAgeCategories(organizationId || undefined));
});

categories.post('/age', async (c) => {
  const body = await parseJson(c, createAgeCategorySchema);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createAgeCategory(body);
  return c.json(cat, 201);
});

categories.patch('/age/:id', async (c) => {
  const cat = await catService.getAgeCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateAgeCategory(c.req.param('id'), await parseJson(c, updateAgeCategorySchema));
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
  const body = await parseJson(c, createGenderCategorySchema);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createGenderCategory(body);
  return c.json(cat, 201);
});

categories.patch('/gender/:id', async (c) => {
  const cat = await catService.getGenderCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateGenderCategory(
    c.req.param('id'),
    await parseJson(c, updateGenderCategorySchema)
  );
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
  const body = await parseJson(c, createDistanceCategorySchema);
  await requireCategoryWriteAuth(c, body.organizationId);
  const cat = await catService.createDistanceCategory(body);
  return c.json(cat, 201);
});

categories.patch('/distance/:id', async (c) => {
  const cat = await catService.getDistanceCategoryRaw(c.req.param('id'));
  if (!cat) return c.json({ error: 'Not found' }, 404);
  await requireCategoryWriteAuth(c, cat.organizationId ?? undefined);
  const updated = await catService.updateDistanceCategory(
    c.req.param('id'),
    await parseJson(c, updateDistanceCategorySchema)
  );
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
