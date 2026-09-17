import { Hono } from 'hono';
import { eventInstant, eventYear, isTimeZone, PG_ERROR_CODES, RoleTypeEnum } from '@acs/shared';
import { z } from 'zod';
import * as eventsService from '../services/events.service.js';
import {
  canManageEvent,
  requireAuth,
  requireEventOrgMember,
  requireOrgMember,
  requireRole
} from '../lib/auth-helpers.js';
import {
  atLeastOneField,
  dateTime,
  nullableOptionalText,
  optionalText,
  parseJson,
  RequestValidationError,
  shortText,
  uuid
} from '../lib/validation.js';

const events = new Hono();
const timeZone = z.string().max(100).refine(isTimeZone, 'Must be a valid IANA timezone');

const createEventSchema = z
  .object({
    name: shortText,
    localDateTime: dateTime,
    timeZone,
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
  localDateTime: dateTime.optional(),
  timeZone: timeZone.optional(),
  eventStatus: z.enum(['DRAFT', 'AVAILABLE', 'SOLD_OUT', 'ON_GOING', 'FINISHED']).optional(),
  country: shortText.optional(),
  state: shortText.optional(),
  city: z.string().trim().max(200).nullable().optional(),
  isPublicVisible: z.boolean().optional()
});

function normalizeDate(localDateTime: string, zone: string) {
  try {
    const instant = eventInstant(localDateTime, zone);
    return { dateTime: instant, year: eventYear(instant, zone) };
  } catch {
    throw new RequestValidationError([{ field: 'localDateTime', message: 'Must be valid in the selected timezone' }]);
  }
}

events.get('/', async (c) => {
  const type = c.req.query('type');
  if (type === 'past') {
    const year = c.req.query('year');
    if (year && !/^\d{4}$/.test(year)) return c.json({ error: 'year must be a four-digit number' }, 400);
    return c.json(await eventsService.getPastEvents(year ? Number(year) : undefined));
  }
  return c.json(await eventsService.getFutureEvents());
});

events.get('/management', async (c) => {
  const organizationId = c.req.query('organizationId');
  if (!organizationId) return c.json({ error: 'organizationId query param is required' }, 400);
  await requireOrgMember(c, organizationId);
  const parsedFilter = z.enum(['all', 'future', 'past']).optional().safeParse(c.req.query('filter'));
  if (!parsedFilter.success) return c.json({ error: 'filter must be all, future, or past' }, 400);
  const filter = parsedFilter.data;
  return c.json(await eventsService.getEventsByOrganization(organizationId, filter));
});

events.get('/:id', async (c) => {
  const id = c.req.param('id');
  const event = await eventsService.getEventById(id, await canManageEvent(c, id));
  return event ? c.json(event) : c.json({ error: 'Not found' }, 404);
});

events.post('/', async (c) => {
  const user = requireAuth(c);
  const body = await parseJson(c, createEventSchema);
  if (body.organizationId) await requireOrgMember(c, body.organizationId);
  else await requireRole(c, [RoleTypeEnum.ADMIN]);
  const normalized = normalizeDate(body.localDateTime, body.timeZone);
  const event = await eventsService.createEvent({
    name: body.name,
    description: body.description,
    country: body.country,
    state: body.state,
    city: body.city,
    organizationId: body.organizationId,
    timeZone: body.timeZone,
    ...normalized,
    createdBy: user.id
  });
  return c.json(event, 201);
});

events.patch('/:id', async (c) => {
  const id = c.req.param('id');
  await requireEventOrgMember(c, id);
  const body = await parseJson(c, updateEventSchema);
  const current = await eventsService.getEventById(id, true);
  if (!current) return c.json({ error: 'Not found' }, 404);
  const zone = body.timeZone ?? current.timeZone;
  const normalized = body.localDateTime
    ? normalizeDate(body.localDateTime, zone)
    : body.timeZone
      ? { year: eventYear(current.dateTime, zone) }
      : {};
  const updates = {
    name: body.name,
    description: body.description,
    country: body.country,
    state: body.state,
    city: body.city,
    timeZone: body.timeZone,
    eventStatus: body.eventStatus,
    isPublicVisible: body.isPublicVisible
  };
  try {
    const event = await eventsService.updateEvent(id, { ...updates, ...normalized });
    return event ? c.json(event) : c.json({ error: 'Not found' }, 404);
  } catch (error) {
    if (error instanceof eventsService.EventConflictError) {
      return c.json({ error: 'Invalid event lifecycle transition', code: error.code }, 409);
    }
    throw error;
  }
});

events.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await requireEventOrgMember(c, id);
  const event = await eventsService.getEventById(id, true);
  if (!event) return c.json({ error: 'Not found' }, 404);
  if (event.eventStatus !== 'DRAFT') return c.json({ error: 'Only draft events can be deleted' }, 409);
  const result = await eventsService.deleteEvent(id);
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode === 'NOT_DRAFT') return c.json({ error: 'Only draft events can be deleted' }, 409);
  if (result.errorCode === PG_ERROR_CODES.EVENT_HAS_RESULTS) {
    return c.json({ error: 'Events with race results cannot be deleted', code: result.errorCode }, 409);
  }
  return c.json({ success: true });
});

export { events };
