import { Hono } from 'hono';
import { RoleTypeEnum } from '@acs/shared';
import { z } from 'zod';
import * as eventsService from '../services/events.service.js';
import {
  canManageEvent,
  canManageOrganization,
  requireAuth,
  requireOrgMember,
  requireEventOrgMember,
  requireRole
} from '../lib/auth-helpers.js';
import {
  atLeastOneField,
  dateTime,
  nullableOptionalText,
  optionalText,
  parseJson,
  shortText,
  uuid
} from '../lib/validation.js';

const events = new Hono();

const createEventSchema = z
  .object({
    name: shortText,
    dateTime,
    year: z.number().int().min(1800).max(2200),
    country: shortText,
    state: shortText,
    city: z.string().trim().max(200).optional(),
    description: optionalText,
    organizationId: uuid.optional()
  })
  .strict();

const updateEventSchema = atLeastOneField({
  name: shortText.optional(),
  description: nullableOptionalText,
  dateTime: dateTime.optional(),
  eventStatus: z.enum(['DRAFT', 'AVAILABLE', 'SOLD_OUT', 'ON_GOING', 'FINISHED']).optional(),
  year: z.number().int().min(1800).max(2200).optional(),
  country: shortText.optional(),
  state: shortText.optional(),
  city: z.string().trim().max(200).nullable().optional(),
  isPublicVisible: z.boolean().optional()
});

// GET endpoints — public
events.get('/', async (c) => {
  const type = c.req.query('type');
  const organizationId = c.req.query('organizationId');

  if (organizationId) {
    const filter = (c.req.query('filter') as 'all' | 'future' | 'past') || undefined;
    const includePrivate = await canManageOrganization(c, organizationId);
    return c.json(await eventsService.getEventsByOrganization(organizationId, filter, includePrivate));
  }
  if (type === 'future') return c.json(await eventsService.getFutureEvents());
  if (type === 'past') {
    const year = c.req.query('year');
    return c.json(await eventsService.getPastEvents(year ? parseInt(year, 10) : undefined));
  }
  return c.json(await eventsService.getFutureEvents());
});

events.get('/:id', async (c) => {
  const id = c.req.param('id');
  const event = await eventsService.getEventById(id, await canManageEvent(c, id));
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

// Write endpoints — require org membership or admin
events.post('/', async (c) => {
  const user = requireAuth(c);
  const body = await parseJson(c, createEventSchema);
  if (body.organizationId) {
    await requireOrgMember(c, body.organizationId);
  } else {
    await requireRole(c, [RoleTypeEnum.ADMIN]);
  }
  const event = await eventsService.createEvent({ ...body, createdBy: user.id });
  return c.json(event, 201);
});

events.patch('/:id', async (c) => {
  await requireEventOrgMember(c, c.req.param('id'));
  const event = await eventsService.updateEvent(c.req.param('id'), await parseJson(c, updateEventSchema));
  if (!event) return c.json({ error: 'Not found' }, 404);
  return c.json(event);
});

events.delete('/:id', async (c) => {
  await requireEventOrgMember(c, c.req.param('id'));
  const deleted = await eventsService.deleteEvent(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { events };
