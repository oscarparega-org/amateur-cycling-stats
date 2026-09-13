import Link from 'next/link';
import type { Route } from 'next';
import type { EventWithOrganization } from '@acs/shared';
import { eventDateParts, formatEventLocation } from '@/lib/event-format';
import { EventStatus } from './event-status';

export function EventCard({ event }: { event: EventWithOrganization }) {
  const date = eventDateParts(event.dateTime);
  const location = formatEventLocation(event);

  return (
    <article className="border-t border-slate-300 last:border-b">
      <Link
        className="group grid gap-5 py-6 focus-visible:outline-offset-[-3px] sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-7 sm:py-8"
        href={`/eventos/${event.id}` as Route}
      >
        <time
          className="flex h-[5.5rem] w-[5.5rem] shrink-0 flex-col items-center justify-center border-2 border-[#102a43] bg-[#f97316] text-[#102a43] shadow-[5px_5px_0_#102a43] sm:h-24 sm:w-24"
          dateTime={event.dateTime}
        >
          <span className="display-font text-5xl font-bold leading-[0.72]">{date.day}</span>
          <span className="mt-2 text-sm font-bold tracking-[0.16em]">{date.month}</span>
        </time>

        <div className="min-w-0">
          <div className="mb-3 sm:hidden">
            <EventStatus status={event.eventStatus} />
          </div>
          <h2 className="display-font text-3xl font-semibold leading-none tracking-tight text-[#102a43] group-hover:text-blue-700 sm:text-4xl">
            {event.name}
          </h2>
          {event.organizationName ? (
            <p className="mt-2 font-semibold text-slate-700">{event.organizationName}</p>
          ) : null}
          <p className="mt-1 text-slate-600">{location || 'Ubicación por confirmar'}</p>
          {event.description ? (
            <p className="mt-3 line-clamp-2 max-w-3xl leading-7 text-slate-600">{event.description}</p>
          ) : null}
        </div>

        <div className="hidden min-w-32 justify-items-end gap-5 sm:grid">
          <EventStatus status={event.eventStatus} />
          <span className="font-semibold text-[#102a43] group-hover:text-blue-700" aria-hidden="true">
            Ver evento&nbsp;&nbsp;›
          </span>
        </div>
        <span className="font-semibold text-[#102a43] group-hover:text-blue-700 sm:hidden">
          Ver evento&nbsp;&nbsp;›
        </span>
      </Link>
    </article>
  );
}
