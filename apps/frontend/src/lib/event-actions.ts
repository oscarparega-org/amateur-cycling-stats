'use server';

import type { Event } from '@acs/shared';
import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { backendFetch } from './backend';
import { localePath, translate, type Locale } from './i18n';

export type EventFormState = { error?: string };

async function errorMessage(response: Response, locale: Locale) {
  try {
    const body = (await response.json()) as { code?: string; error?: string };
    if (body.code === 'ACS07') return translate(locale, 'No puedes eliminar un evento con resultados registrados.');
    if (body.code === 'ACS08') return translate(locale, 'El cambio de estado no sigue el orden permitido.');
    if (body.error === 'Only draft events can be deleted')
      return translate(locale, 'Solo puedes eliminar eventos en borrador.');
    return body.error ?? translate(locale, 'No se pudo guardar el evento.');
  } catch {
    return translate(locale, 'No se pudo completar la operación.');
  }
}

function eventPayload(formData: FormData, locale: Locale) {
  const name = formData.get('name')?.toString().trim() ?? '';
  const localDateTime = formData.get('localDateTime')?.toString() ?? '';
  const timeZone = formData.get('timeZone')?.toString().trim() ?? '';
  const country = formData.get('country')?.toString().trim() ?? '';
  const state = formData.get('state')?.toString().trim() ?? '';
  const city = formData.get('city')?.toString().trim() || undefined;
  const description = formData.get('description')?.toString().trim() || undefined;
  if (!name || !localDateTime || !timeZone || !country || !state) {
    return { error: translate(locale, 'Completa el nombre, la fecha, la zona horaria, el país y el estado.') } as const;
  }
  return { data: { name, localDateTime, timeZone, country, state, city, description } } as const;
}

function refresh(locale: Locale, basePath: string, eventId?: string) {
  revalidatePath(localePath(locale, basePath));
  if (eventId) revalidatePath(localePath(locale, `${basePath}/${eventId}`));
}

export async function createEventAction(
  locale: Locale,
  organizationId: string,
  basePath: string,
  _state: EventFormState,
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
  refresh(locale, basePath, event.id);
  redirect(`${localePath(locale, `${basePath}/${event.id}`)}?notice=created` as Route);
}

export async function updateEventAction(
  locale: Locale,
  organizationId: string,
  eventId: string,
  basePath: string,
  _state: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  void organizationId;
  const parsed = eventPayload(formData, locale);
  if ('error' in parsed) return { error: parsed.error };
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) return { error: await errorMessage(response, locale) };
  refresh(locale, basePath, eventId);
  redirect(`${localePath(locale, `${basePath}/${eventId}`)}?notice=updated` as Route);
}

async function patchEvent(locale: Locale, eventId: string, basePath: string, updates: Partial<Event>, notice: string) {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) redirect(`${localePath(locale, `${basePath}/${eventId}`)}?error=operation` as Route);
  refresh(locale, basePath, eventId);
  redirect(`${localePath(locale, `${basePath}/${eventId}`)}?notice=${notice}` as Route);
}

export async function publishEventAction(locale: Locale, eventId: string, basePath: string) {
  await patchEvent(locale, eventId, basePath, { eventStatus: 'AVAILABLE', isPublicVisible: true }, 'published');
}

export async function toggleEventVisibilityAction(
  locale: Locale,
  eventId: string,
  basePath: string,
  isPublicVisible: boolean
) {
  await patchEvent(locale, eventId, basePath, { isPublicVisible }, isPublicVisible ? 'shown' : 'hidden');
}

export async function advanceEventAction(
  locale: Locale,
  eventId: string,
  basePath: string,
  eventStatus: Event['eventStatus']
) {
  await patchEvent(locale, eventId, basePath, { eventStatus }, 'advanced');
}

export async function deleteEventAction(locale: Locale, eventId: string, basePath: string) {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' });
  if (!response.ok) redirect(`${localePath(locale, `${basePath}/${eventId}`)}?error=delete` as Route);
  refresh(locale, basePath);
  redirect(`${localePath(locale, basePath)}?notice=deleted` as Route);
}
