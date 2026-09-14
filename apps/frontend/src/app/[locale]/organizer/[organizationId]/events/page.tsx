import Link from 'next/link';
import type { Route } from 'next';
import { Alert } from '@/components/alert';
import { PageHeading } from '@/components/organizer/page-heading';
import { StatusBadge } from '@/components/organizer/status-badge';
import { getOrganizationEvents, type EventFilter } from '@/lib/organizer';
import { localeDate, localePath, resolveLocale, translate, type Locale } from '@/lib/i18n';

const filters: { id: EventFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'future', label: 'Próximos' },
  { id: 'past', label: 'Pasados' }
];

function eventDate(value: string, locale: Locale) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat(localeDate(locale), { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat(localeDate(locale), { month: 'short' }).format(date).replace('.', ''),
    detail: new Intl.DateTimeFormat(localeDate(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  };
}

const noticeText: Record<string, string> = { deleted: 'Evento eliminado.' };

export default async function EventsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; organizationId: string }>;
  searchParams: Promise<{ filter?: string; notice?: string }>;
}) {
  const { organizationId, locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const query = await searchParams;
  const filter: EventFilter = query.filter === 'future' || query.filter === 'past' ? query.filter : 'all';
  const events = await getOrganizationEvents(organizationId, filter);

  return (
    <>
      <PageHeading
        title={t('Eventos')}
        action={
          <Link
            className="rounded-md bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700"
            href={localePath(locale, `/organizer/${organizationId}/events/new`) as Route}
          >
            {t('Crear evento')}
          </Link>
        }
      />
      {query.notice && noticeText[query.notice] ? (
        <Alert autoCloseMs={6000} closeLabel={t('Cerrar alerta')} kind="success">
          {t(noticeText[query.notice] ?? '')}
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
                ? localePath(locale, `/organizer/${organizationId}/events`)
                : `${localePath(locale, `/organizer/${organizationId}/events`)}?filter=${item.id}`) as Route
            }
            key={item.id}
          >
            {t(item.label)}
          </Link>
        ))}
      </div>
      {events.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold">{t('No hay eventos en esta vista')}</h2>
          <p className="mt-3 text-slate-600">{t('Crea un evento nuevo o cambia el filtro.')}</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 bg-white">
          <div className="hidden grid-cols-[6rem_1fr_10rem_9rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600 md:grid">
            <span>{t('Fecha')}</span>
            <span>{t('Evento')}</span>
            <span>{t('Estado')}</span>
            <span>{t('Visibilidad')}</span>
          </div>
          {events.map((event) => {
            const date = eventDate(event.dateTime, locale);
            return (
              <Link
                className="group grid gap-4 border-b border-slate-200 px-5 py-5 last:border-0 hover:bg-blue-50/50 md:grid-cols-[6rem_1fr_10rem_9rem] md:items-center"
                href={localePath(locale, `/organizer/${organizationId}/events/${event.id}`) as Route}
                key={event.id}
              >
                <span className="flex w-fit items-baseline gap-2 border-l-4 border-[#f97316] pl-3 md:block">
                  <span className="display-font text-3xl font-semibold leading-none">{date.day}</span>
                  <span className="text-sm font-bold capitalize text-slate-500 md:block">{date.month}</span>
                </span>
                <span>
                  <strong className="block text-lg group-hover:text-blue-700">{event.name}</strong>
                  <span className="text-sm text-slate-500">
                    {event.city ? `${event.city}, ` : ''}
                    {event.state} · {date.detail}
                  </span>
                </span>
                <StatusBadge status={event.eventStatus} locale={locale} />
                <span
                  className={
                    event.isPublicVisible ? 'text-sm font-bold text-emerald-700' : 'text-sm font-bold text-slate-500'
                  }
                >
                  {t(event.isPublicVisible ? 'Público' : 'Oculto')}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
