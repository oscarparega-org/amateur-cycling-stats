import Link from 'next/link';
import type { Route } from 'next';
import { createEventAction } from '@/app/organizer/actions';
import { EventForm } from '@/components/organizer/event-form';
import { PageHeading } from '@/components/organizer/page-heading';

export default async function NewEventPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;
  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
        href={`/organizer/${organizationId}/events` as Route}
      >
        ← Volver a eventos
      </Link>
      <PageHeading
        title="Crear evento"
        description="Define la información base. Podrás publicarlo cuando esté listo."
      />
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm action={createEventAction.bind(null, organizationId)} />
      </section>
    </>
  );
}
