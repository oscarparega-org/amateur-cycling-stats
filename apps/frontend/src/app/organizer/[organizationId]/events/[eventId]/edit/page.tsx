import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateEventAction } from '@/app/organizer/actions';
import { EventForm } from '@/components/organizer/event-form';
import { PageHeading } from '@/components/organizer/page-heading';
import { getOrganizationEvent } from '@/lib/organizer';

export default async function EditEventPage({
  params
}: {
  params: Promise<{ organizationId: string; eventId: string }>;
}) {
  const { organizationId, eventId } = await params;
  const event = await getOrganizationEvent(organizationId, eventId);
  if (!event) notFound();
  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
        href={`/organizer/${organizationId}/events/${eventId}`}
      >
        ← Volver al evento
      </Link>
      <PageHeading title="Editar evento" description={event.name} />
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm action={updateEventAction.bind(null, organizationId, eventId)} event={event} />
      </section>
    </>
  );
}
