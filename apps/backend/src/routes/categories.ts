import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { RoleTypeEnum, PG_ERROR_CODES } from '@acs/shared';
import * as categoryService from '../services/categories.service.js';
import { requireEventOrgMember, requireOrgMember, requireRole } from '../lib/auth-helpers.js';
import { atLeastOneField, parseJson, shortText } from '../lib/validation.js';

const categoryTypeSchema = z.enum(['age', 'gender', 'distance']);
type CategoryType = z.infer<typeof categoryTypeSchema>;

const createAgeSchema = z
  .object({
    name: shortText,
    fromAge: z.number().int().min(0).max(150).optional(),
    toAge: z.number().int().min(0).max(150).optional()
  })
  .strict()
  .refine(({ fromAge, toAge }) => fromAge === undefined || toAge === undefined || fromAge <= toAge, {
    path: ['toAge'],
    message: 'Must be greater than or equal to fromAge'
  });
const updateAgeSchema = atLeastOneField({
  name: shortText.optional(),
  fromAge: z.number().int().min(0).max(150).nullable().optional(),
  toAge: z.number().int().min(0).max(150).nullable().optional()
});
const createGenderSchema = z.object({ name: shortText }).strict();
const updateGenderSchema = atLeastOneField({ name: shortText.optional() });
const createDistanceSchema = z
  .object({ name: shortText, distance: z.number().min(0.001).max(1_000).optional() })
  .strict();
const updateDistanceSchema = atLeastOneField({
  name: shortText.optional(),
  distance: z.number().min(0.001).max(1_000).nullable().optional()
});

type ScopeKind = 'global' | 'organization' | 'event';

function param(c: Context, name: string) {
  const value = c.req.param(name);
  if (!value) throw new Error(`Missing route parameter: ${name}`);
  return value;
}

function owner(c: Context, kind: ScopeKind): categoryService.CategoryOwner {
  if (kind === 'organization') return { scope: 'ORGANIZATION', organizationId: param(c, 'organizationId') };
  if (kind === 'event') return { scope: 'EVENT', eventId: param(c, 'eventId') };
  return { scope: 'GLOBAL' };
}

async function authorize(c: Context, kind: ScopeKind) {
  if (kind === 'organization') return requireOrgMember(c, param(c, 'organizationId'));
  if (kind === 'event') return requireEventOrgMember(c, param(c, 'eventId'));
  return requireRole(c, [RoleTypeEnum.ADMIN]);
}

function typeFrom(c: Context): CategoryType | null {
  const parsed = categoryTypeSchema.safeParse(c.req.param('type'));
  return parsed.success ? parsed.data : null;
}

function conflict(c: Context, error: unknown) {
  if (error instanceof categoryService.CategoryInputError) {
    return c.json(
      {
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        issues: [{ field: error.field, message: error.message }]
      },
      400
    );
  }
  if (!(error instanceof categoryService.CategoryConflictError)) throw error;
  const message =
    error.code === PG_ERROR_CODES.PROTECTED_CATEGORY
      ? 'Default categories cannot be modified'
      : 'A category with this name already exists in this scope';
  return c.json({ error: message, code: error.code }, 409);
}

function router(kind: ScopeKind) {
  const app = new Hono();

  if (kind === 'event') {
    app.get('/available', async (c) => {
      await requireEventOrgMember(c, param(c, 'eventId'));
      const result = await categoryService.getAvailableCategories(param(c, 'eventId'));
      return result ? c.json(result) : c.json({ error: 'Not found' }, 404);
    });
  }

  app.get('/:type', async (c) => {
    if (kind !== 'global') await authorize(c, kind);
    const type = typeFrom(c);
    if (!type) return c.json({ error: 'Not found' }, 404);
    const scope = owner(c, kind);
    if (type === 'age') return c.json(await categoryService.getAgeCategories(scope));
    if (type === 'gender') return c.json(await categoryService.getGenderCategories(scope));
    return c.json(await categoryService.getDistanceCategories(scope));
  });

  app.get('/:type/:categoryId', async (c) => {
    if (kind !== 'global') await authorize(c, kind);
    const type = typeFrom(c);
    if (!type) return c.json({ error: 'Not found' }, 404);
    const scope = owner(c, kind);
    const id = c.req.param('categoryId');
    const category =
      type === 'age'
        ? await categoryService.getAgeCategory(id, scope)
        : type === 'gender'
          ? await categoryService.getGenderCategory(id, scope)
          : await categoryService.getDistanceCategory(id, scope);
    return category ? c.json(category) : c.json({ error: 'Not found' }, 404);
  });

  app.post('/:type', async (c) => {
    await authorize(c, kind);
    const type = typeFrom(c);
    if (!type) return c.json({ error: 'Not found' }, 404);
    const scope = owner(c, kind);
    try {
      if (type === 'age')
        return c.json(await categoryService.createAgeCategory(scope, await parseJson(c, createAgeSchema)), 201);
      if (type === 'gender')
        return c.json(await categoryService.createGenderCategory(scope, await parseJson(c, createGenderSchema)), 201);
      return c.json(await categoryService.createDistanceCategory(scope, await parseJson(c, createDistanceSchema)), 201);
    } catch (error) {
      return conflict(c, error);
    }
  });

  app.patch('/:type/:categoryId', async (c) => {
    await authorize(c, kind);
    const type = typeFrom(c);
    if (!type) return c.json({ error: 'Not found' }, 404);
    const scope = owner(c, kind);
    const id = c.req.param('categoryId');
    try {
      const category =
        type === 'age'
          ? await categoryService.updateAgeCategory(id, scope, await parseJson(c, updateAgeSchema))
          : type === 'gender'
            ? await categoryService.updateGenderCategory(id, scope, await parseJson(c, updateGenderSchema))
            : await categoryService.updateDistanceCategory(id, scope, await parseJson(c, updateDistanceSchema));
      return category ? c.json(category) : c.json({ error: 'Not found' }, 404);
    } catch (error) {
      return conflict(c, error);
    }
  });

  app.delete('/:type/:categoryId', async (c) => {
    await authorize(c, kind);
    const type = typeFrom(c);
    if (!type) return c.json({ error: 'Not found' }, 404);
    const scope = owner(c, kind);
    const id = c.req.param('categoryId');
    const result =
      type === 'age'
        ? await categoryService.deleteAgeCategory(id, scope)
        : type === 'gender'
          ? await categoryService.deleteGenderCategory(id, scope)
          : await categoryService.deleteDistanceCategory(id, scope);
    if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
    if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
    return c.json({ success: true });
  });

  return app;
}

export const categories = router('global');
export const organizationCategories = router('organization');
export const eventCategories = router('event');
