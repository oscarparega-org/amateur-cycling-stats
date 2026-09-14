import Link from 'next/link';
import type { Route } from 'next';
import { createEventAction } from '@/app/organizer/actions';
import { EventForm } from '@/components/organizer/event-form';
import { PageHeading } from '@/components/organizer/page-heading';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function NewEventPage({
  params
}: {
  params: Promise<{ locale: string; organizationId: string }>;
}) {
  const { organizationId, locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  return (
    <>
      <Link
        className="mb-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
        href={localePath(locale, `/organizer/${organizationId}/events`) as Route}
      >
        ← {t('Volver a eventos')}
      </Link>
      <PageHeading title={t('Crear evento')} />
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm action={createEventAction.bind(null, locale, organizationId)} locale={locale} />
      </section>
    </>
  );
}
