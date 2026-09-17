import { PG_ERROR_CODES, type Event, type EventWithOrganization } from '@acs/shared';
import { EventStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { adaptEvent, adaptEventWithOrganization } from '../adapters/events.adapter.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lifecycle = [
  EventStatus.DRAFT,
  EventStatus.AVAILABLE,
  EventStatus.SOLD_OUT,
  EventStatus.ON_GOING,
  EventStatus.FINISHED
];

export class EventConflictError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'EventConflictError';
  }
}

export async function getFutureEvents(): Promise<EventWithOrganization[]> {
  const events = await prisma.event.findMany({
    where: {
      isPublicVisible: true,
      dateTime: { gte: new Date() },
      eventStatus: { in: [EventStatus.AVAILABLE, EventStatus.SOLD_OUT] }
    },
    include: { organization: { select: { name: true } } },
    orderBy: { dateTime: 'asc' }
  });
  return events.map(adaptEventWithOrganization);
}

export async function getPastEvents(year?: number): Promise<Event[]> {
  const where: Record<string, unknown> = {
    isPublicVisible: true,
    dateTime: { lt: new Date() },
    eventStatus: { not: EventStatus.DRAFT }
  };
  if (year) where.year = year;
  return (await prisma.event.findMany({ where, orderBy: { dateTime: 'desc' } })).map(adaptEvent);
}

export async function getEventsByOrganization(
  organizationId: string,
  filter?: 'all' | 'future' | 'past'
): Promise<Event[]> {
  const where: Record<string, unknown> = { organizationId };
  if (filter === 'future') where.dateTime = { gte: new Date() };
  else if (filter === 'past') where.dateTime = { lt: new Date() };
  return (await prisma.event.findMany({ where, orderBy: { dateTime: 'desc' } })).map(adaptEvent);
}

export async function getEventById(id: string, includePrivate = false): Promise<EventWithOrganization | null> {
  if (!uuidPattern.test(id)) return null;
  const event = await prisma.event.findFirst({
    where: { id, ...(includePrivate ? {} : { isPublicVisible: true, eventStatus: { not: EventStatus.DRAFT } }) },
    include: { organization: { select: { name: true } } }
  });
  return event ? adaptEventWithOrganization(event) : null;
}

export async function createEvent(data: {
  name: string;
  dateTime: string;
  timeZone: string;
  year: number;
  country: string;
  state: string;
  city?: string;
  description?: string;
  createdBy: string;
  organizationId?: string;
}): Promise<Event> {
  const event = await prisma.event.create({
    data: {
      name: data.name,
      dateTime: new Date(data.dateTime),
      timeZone: data.timeZone,
      year: data.year,
      country: data.country,
      state: data.state,
      city: data.city ?? null,
      description: data.description ?? null,
      createdBy: data.createdBy,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptEvent(event);
}

export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    dateTime: string;
    timeZone: string;
    eventStatus: string;
    year: number;
    country: string;
    state: string;
    city: string | null;
    isPublicVisible: boolean;
  }>
): Promise<Event | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return null;
  if (data.eventStatus && data.eventStatus !== event.eventStatus) {
    const currentIndex = lifecycle.indexOf(event.eventStatus);
    const nextIndex = lifecycle.indexOf(data.eventStatus as EventStatus);
    if (nextIndex !== currentIndex + 1) throw new EventConflictError(PG_ERROR_CODES.INVALID_EVENT_TRANSITION);
  }
  const nextStatus = (data.eventStatus as EventStatus | undefined) ?? event.eventStatus;
  if (data.isPublicVisible === true && nextStatus === EventStatus.DRAFT) {
    throw new EventConflictError(PG_ERROR_CODES.INVALID_EVENT_TRANSITION);
  }
  const updateData: Record<string, unknown> = { ...data };
  if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
  try {
    return adaptEvent(await prisma.event.update({ where: { id, eventStatus: event.eventStatus }, data: updateData }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new EventConflictError(PG_ERROR_CODES.INVALID_EVENT_TRANSITION);
    }
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; errorCode?: string }> {
  return prisma.$transaction(async (tx) => {
    // Lock the parent before its races so publication and new race/result writes
    // cannot invalidate deletion eligibility. FK inserts require conflicting key-share locks.
    await tx.$queryRaw`SELECT id FROM events WHERE id = ${id} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM races WHERE event_id = ${id} ORDER BY id FOR UPDATE`;
    const event = await tx.event.findUnique({
      where: { id },
      include: { races: { select: { _count: { select: { results: true } } } } }
    });
    if (!event) return { success: false, errorCode: 'NOT_FOUND' };
    if (event.eventStatus !== EventStatus.DRAFT) return { success: false, errorCode: 'NOT_DRAFT' };
    if (event.races.some((race) => race._count.results > 0)) {
      return { success: false, errorCode: PG_ERROR_CODES.EVENT_HAS_RESULTS };
    }
    await tx.race.deleteMany({ where: { eventId: id } });
    await tx.event.delete({ where: { id } });
    return { success: true };
  });
}
