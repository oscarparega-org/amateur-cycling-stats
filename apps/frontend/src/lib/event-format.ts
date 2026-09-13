import type { Event, EventStatus } from '@acs/shared';

const statusLabels: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  AVAILABLE: 'Disponible',
  SOLD_OUT: 'Cupo lleno',
  ON_GOING: 'En curso',
  FINISHED: 'Finalizado'
};

export function formatEventStatus(status: EventStatus): string {
  return statusLabels[status];
}

export function eventStatusClasses(status: EventStatus): string {
  if (status === 'AVAILABLE') return 'border-blue-200 bg-blue-50 text-blue-800';
  if (status === 'SOLD_OUT') return 'border-slate-300 bg-slate-100 text-slate-700';
  return 'border-slate-300 bg-white text-slate-700';
}

export function formatEventLocation(event: Pick<Event, 'city' | 'state' | 'country'>): string {
  return [event.city, event.state, event.country].filter(Boolean).join(', ');
}

export function eventDateParts(dateTime: string): { day: string; month: string } {
  const date = new Date(dateTime);
  return {
    day: new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date).replace('.', '').toUpperCase()
  };
}

export function formatEventDate(dateTime: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateTime));
}

export function formatEventTime(dateTime: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateTime));
}
