import type { EventStatus } from '@acs/shared';
import { translate, type Locale } from '@/lib/i18n';

const labels: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  AVAILABLE: 'Disponible',
  SOLD_OUT: 'Agotado',
  ON_GOING: 'En curso',
  FINISHED: 'Finalizado'
};

export function StatusBadge({ status, locale = 'es' }: { status: EventStatus; locale?: Locale }) {
  const color =
    status === 'DRAFT'
      ? 'bg-slate-200 text-slate-700'
      : status === 'AVAILABLE'
        ? 'bg-emerald-100 text-emerald-800'
        : status === 'FINISHED'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-orange-100 text-orange-800';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      {translate(locale, labels[status] ?? status)}
    </span>
  );
}
