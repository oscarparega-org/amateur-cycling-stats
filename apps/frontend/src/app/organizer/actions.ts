'use server';

import type { Event } from '@acs/shared';
import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { backendFetch } from '@/lib/backend';

export type EventFormState = { error?: string };

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error === 'Only draft events can be deleted') return 'Solo puedes eliminar eventos en borrador.';
    return body.error ?? 'No se pudo guardar el evento.';
  } catch {
    return 'No se pudo completar la operación.';
  }
}

function eventPayload(formData: FormData) {
  const name = formData.get('name')?.toString().trim() ?? '';
  const dateTime = formData.get('dateTime')?.toString() ?? '';
  const country = formData.get('country')?.toString().trim() ?? '';
  const state = formData.get('state')?.toString().trim() ?? '';
  const city = formData.get('city')?.toString().trim() || undefined;
  const description = formData.get('description')?.toString().trim() || undefined;

  if (!name || !dateTime || !country || !state) {
    return { error: 'Completa el nombre, la fecha, el país y el estado.' } as const;
  }
  return { data: { name, dateTime, country, state, city, description } } as const;
}

export async function createEventAction(
  organizationId: string,
  _previousState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = eventPayload(formData);
  if ('error' in parsed) return { error: parsed.error };

  const response = await backendFetch('/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...parsed.data, organizationId })
  });
  if (!response.ok) return { error: await errorMessage(response) };

  const event = (await response.json()) as Event;
  revalidatePath(`/organizer/${organizationId}`);
  revalidatePath(`/organizer/${organizationId}/events`);
  redirect(`/organizer/${organizationId}/events/${event.id}?notice=created` as Route);
}

export async function updateEventAction(
  organizationId: string,
  eventId: string,
  _previousState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = eventPayload(formData);
  if ('error' in parsed) return { error: parsed.error };

  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) return { error: await errorMessage(response) };

  revalidatePath(`/organizer/${organizationId}`);
  revalidatePath(`/organizer/${organizationId}/events`);
  revalidatePath(`/organizer/${organizationId}/events/${eventId}`);
  redirect(`/organizer/${organizationId}/events/${eventId}?notice=updated` as Route);
}

async function patchEvent(organizationId: string, eventId: string, updates: Partial<Event>, notice: string) {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) redirect(`/organizer/${organizationId}/events/${eventId}?error=operation` as Route);
  revalidatePath(`/organizer/${organizationId}`);
  revalidatePath(`/organizer/${organizationId}/events`);
  revalidatePath(`/organizer/${organizationId}/events/${eventId}`);
  redirect(`/organizer/${organizationId}/events/${eventId}?notice=${notice}` as Route);
}

export async function publishEventAction(organizationId: string, eventId: string) {
  await patchEvent(organizationId, eventId, { eventStatus: 'AVAILABLE', isPublicVisible: true }, 'published');
}

export async function toggleEventVisibilityAction(organizationId: string, eventId: string, isPublicVisible: boolean) {
  await patchEvent(organizationId, eventId, { isPublicVisible }, isPublicVisible ? 'shown' : 'hidden');
}

export async function deleteEventAction(organizationId: string, eventId: string) {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' });
  if (!response.ok) redirect(`/organizer/${organizationId}/events/${eventId}?error=delete` as Route);
  revalidatePath(`/organizer/${organizationId}`);
  revalidatePath(`/organizer/${organizationId}/events`);
  redirect(`/organizer/${organizationId}/events?notice=deleted` as Route);
}
