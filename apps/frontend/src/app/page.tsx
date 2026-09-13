import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { EventList } from '@/components/events/event-list';
import { EventsError } from '@/components/events/events-error';
import { getFutureEvents } from '@/lib/events';

export const metadata: Metadata = {
  title: 'Próximos eventos | Amateur Cycling Stats',
  description: 'Consulta las próximas carreras de ciclismo amateur.'
};

export default async function Home() {
  let events;
  try {
    events = await getFutureEvents();
  } catch {
    events = null;
  }

  return <EventsHomeContent content={events ? <EventList events={events} /> : <EventsError />} />;
}

function EventsHomeContent({ content }: { content: ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-5rem)]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <header className="mb-10 grid gap-5 border-l-4 border-[#f97316] pl-5 sm:mb-14 sm:pl-7 lg:grid-cols-[1fr_28rem] lg:items-end">
          <h1 className="text-6xl font-semibold leading-[0.84] tracking-tight text-[#102a43] sm:text-7xl">
            Próximos eventos
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            Encuentra tu siguiente línea de salida. Carreras abiertas y fechas confirmadas, ordenadas por salida.
          </p>
        </header>
        {content}
      </section>
    </main>
  );
}
