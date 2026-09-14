import type { EventWithOrganization } from '@acs/shared';
import { EventCard } from './event-card';
import { translate, type Locale } from '@/lib/i18n';

export function EventList({ events, locale = 'es' }: { events: EventWithOrganization[]; locale?: Locale }) {
  const t = (text: string) => translate(locale, text);
  if (events.length === 0) {
    return (
      <div className="border-y border-slate-300 py-16 text-center">
        <p className="display-font text-3xl font-semibold text-[#102a43]">{t('No hay próximos eventos')}</p>
      </div>
    );
  }

  return (
    <div aria-label={t('Próximos eventos')}>
      {events.map((event) => (
        <EventCard event={event} locale={locale} key={event.id} />
      ))}
    </div>
  );
}
