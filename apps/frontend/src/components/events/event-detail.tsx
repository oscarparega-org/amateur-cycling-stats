import Link from 'next/link';
import type { EventWithOrganization } from '@acs/shared';
import { eventDateParts, formatEventDate, formatEventLocation, formatEventTime } from '@/lib/event-format';
import { EventStatus } from './event-status';
import { localePath, translate, type Locale } from '@/lib/i18n';

export function EventDetail({ event, locale = 'es' }: { event: EventWithOrganization; locale?: Locale }) {
  const date = eventDateParts(event.dateTime, event.timeZone, locale);
  const t = (text: string) => translate(locale, text);
  const location = formatEventLocation(event);

  return (
    <main>
      <section className="relative overflow-hidden bg-[#102a43] text-white">
        <div className="timing-grid absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <Link className="inline-flex font-semibold text-blue-100 hover:text-white" href={localePath(locale)}>
            ‹&nbsp;&nbsp;{t('Próximos eventos')}
          </Link>
          <div className="mt-10 grid gap-7 sm:grid-cols-[7.5rem_1fr] sm:items-end">
            <time
              className="flex h-28 w-28 flex-col items-center justify-center border-2 border-white bg-[#f97316] text-[#102a43] shadow-[7px_7px_0_rgba(255,255,255,0.9)]"
              dateTime={event.dateTime}
            >
              <span className="display-font text-6xl font-bold leading-[0.72]">{date.day}</span>
              <span className="mt-2 text-sm font-bold tracking-[0.18em]">{date.month}</span>
            </time>
            <div>
              <div className="mb-5">
                <EventStatus status={event.eventStatus} locale={locale} />
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.9] tracking-tight sm:text-7xl">
                {event.name}
              </h1>
              {event.organizationName ? (
                <p className="mt-5 text-lg font-semibold text-blue-100">{event.organizationName}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_20rem] lg:gap-20">
        <div>
          <h2 className="display-font text-3xl font-semibold">{t('Sobre el evento')}</h2>
          {event.description ? (
            <p className="mt-5 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-700">{event.description}</p>
          ) : (
            <p className="mt-5 text-lg text-slate-600">{t('El organizador todavía no ha añadido una descripción.')}</p>
          )}
        </div>
        <dl className="border-t-4 border-[#f97316] bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,42,67,0.08)]">
          <div className="border-b border-slate-200 pb-5">
            <dt className="font-semibold text-slate-600">{t('Cuándo')}</dt>
            <dd className="mt-1 text-lg font-semibold text-[#102a43]">
              <time dateTime={event.dateTime}>{formatEventDate(event.dateTime, event.timeZone, locale)}</time>
            </dd>
            <dd className="text-slate-600">{formatEventTime(event.dateTime, event.timeZone, locale)}</dd>
          </div>
          <div className="pt-5">
            <dt className="font-semibold text-slate-600">{t('Dónde')}</dt>
            <dd className="mt-1 text-lg font-semibold text-[#102a43]">{location || t('Ubicación por confirmar')}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
