import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/events/event-detail';
import { getEventById } from '@/lib/events';
import { resolveLocale, translate } from '@/lib/i18n';

type EventPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id, locale: value } = await params;
  const locale = resolveLocale(value);
  const event = await getEventById(id);
  if (!event) return { title: `${translate(locale, 'Evento no encontrado')} | Amateur Cycling Stats` };
  return {
    title: `${event.name} | Amateur Cycling Stats`,
    description: event.description ?? `${event.name}, ${event.state}, ${event.country}`
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id, locale: value } = await params;
  const locale = resolveLocale(value);
  const event = await getEventById(id);
  if (!event) notFound();
  return <EventDetail event={event} locale={locale} />;
}
