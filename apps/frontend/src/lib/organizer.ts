import 'server-only';

import { cache } from 'react';
import type { Event, Organization } from '@acs/shared';
import { backendFetch } from './backend';

export type EventFilter = 'all' | 'future' | 'past';

async function responseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export const getOrganizerOrganizations = cache(async (): Promise<Organization[]> => {
  const response = await backendFetch('/api/organizers/me');
  if (!response.ok) throw new Error(await responseError(response));
  const body = (await response.json()) as { organizations: Organization[] };
  return body.organizations;
});

export const getOrganization = cache(async (organizationId: string): Promise<Organization | null> => {
  const response = await backendFetch(`/api/organizations/${encodeURIComponent(organizationId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await responseError(response));
  return (await response.json()) as Organization;
});

export async function getOrganizationEvents(organizationId: string, filter: EventFilter): Promise<Event[]> {
  const query = new URLSearchParams({ organizationId });
  if (filter !== 'all') query.set('filter', filter);
  const response = await backendFetch(`/api/events?${query.toString()}`);
  if (!response.ok) throw new Error(await responseError(response));
  return (await response.json()) as Event[];
}

export async function getOrganizationEvent(organizationId: string, eventId: string): Promise<Event | null> {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await responseError(response));
  const event = (await response.json()) as Event;
  return event.organizationId === organizationId ? event : null;
}
