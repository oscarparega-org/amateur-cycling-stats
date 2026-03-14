import type { Event } from '@acs/shared';
import type { Event as PrismaEvent } from '@prisma/client';

export function adaptEvent(event: PrismaEvent): Event {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    dateTime: event.dateTime.toISOString(),
    year: event.year,
    city: event.city,
    state: event.state,
    country: event.country,
    eventStatus: event.eventStatus,
    organizationId: event.organizationId,
    createdBy: event.createdBy,
    isPublicVisible: event.isPublicVisible,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  };
}
