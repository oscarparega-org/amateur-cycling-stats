import type { Event } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptEvent } from '../adapters/events.adapter.js';

export async function getFutureEvents(): Promise<Event[]> {
  const events = await prisma.event.findMany({
    where: { isPublicVisible: true, dateTime: { gte: new Date() } },
    orderBy: { dateTime: 'asc' }
  });
  return events.map(adaptEvent);
}

export async function getPastEvents(year?: number): Promise<Event[]> {
  const where: Record<string, unknown> = {
    isPublicVisible: true,
    dateTime: { lt: new Date() }
  };
  if (year) where.year = year;
  const events = await prisma.event.findMany({
    where,
    orderBy: { dateTime: 'desc' }
  });
  return events.map(adaptEvent);
}

export async function getEventsByOrganization(
  organizationId: string,
  filter?: 'all' | 'future' | 'past'
): Promise<Event[]> {
  const where: Record<string, unknown> = { organizationId };
  if (filter === 'future') where.dateTime = { gte: new Date() };
  else if (filter === 'past') where.dateTime = { lt: new Date() };
  const events = await prisma.event.findMany({
    where,
    orderBy: { dateTime: 'desc' }
  });
  return events.map(adaptEvent);
}

// Note: The `Event` domain type has no `races` field. The spec mentions
// "event with races" but this is handled by fetching races separately
// via GET /api/races?eventId=xxx. This keeps the Event type flat.
export async function getEventById(id: string): Promise<Event | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? adaptEvent(event) : null;
}

export async function createEvent(data: {
  name: string;
  dateTime: string;
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
  const updateData: Record<string, unknown> = { ...data };
  if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
  const updated = await prisma.event.update({ where: { id }, data: updateData });
  return adaptEvent(updated);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return false;
  await prisma.event.delete({ where: { id } });
  return true;
}
