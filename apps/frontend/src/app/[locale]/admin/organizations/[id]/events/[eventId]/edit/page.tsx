import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { EventForm } from '@/components/organizer/event-form';
import { PageHeading } from '@/components/organizer/page-heading';
import { updateEventAction } from '@/lib/event-actions';
import { getOrganizationEvent } from '@/lib/organizer';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function EditAdminEventPage({
  params
}: {
  params: Promise<{ locale: string; id: string; eventId: string }>;
}) {
  const { id, eventId, locale: value } = await params;
  const locale = resolveLocale(value);
  const event = await getOrganizationEvent(id, eventId);
  if (!event) notFound();
  const basePath = `/admin/organizations/${id}/events`;
  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-blue-700"
        href={localePath(locale, `${basePath}/${eventId}`) as Route}
      >
        ← {translate(locale, 'Volver al evento')}
      </Link>
      <PageHeading title={translate(locale, 'Editar evento')} />
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm action={updateEventAction.bind(null, locale, id, eventId, basePath)} event={event} locale={locale} />
      </section>
    </>
  );
}
