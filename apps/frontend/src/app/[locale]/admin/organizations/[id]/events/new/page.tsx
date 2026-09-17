import Link from 'next/link';
import type { Route } from 'next';
import { EventForm } from '@/components/organizer/event-form';
import { PageHeading } from '@/components/organizer/page-heading';
import { createEventAction } from '@/lib/event-actions';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function NewAdminEventPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale: value } = await params;
  const locale = resolveLocale(value);
  const basePath = `/admin/organizations/${id}/events`;
  return (
    <>
      <Link className="mb-5 inline-block font-semibold text-blue-700" href={localePath(locale, basePath) as Route}>
        ← {translate(locale, 'Volver a eventos')}
      </Link>
      <PageHeading title={translate(locale, 'Crear evento')} />
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm action={createEventAction.bind(null, locale, id, basePath)} locale={locale} />
      </section>
    </>
  );
}
