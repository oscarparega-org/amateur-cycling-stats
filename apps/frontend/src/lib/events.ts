import { cache } from 'react';
import type { EventWithOrganization } from '@acs/shared';
import { backendFetch } from './backend';

export class EventsApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'EventsApiError';
  }
}

async function readEventResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new EventsApiError('The events service returned an error.', response.status);
  }
  return (await response.json()) as T;
}

export async function getFutureEvents(): Promise<EventWithOrganization[]> {
  const response = await backendFetch('/api/events?type=future');
  return readEventResponse<EventWithOrganization[]>(response);
}

export const getEventById = cache(async (id: string): Promise<EventWithOrganization | null> => {
  const response = await backendFetch(`/api/events/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  return readEventResponse<EventWithOrganization>(response);
});
