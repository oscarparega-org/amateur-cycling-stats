import type { EventWithOrganization } from '@acs/shared';
import { EventCard } from './event-card';

export function EventList({ events }: { events: EventWithOrganization[] }) {
  if (events.length === 0) {
    return (
      <div className="border-y border-slate-300 py-16 text-center">
        <p className="display-font text-3xl font-semibold text-[#102a43]">No hay próximos eventos</p>
      </div>
    );
  }

  return (
    <div aria-label="Próximos eventos">
      {events.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </div>
  );
}
