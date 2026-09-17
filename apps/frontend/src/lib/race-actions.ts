'use server';

import { eventInstant, type Race } from '@acs/shared';
import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { backendFetch } from './backend';
import { localePath, translate, type Locale } from './i18n';

export type RaceFormState = { error?: string };

async function errorMessage(response: Response, locale: Locale) {
  try {
    const body = (await response.json()) as { code?: string; error?: string };
    if (body.code === 'ACS04') return translate(locale, 'Ya existe una carrera con esta combinación de categorías.');
    if (body.code === 'ACS06')
      return translate(locale, 'Una categoría seleccionada no está disponible para este evento.');
    return body.error ?? translate(locale, 'No se pudo guardar la carrera.');
  } catch {
    return translate(locale, 'No se pudo completar la operación.');
  }
}

function payload(formData: FormData, timeZone: string, locale: Locale) {
  const raceCategoryAgeId = formData.get('raceCategoryAgeId')?.toString() ?? '';
  const raceCategoryGenderId = formData.get('raceCategoryGenderId')?.toString() ?? '';
  const raceCategoryDistanceId = formData.get('raceCategoryDistanceId')?.toString() ?? '';
  const localDateTime = formData.get('localDateTime')?.toString() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  if (!raceCategoryAgeId || !raceCategoryGenderId || !raceCategoryDistanceId || !localDateTime) {
    return { error: translate(locale, 'Selecciona una categoría de cada tipo y una fecha.') } as const;
  }
  try {
    return {
      data: {
        raceCategoryAgeId,
        raceCategoryGenderId,
        raceCategoryDistanceId,
        dateTime: eventInstant(localDateTime, timeZone),
        description
      }
    } as const;
  } catch {
    return { error: translate(locale, 'La fecha o zona horaria no es válida.') } as const;
  }
}

function refresh(locale: Locale, raceBasePath: string, raceId?: string) {
  revalidatePath(localePath(locale, raceBasePath));
  if (raceId) revalidatePath(localePath(locale, `${raceBasePath}/${raceId}`));
}

export async function createRaceAction(
  locale: Locale,
  eventId: string,
  timeZone: string,
  raceBasePath: string,
  _state: RaceFormState,
  formData: FormData
): Promise<RaceFormState> {
  const parsed = payload(formData, timeZone, locale);
  if ('error' in parsed) return { error: parsed.error };
  const response = await backendFetch('/api/races', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ eventId, ...parsed.data })
  });
  if (!response.ok) return { error: await errorMessage(response, locale) };
  const race = (await response.json()) as Race;
  refresh(locale, raceBasePath, race.id);
  redirect(`${localePath(locale, `${raceBasePath}/${race.id}`)}?notice=created` as Route);
}

export async function updateRaceAction(
  locale: Locale,
  raceId: string,
  timeZone: string,
  raceBasePath: string,
  _state: RaceFormState,
  formData: FormData
): Promise<RaceFormState> {
  const parsed = payload(formData, timeZone, locale);
  if ('error' in parsed) return { error: parsed.error };
  const response = await backendFetch(`/api/races/${encodeURIComponent(raceId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) return { error: await errorMessage(response, locale) };
  refresh(locale, raceBasePath, raceId);
  redirect(`${localePath(locale, `${raceBasePath}/${raceId}`)}?notice=updated` as Route);
}

export async function toggleRaceVisibilityAction(
  locale: Locale,
  raceId: string,
  raceBasePath: string,
  isPublicVisible: boolean
) {
  const response = await backendFetch(`/api/races/${encodeURIComponent(raceId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ isPublicVisible })
  });
  if (!response.ok) redirect(`${localePath(locale, `${raceBasePath}/${raceId}`)}?error=operation` as Route);
  refresh(locale, raceBasePath, raceId);
  redirect(
    `${localePath(locale, `${raceBasePath}/${raceId}`)}?notice=${isPublicVisible ? 'shown' : 'hidden'}` as Route
  );
}

export async function deleteRaceAction(locale: Locale, raceId: string, raceBasePath: string) {
  const response = await backendFetch(`/api/races/${encodeURIComponent(raceId)}`, { method: 'DELETE' });
  if (!response.ok) redirect(`${localePath(locale, `${raceBasePath}/${raceId}`)}?error=delete` as Route);
  const result = (await response.json()) as { deletedResults: number };
  refresh(locale, raceBasePath);
  redirect(`${localePath(locale, raceBasePath)}?notice=deleted&deletedResults=${result.deletedResults}` as Route);
}
