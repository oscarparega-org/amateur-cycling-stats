import type { Event, EventStatus } from '@acs/shared';
import Link from 'next/link';
import type { Route } from 'next';
import { Alert } from '@/components/alert';
import {
  advanceEventAction,
  deleteEventAction,
  publishEventAction,
  toggleEventVisibilityAction
} from '@/lib/event-actions';
import { ConfirmSubmit } from '@/components/organizer/confirm-submit';
import { PageHeading } from '@/components/organizer/page-heading';
import { StatusBadge } from '@/components/organizer/status-badge';
import { localeDate, localePath, translate, type Locale } from '@/lib/i18n';
import { EventTabs } from './event-tabs';

export type EventFilter = 'all' | 'future' | 'past';
const filters: Array<{ id: EventFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'future', label: 'Próximos' },
  { id: 'past', label: 'Pasados' }
];
const nextStatus: Partial<Record<EventStatus, EventStatus>> = {
  AVAILABLE: 'SOLD_OUT',
  SOLD_OUT: 'ON_GOING',
  ON_GOING: 'FINISHED'
};

function format(value: string, locale: Locale, timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(localeDate(locale), { ...options, timeZone }).format(new Date(value));
}

export function EventManagementList({
  basePath,
  events,
  filter,
  locale,
  notice
}: {
  basePath: string;
  events: Event[];
  filter: EventFilter;
  locale: Locale;
  notice?: string;
}) {
  const t = (text: string) => translate(locale, text);
  return (
    <>
      <PageHeading
        title={t('Eventos')}
        action={
          <Link
            className="rounded-md bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64]"
            href={localePath(locale, `${basePath}/new`) as Route}
          >
            {t('Crear evento')}
          </Link>
        }
      />
      {notice === 'deleted' ? (
        <Alert autoCloseMs={6000} closeLabel={t('Cerrar alerta')} kind="success">
          {t('Evento eliminado.')}
        </Alert>
      ) : null}
      <div className="mb-5 flex gap-2" aria-label={t('Filtrar eventos')}>
        {filters.map((item) => (
          <Link
            className={
              filter === item.id
                ? 'rounded-md bg-[#102a43] px-4 py-2 text-sm font-bold text-white'
                : 'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-500'
            }
            href={
              (item.id === 'all'
                ? localePath(locale, basePath)
                : `${localePath(locale, basePath)}?filter=${item.id}`) as Route
            }
            key={item.id}
          >
            {t(item.label)}
          </Link>
        ))}
      </div>
      {!events.length ? (
        <div className="border-l-4 border-slate-300 bg-white px-6 py-10">
          <h2 className="display-font text-3xl font-semibold">{t('No hay eventos en esta vista')}</h2>
          <Link
            className="mt-4 inline-block font-bold text-blue-700 underline underline-offset-4"
            href={localePath(locale, `${basePath}/new`) as Route}
          >
            {t('Crear evento')}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-sm text-slate-600">
                <th className="px-5 py-3">{t('Evento')}</th>
                <th className="px-5 py-3">{t('Fecha')}</th>
                <th className="px-5 py-3">{t('Estado')}</th>
                <th className="px-5 py-3">{t('Visibilidad')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr className="border-b border-slate-200 last:border-0" key={event.id}>
                  <td className="px-5 py-4">
                    <Link
                      className="font-bold underline decoration-slate-300 underline-offset-4 hover:decoration-blue-700"
                      href={localePath(locale, `${basePath}/${event.id}`) as Route}
                    >
                      {event.name}
                    </Link>
                    <span className="mt-1 block text-sm text-slate-500">
                      {[event.city, event.state].filter(Boolean).join(', ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {format(event.dateTime, locale, event.timeZone, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={event.eventStatus} locale={locale} />
                  </td>
                  <td className="px-5 py-4 font-semibold">{t(event.isPublicVisible ? 'Público' : 'Oculto')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function EventManagementDetail({
  basePath,
  event,
  locale,
  notice,
  error
}: {
  basePath: string;
  event: Event;
  locale: Locale;
  notice?: string;
  error?: string;
}) {
  const t = (text: string) => translate(locale, text);
  const eventPath = `${basePath}/${event.id}`;
  const next = nextStatus[event.eventStatus];
  const notices: Record<string, string> = {
    created: 'Evento creado como borrador.',
    updated: 'Cambios guardados.',
    published: 'Evento publicado.',
    shown: 'El evento ahora es público.',
    hidden: 'El evento ahora está oculto.',
    advanced: 'Estado actualizado.'
  };
  return (
    <>
      <Link className="mb-5 inline-block font-semibold text-blue-700" href={localePath(locale, basePath) as Route}>
        ← {t('Volver a eventos')}
      </Link>
      <PageHeading title={event.name} />
      <EventTabs active="overview" basePath={eventPath} locale={locale} />
      {error ? (
        <Alert closeLabel={t('Cerrar alerta')} kind="error">
          {t(error === 'delete' ? 'No se pudo eliminar el evento.' : 'No se pudo completar la operación.')}
        </Alert>
      ) : notice && notices[notice] ? (
        <Alert autoCloseMs={6000} closeLabel={t('Cerrar alerta')} kind="success">
          {t(notices[notice] ?? '')}
        </Alert>
      ) : null}
      <div className="mb-7 flex flex-wrap gap-3">
        {event.eventStatus === 'DRAFT' ? (
          <form action={publishEventAction.bind(null, locale, event.id, basePath)}>
            <ConfirmSubmit
              className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white"
              message={t('Al publicar, el evento será visible para el público. ¿Continuar?')}
            >
              {t('Publicar evento')}
            </ConfirmSubmit>
          </form>
        ) : null}
        {next ? (
          <form action={advanceEventAction.bind(null, locale, event.id, basePath, next)}>
            <ConfirmSubmit
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold"
              message={t('¿Confirmar el cambio de estado?')}
            >
              {t('Avanzar estado')}
            </ConfirmSubmit>
          </form>
        ) : null}
        {event.eventStatus !== 'DRAFT' ? (
          <form action={toggleEventVisibilityAction.bind(null, locale, event.id, basePath, !event.isPublicVisible)}>
            <ConfirmSubmit
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold"
              message={t(
                event.isPublicVisible ? '¿Ocultar este evento al público?' : '¿Mostrar este evento al público?'
              )}
            >
              {t(event.isPublicVisible ? 'Ocultar' : 'Mostrar')}
            </ConfirmSubmit>
          </form>
        ) : null}
        <Link
          className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white"
          href={localePath(locale, `${eventPath}/edit`) as Route}
        >
          {t('Editar')}
        </Link>
        {event.eventStatus === 'DRAFT' ? (
          <form action={deleteEventAction.bind(null, locale, event.id, basePath)}>
            <ConfirmSubmit
              className="rounded-md border border-red-300 bg-white px-4 py-2.5 font-bold text-red-700"
              message={t('Esta acción eliminará el borrador de forma permanente. ¿Continuar?')}
            >
              {t('Eliminar borrador')}
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <dl className="grid gap-7 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">{t('Fecha y hora')}</dt>
            <dd className="mt-1 font-semibold">
              {format(event.dateTime, locale, event.timeZone, { dateStyle: 'full', timeStyle: 'short' })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('Zona horaria')}</dt>
            <dd className="mt-1 font-semibold">{event.timeZone}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('Ubicación')}</dt>
            <dd className="mt-1 font-semibold">
              {[event.city, event.state, event.country].filter(Boolean).join(', ')}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('Visibilidad')}</dt>
            <dd className="mt-1 font-semibold">{t(event.isPublicVisible ? 'Público' : 'Oculto')}</dd>
          </div>
          {event.description ? (
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">{t('Descripción')}</dt>
              <dd className="mt-2 whitespace-pre-wrap leading-7">{event.description}</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </>
  );
}
