import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { deleteEventAction, publishEventAction, toggleEventVisibilityAction } from '@/app/organizer/actions';
import { ConfirmSubmit } from '@/components/organizer/confirm-submit';
import { PageHeading } from '@/components/organizer/page-heading';
import { StatusBadge } from '@/components/organizer/status-badge';
import { getOrganizationEvent } from '@/lib/organizer';

const notices: Record<string, string> = {
  created: 'Evento creado como borrador.',
  updated: 'Cambios guardados.',
  published: 'Evento publicado.',
  shown: 'El evento ahora es público.',
  hidden: 'El evento ahora está oculto.'
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
}

export default async function EventDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ organizationId: string; eventId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { organizationId, eventId } = await params;
  const query = await searchParams;
  const event = await getOrganizationEvent(organizationId, eventId);
  if (!event) notFound();
  const base = `/organizer/${organizationId}/events/${eventId}`;
  const location = [event.city, event.state, event.country].filter(Boolean).join(', ');

  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-[var(--workspace-steel)] hover:text-[#102a43]"
        href={`/organizer/${organizationId}/events` as Route}
      >
        ← Volver a eventos
      </Link>
      <PageHeading title={event.name} />
      {query.notice && notices[query.notice] ? (
        <p className="mb-5 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">
          {notices[query.notice]}
        </p>
      ) : null}
      {query.error ? (
        <p className="mb-5 border-l-4 border-red-500 bg-red-50 px-4 py-3 font-semibold text-red-900">
          No se pudo completar la operación. Vuelve a intentarlo.
        </p>
      ) : null}
      <div className="mb-6 flex flex-wrap gap-3">
        {event.eventStatus === 'DRAFT' ? (
          <form action={publishEventAction.bind(null, organizationId, eventId)}>
            <ConfirmSubmit
              className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white hover:bg-[#173f64]"
              message="Al publicar, el evento será visible para el público. ¿Continuar?"
            >
              Publicar evento
            </ConfirmSubmit>
          </form>
        ) : (
          <form action={toggleEventVisibilityAction.bind(null, organizationId, eventId, !event.isPublicVisible)}>
            <ConfirmSubmit
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold hover:border-slate-500"
              message={event.isPublicVisible ? '¿Ocultar este evento al público?' : '¿Mostrar este evento al público?'}
            >
              {event.isPublicVisible ? 'Ocultar' : 'Mostrar'}
            </ConfirmSubmit>
          </form>
        )}
        <Link
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold text-[#102a43] hover:border-[var(--workspace-steel)]"
          href={`${base}/edit` as Route}
        >
          Editar
        </Link>
        {event.eventStatus === 'DRAFT' ? (
          <form action={deleteEventAction.bind(null, organizationId, eventId)}>
            <ConfirmSubmit
              className="rounded-md border border-red-300 bg-white px-4 py-2.5 font-bold text-red-700 hover:bg-red-50"
              message="Esta acción eliminará el borrador de forma permanente. ¿Continuar?"
            >
              Eliminar borrador
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Información del evento</h2>
          <dl className="mt-7 grid gap-7 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Fecha y hora</dt>
              <dd className="mt-1 font-semibold capitalize">{formatDate(event.dateTime)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Ubicación</dt>
              <dd className="mt-1 font-semibold">{location}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">Descripción</dt>
              <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{event.description || '—'}</dd>
            </div>
          </dl>
        </div>
        <aside className="border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Publicación</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="mb-2 text-sm text-slate-500">Estado</dt>
              <dd>
                <StatusBadge status={event.eventStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Visibilidad</dt>
              <dd className="mt-1 font-bold">{event.isPublicVisible ? 'Público' : 'Oculto'}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </>
  );
}
