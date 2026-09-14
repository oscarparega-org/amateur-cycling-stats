import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { EventList } from '@/components/events/event-list';
import { EventsError } from '@/components/events/events-error';
import { getFutureEvents } from '@/lib/events';
import { resolveLocale, translate, type Locale } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  return locale === 'es'
    ? {
        title: 'Próximos eventos | Amateur Cycling Stats',
        description: 'Consulta las próximas carreras de ciclismo amateur.'
      }
    : {
        title: 'Upcoming events | Amateur Cycling Stats',
        description: 'Browse upcoming amateur cycling races.'
      };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  let events;
  try {
    events = await getFutureEvents();
  } catch {
    events = null;
  }

  return (
    <EventsHomeContent
      locale={locale}
      content={events ? <EventList events={events} locale={locale} /> : <EventsError locale={locale} />}
    />
  );
}

function EventsHomeContent({ content, locale }: { content: ReactNode; locale: Locale }) {
  const t = (text: string) => translate(locale, text);
  return (
    <main className="min-h-[calc(100vh-5rem)]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <header className="mb-10 grid gap-5 border-l-4 border-[#f97316] pl-5 sm:mb-14 sm:pl-7 lg:grid-cols-[1fr_28rem] lg:items-end">
          <h1 className="text-6xl font-semibold leading-[0.84] tracking-tight text-[#102a43] sm:text-7xl">
            {t('Próximos eventos')}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            {t('Encuentra tu siguiente línea de salida. Carreras abiertas y fechas confirmadas, ordenadas por salida.')}
          </p>
        </header>
        {content}
      </section>
    </main>
  );
}
