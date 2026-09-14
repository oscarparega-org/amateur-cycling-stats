'use server';

import type { Event } from '@acs/shared';
import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { backendFetch } from '@/lib/backend';
import { localePath, translate, type Locale } from '@/lib/i18n';

export type EventFormState = { error?: string };

async function errorMessage(response: Response, locale: Locale): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error === 'Only draft events can be deleted')
      return translate(locale, 'Solo puedes eliminar eventos en borrador.');
    return body.error ?? translate(locale, 'No se pudo guardar el evento.');
  } catch {
    return translate(locale, 'No se pudo completar la operación.');
  }
}

function eventPayload(formData: FormData, locale: Locale) {
  const name = formData.get('name')?.toString().trim() ?? '';
  const dateTime = formData.get('dateTime')?.toString() ?? '';
  const country = formData.get('country')?.toString().trim() ?? '';
  const state = formData.get('state')?.toString().trim() ?? '';
  const city = formData.get('city')?.toString().trim() || undefined;
  const description = formData.get('description')?.toString().trim() || undefined;

  if (!name || !dateTime || !country || !state) {
    return { error: translate(locale, 'Completa el nombre, la fecha, el país y el estado.') } as const;
  }
  return { data: { name, dateTime, country, state, city, description } } as const;
}

export async function createEventAction(
  locale: Locale,
  organizationId: string,
  _previousState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = eventPayload(formData, locale);
  if ('error' in parsed) return { error: parsed.error };

  const response = await backendFetch('/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...parsed.data, organizationId })
  });
  if (!response.ok) return { error: await errorMessage(response, locale) };

  const event = (await response.json()) as Event;
  revalidatePath(localePath(locale, `/organizer/${organizationId}`));
  revalidatePath(localePath(locale, `/organizer/${organizationId}/events`));
  redirect(`${localePath(locale, `/organizer/${organizationId}/events/${event.id}`)}?notice=created` as Route);
}

export async function updateEventAction(
  locale: Locale,
  organizationId: string,
  eventId: string,
  _previousState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = eventPayload(formData, locale);
  if ('error' in parsed) return { error: parsed.error };

  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) return { error: await errorMessage(response, locale) };

  revalidatePath(localePath(locale, `/organizer/${organizationId}`));
  revalidatePath(localePath(locale, `/organizer/${organizationId}/events`));
  revalidatePath(localePath(locale, `/organizer/${organizationId}/events/${eventId}`));
  redirect(`${localePath(locale, `/organizer/${organizationId}/events/${eventId}`)}?notice=updated` as Route);
}

async function patchEvent(
  locale: Locale,
  organizationId: string,
  eventId: string,
  updates: Partial<Event>,
  notice: string
) {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok)
    redirect(`${localePath(locale, `/organizer/${organizationId}/events/${eventId}`)}?error=operation` as Route);
  revalidatePath(localePath(locale, `/organizer/${organizationId}`));
  revalidatePath(localePath(locale, `/organizer/${organizationId}/events`));
  revalidatePath(localePath(locale, `/organizer/${organizationId}/events/${eventId}`));
  redirect(`${localePath(locale, `/organizer/${organizationId}/events/${eventId}`)}?notice=${notice}` as Route);
}

export async function publishEventAction(locale: Locale, organizationId: string, eventId: string) {
  await patchEvent(locale, organizationId, eventId, { eventStatus: 'AVAILABLE', isPublicVisible: true }, 'published');
}

export async function toggleEventVisibilityAction(
  locale: Locale,
  organizationId: string,
  eventId: string,
  isPublicVisible: boolean
) {
  await patchEvent(locale, organizationId, eventId, { isPublicVisible }, isPublicVisible ? 'shown' : 'hidden');
}

export async function deleteEventAction(locale: Locale, organizationId: string, eventId: string) {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' });
  if (!response.ok)
    redirect(`${localePath(locale, `/organizer/${organizationId}/events/${eventId}`)}?error=delete` as Route);
  revalidatePath(localePath(locale, `/organizer/${organizationId}`));
  revalidatePath(localePath(locale, `/organizer/${organizationId}/events`));
  redirect(`${localePath(locale, `/organizer/${organizationId}/events`)}?notice=deleted` as Route);
}
