import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { deleteEventAction, publishEventAction, toggleEventVisibilityAction } from '@/app/organizer/actions';
import { Alert } from '@/components/alert';
import { ConfirmSubmit } from '@/components/organizer/confirm-submit';
import { PageHeading } from '@/components/organizer/page-heading';
import { StatusBadge } from '@/components/organizer/status-badge';
import { getOrganizationEvent } from '@/lib/organizer';
import { localeDate, localePath, resolveLocale, translate, type Locale } from '@/lib/i18n';

const notices: Record<string, string> = {
  created: 'Evento creado como borrador.',
  updated: 'Cambios guardados.',
  published: 'Evento publicado.',
  shown: 'El evento ahora es público.',
  hidden: 'El evento ahora está oculto.'
};

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeDate(locale), { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
}

export default async function EventDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; organizationId: string; eventId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { organizationId, eventId, locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const query = await searchParams;
  const event = await getOrganizationEvent(organizationId, eventId);
  if (!event) notFound();
  const base = localePath(locale, `/organizer/${organizationId}/events/${eventId}`);
  const location = [event.city, event.state, event.country].filter(Boolean).join(', ');

  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
        href={localePath(locale, `/organizer/${organizationId}/events`) as Route}
      >
        ← {t('Volver a eventos')}
      </Link>
      <PageHeading title={event.name} />
      {query.error ? (
        <Alert closeLabel={t('Cerrar alerta')} kind="error">
          {t('No se pudo completar la operación. Vuelve a intentarlo.')}
        </Alert>
      ) : query.notice && notices[query.notice] ? (
        <Alert autoCloseMs={6000} closeLabel={t('Cerrar alerta')} kind="success">
          {t(notices[query.notice] ?? '')}
        </Alert>
      ) : null}
      <div className="mb-6 flex flex-wrap gap-3">
        {event.eventStatus === 'DRAFT' ? (
          <form action={publishEventAction.bind(null, locale, organizationId, eventId)}>
            <ConfirmSubmit
              className="rounded-md bg-[#f97316] px-4 py-2.5 font-bold text-white hover:bg-orange-600"
              message={t('Al publicar, el evento será visible para el público. ¿Continuar?')}
            >
              {t('Publicar evento')}
            </ConfirmSubmit>
          </form>
        ) : (
          <form
            action={toggleEventVisibilityAction.bind(null, locale, organizationId, eventId, !event.isPublicVisible)}
          >
            <ConfirmSubmit
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold hover:border-slate-500"
              message={t(
                event.isPublicVisible ? '¿Ocultar este evento al público?' : '¿Mostrar este evento al público?'
              )}
            >
              {t(event.isPublicVisible ? 'Ocultar' : 'Mostrar')}
            </ConfirmSubmit>
          </form>
        )}
        <Link
          className="rounded-md bg-[#2563eb] px-4 py-2.5 font-bold text-white hover:bg-blue-700"
          href={`${base}/edit` as Route}
        >
          {t('Editar')}
        </Link>
        {event.eventStatus === 'DRAFT' ? (
          <form action={deleteEventAction.bind(null, locale, organizationId, eventId)}>
            <ConfirmSubmit
              className="rounded-md border border-red-300 bg-white px-4 py-2.5 font-bold text-red-700 hover:bg-red-50"
              message={t('Esta acción eliminará el borrador de forma permanente. ¿Continuar?')}
            >
              {t('Eliminar borrador')}
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">{t('Información del evento')}</h2>
          <dl className="mt-7 grid gap-7 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">{t('Fecha y hora')}</dt>
              <dd className="mt-1 font-semibold capitalize">{formatDate(event.dateTime, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Ubicación')}</dt>
              <dd className="mt-1 font-semibold">{location}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">{t('Descripción')}</dt>
              <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                {event.description || t('Sin descripción.')}
              </dd>
            </div>
          </dl>
        </div>
        <aside className="border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">{t('Publicación')}</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="mb-2 text-sm text-slate-500">{t('Estado')}</dt>
              <dd>
                <StatusBadge status={event.eventStatus} locale={locale} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Visibilidad')}</dt>
              <dd className="mt-1 font-bold">{t(event.isPublicVisible ? 'Público' : 'Oculto')}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </>
  );
}
