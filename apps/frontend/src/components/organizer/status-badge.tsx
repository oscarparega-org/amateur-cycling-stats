import type { EventStatus } from '@acs/shared';

const labels: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  AVAILABLE: 'Disponible',
  SOLD_OUT: 'Agotado',
  ON_GOING: 'En curso',
  FINISHED: 'Finalizado'
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const color =
    status === 'DRAFT'
      ? 'bg-slate-200 text-slate-700'
      : status === 'AVAILABLE'
        ? 'bg-emerald-100 text-emerald-800'
        : status === 'FINISHED'
          ? 'bg-slate-200 text-slate-700'
          : status === 'SOLD_OUT'
            ? 'bg-slate-700 text-white'
            : 'bg-[var(--workspace-fog)] text-[#102a43]';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{labels[status]}</span>;
}
