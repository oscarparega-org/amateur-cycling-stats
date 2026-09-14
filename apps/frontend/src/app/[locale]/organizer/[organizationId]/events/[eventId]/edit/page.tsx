import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { updateEventAction } from '@/app/organizer/actions';
import { EventForm } from '@/components/organizer/event-form';
import { PageHeading } from '@/components/organizer/page-heading';
import { getOrganizationEvent } from '@/lib/organizer';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function EditEventPage({
  params
}: {
  params: Promise<{ locale: string; organizationId: string; eventId: string }>;
}) {
  const { organizationId, eventId, locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const event = await getOrganizationEvent(organizationId, eventId);
  if (!event) notFound();
  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
        href={localePath(locale, `/organizer/${organizationId}/events/${eventId}`) as Route}
      >
        ← {t('Volver al evento')}
      </Link>
      <PageHeading title={t('Editar evento')} />
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm
          action={updateEventAction.bind(null, locale, organizationId, eventId)}
          event={event}
          locale={locale}
        />
      </section>
    </>
  );
}
