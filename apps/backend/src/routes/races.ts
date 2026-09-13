import { Hono } from 'hono';
import { z } from 'zod';
import * as racesService from '../services/races.service.js';
import { canManageEvent, canManageRace, requireEventOrgMember } from '../lib/auth-helpers.js';
import { prisma } from '../lib/prisma.js';
import {
  atLeastOneField,
  dateTime,
  nullableOptionalText,
  optionalText,
  parseJson,
  shortText,
  uuid
} from '../lib/validation.js';

const races = new Hono();

const createRaceSchema = z
  .object({
    eventId: uuid,
    raceCategoryAgeId: uuid,
    raceCategoryGenderId: uuid,
    raceCategoryDistanceId: uuid,
    dateTime,
    name: shortText.optional(),
    description: optionalText
  })
  .strict();

const updateRaceSchema = atLeastOneField({
  name: z.string().trim().max(200).nullable().optional(),
  description: nullableOptionalText,
  dateTime: dateTime.optional(),
  raceCategoryAgeId: uuid.optional(),
  raceCategoryGenderId: uuid.optional(),
  raceCategoryDistanceId: uuid.optional(),
  isPublicVisible: z.boolean().optional()
});

// GET endpoints — public
races.get('/', async (c) => {
  const eventId = c.req.query('eventId');
  if (!eventId) return c.json({ error: 'eventId query param is required' }, 400);
  return c.json(await racesService.getRacesByEventId(eventId, await canManageEvent(c, eventId)));
});

races.get('/:id', async (c) => {
  const id = c.req.param('id');
  const race = await racesService.getRaceById(id, await canManageRace(c, id));
  if (!race) return c.json({ error: 'Not found' }, 404);
  return c.json(race);
});

// Write endpoints — require event org membership or admin
races.post('/', async (c) => {
  const body = await parseJson(c, createRaceSchema);
  await requireEventOrgMember(c, body.eventId);
  try {
    const race = await racesService.createRace(body);
    return c.json(race, 201);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return c.json({ error: 'Race with this category combination already exists', code: 'ACS04' }, 409);
    }
    throw err;
  }
});

races.patch('/:id', async (c) => {
  const race = await prisma.race.findUnique({ where: { id: c.req.param('id') } });
  if (!race) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  const updated = await racesService.updateRace(c.req.param('id'), await parseJson(c, updateRaceSchema));
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

races.delete('/:id', async (c) => {
  const race = await prisma.race.findUnique({ where: { id: c.req.param('id') } });
  if (!race) return c.json({ error: 'Not found' }, 404);
  await requireEventOrgMember(c, race.eventId);
  const deleted = await racesService.deleteRace(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { races };
