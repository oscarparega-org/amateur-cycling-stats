import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/events/event-detail';
import { getEventById } from '@/lib/events';

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: 'Evento no encontrado | Amateur Cycling Stats' };
  return {
    title: `${event.name} | Amateur Cycling Stats`,
    description: event.description ?? `${event.name}, ${event.state}, ${event.country}`
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  return <EventDetail event={event} />;
}
