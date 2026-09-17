import type { AvailableCategories, Event, Race } from '@acs/shared';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { backendFetch } from '@/lib/backend';
import { createRaceAction, deleteRaceAction, toggleRaceVisibilityAction, updateRaceAction } from '@/lib/race-actions';
import { localeDate, localePath, translate, type Locale } from '@/lib/i18n';
import { ConfirmSubmit } from '@/components/organizer/confirm-submit';
import { EventTabs } from './event-tabs';
import { RaceForm } from './race-form';

async function racesFor(eventId: string): Promise<Race[]> {
  const response = await backendFetch(`/api/races?eventId=${encodeURIComponent(eventId)}`);
  if (!response.ok) throw new Error('Race request failed');
  return (await response.json()) as Race[];
}

async function raceById(id: string): Promise<Race | null> {
  const response = await backendFetch(`/api/races/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Race request failed');
  return (await response.json()) as Race;
}

async function availableFor(eventId: string): Promise<AvailableCategories> {
  const response = await backendFetch(`/api/events/${encodeURIComponent(eventId)}/categories/available`);
  if (!response.ok) throw new Error('Available category request failed');
  return (await response.json()) as AvailableCategories;
}

function format(dateTime: string, event: Event, locale: Locale) {
  return new Intl.DateTimeFormat(localeDate(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: event.timeZone
  }).format(new Date(dateTime));
}

export async function RaceManagement({
  event,
  eventBasePath,
  locale,
  segments = [],
  notice,
  error,
  deletedResults
}: {
  event: Event;
  eventBasePath: string;
  locale: Locale;
  segments?: string[];
  notice?: string;
  error?: string;
  deletedResults?: string;
}) {
  const t = (text: string) => translate(locale, text);
  const raceBasePath = `${eventBasePath}/races`;
  const localizedRaceBase = localePath(locale, raceBasePath);

  if (segments.length > 2 || (segments[1] && segments[1] !== 'edit')) notFound();
  const [raceId, actionSegment] = segments;

  if (raceId === 'new') {
    if (actionSegment) notFound();
    const available = await availableFor(event.id);
    const action = createRaceAction.bind(null, locale, event.id, event.timeZone, raceBasePath);
    return (
      <>
        <EventTabs active="races" basePath={eventBasePath} locale={locale} />
        <Link className="font-bold text-blue-700" href={localizedRaceBase}>
          ← {t('Volver a carreras')}
        </Link>
        <h1 className="display-font my-6 border-b border-slate-300 pb-6 text-5xl font-semibold">
          {t('Nueva carrera')}
        </h1>
        <RaceForm action={action} available={available} event={event} locale={locale} />
      </>
    );
  }

  if (raceId) {
    const race = await raceById(raceId);
    if (!race || race.eventId !== event.id) notFound();
    if (actionSegment === 'edit') {
      const available = await availableFor(event.id);
      const action = updateRaceAction.bind(null, locale, race.id, event.timeZone, raceBasePath);
      return (
        <>
          <EventTabs active="races" basePath={eventBasePath} locale={locale} />
          <Link className="font-bold text-blue-700" href={`${localizedRaceBase}/${race.id}` as Route}>
            ← {t('Volver al detalle')}
          </Link>
          <h1 className="display-font my-6 border-b border-slate-300 pb-6 text-5xl font-semibold">
            {t('Editar carrera')}
          </h1>
          <RaceForm action={action} available={available} event={event} locale={locale} race={race} />
        </>
      );
    }
    const toggle = toggleRaceVisibilityAction.bind(null, locale, race.id, raceBasePath, !race.isPublicVisible);
    const remove = deleteRaceAction.bind(null, locale, race.id, raceBasePath);
    const notices: Record<string, string> = {
      created: 'Carrera creada.',
      updated: 'Cambios guardados.',
      shown: 'La carrera ahora es pública.',
      hidden: 'La carrera ahora está oculta.'
    };
    return (
      <>
        <EventTabs active="races" basePath={eventBasePath} locale={locale} />
        <Link className="font-bold text-blue-700" href={localizedRaceBase}>
          ← {t('Volver a carreras')}
        </Link>
        {notice && notices[notice] ? (
          <p className="my-5 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">
            {t(notices[notice] ?? '')}
          </p>
        ) : null}
        {error ? (
          <p className="my-5 border-l-4 border-red-600 bg-red-50 px-4 py-3 font-semibold text-red-900" role="alert">
            {t(error === 'delete' ? 'No se pudo eliminar la carrera.' : 'No se pudo completar la operación.')}
          </p>
        ) : null}
        <div className="my-6 flex flex-col gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="display-font text-5xl font-semibold">{race.name}</h1>
          <div className="flex flex-wrap gap-3">
            <form action={toggle}>
              <ConfirmSubmit
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold"
                message={t(
                  race.isPublicVisible
                    ? 'La carrera dejará de estar disponible al público. ¿Continuar?'
                    : 'La carrera estará disponible al público si el evento también es público. ¿Continuar?'
                )}
              >
                {t(race.isPublicVisible ? 'Ocultar' : 'Mostrar')}
              </ConfirmSubmit>
            </form>
            <Link
              className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white"
              href={`${localizedRaceBase}/${race.id}/edit` as Route}
            >
              {t('Editar')}
            </Link>
            <form action={remove}>
              <ConfirmSubmit
                className="rounded-md border border-red-300 bg-white px-4 py-2.5 font-bold text-red-700"
                message={
                  race.resultCount
                    ? locale === 'en'
                      ? `${race.resultCount} results will also be deleted. Continue?`
                      : `Se eliminarán también ${race.resultCount} resultados. ¿Continuar?`
                    : t('Esta acción eliminará la carrera de forma permanente. ¿Continuar?')
                }
              >
                {t('Eliminar')}
              </ConfirmSubmit>
            </form>
          </div>
        </div>
        <section className="border border-slate-200 bg-white p-6 sm:p-8">
          <dl className="grid gap-7 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">{t('Edad')}</dt>
              <dd className="mt-1 font-semibold">{race.raceCategoryAgeName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Género')}</dt>
              <dd className="mt-1 font-semibold">{race.raceCategoryGenderName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Distancia')}</dt>
              <dd className="mt-1 font-semibold">{race.raceCategoryDistanceName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Fecha y hora')}</dt>
              <dd className="mt-1 font-semibold">{format(race.dateTime, event, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Visibilidad')}</dt>
              <dd className="mt-1 font-semibold">{t(race.isPublicVisible ? 'Público' : 'Oculto')}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Resultados')}</dt>
              <dd className="mt-1 font-semibold">{race.resultCount}</dd>
            </div>
            {race.description ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">{t('Descripción')}</dt>
                <dd className="mt-2 whitespace-pre-wrap leading-7">{race.description}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </>
    );
  }

  const races = await racesFor(event.id);
  return (
    <>
      <EventTabs active="races" basePath={eventBasePath} locale={locale} />
      {notice === 'deleted' ? (
        <p className="mb-5 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">
          {deletedResults && Number(deletedResults) > 0
            ? locale === 'en'
              ? `Race and ${deletedResults} results deleted.`
              : `Carrera y ${deletedResults} resultados eliminados.`
            : t('Carrera eliminada.')}
        </p>
      ) : null}
      <div className="mb-6 flex items-end justify-between border-b border-slate-300 pb-6">
        <div>
          <p className="mb-2 font-semibold text-slate-500">{event.name}</p>
          <h1 className="display-font text-5xl font-semibold">{t('Carreras')}</h1>
        </div>
        <Link
          className="rounded-md bg-[#102a43] px-5 py-3 font-bold text-white"
          href={`${localizedRaceBase}/new` as Route}
        >
          {t('Nueva carrera')}
        </Link>
      </div>
      {!races.length ? (
        <div className="border-l-4 border-slate-300 bg-white px-6 py-10">
          <h2 className="display-font text-3xl font-semibold">{t('No hay carreras en este evento')}</h2>
          <Link
            className="mt-4 inline-block font-bold text-blue-700 underline underline-offset-4"
            href={`${localizedRaceBase}/new` as Route}
          >
            {t('Crear carrera')}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-sm text-slate-600">
                <th className="px-5 py-3">{t('Carrera')}</th>
                <th className="px-5 py-3">{t('Fecha')}</th>
                <th className="px-5 py-3">{t('Visibilidad')}</th>
                <th className="px-5 py-3">{t('Resultados')}</th>
              </tr>
            </thead>
            <tbody>
              {races.map((race) => (
                <tr className="border-b border-slate-200 last:border-0" key={race.id}>
                  <td className="px-5 py-4">
                    <Link
                      className="font-bold underline decoration-slate-300 underline-offset-4 hover:decoration-blue-700"
                      href={`${localizedRaceBase}/${race.id}` as Route}
                    >
                      {race.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{format(race.dateTime, event, locale)}</td>
                  <td className="px-5 py-4 font-semibold">{t(race.isPublicVisible ? 'Público' : 'Oculto')}</td>
                  <td className="px-5 py-4">{race.resultCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
