import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/organizer/page-heading';
import { getOrganization } from '@/lib/organizer';
import { localeDate, localePath, resolveLocale, translate, type Locale } from '@/lib/i18n';

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeDate(locale), { dateStyle: 'long' }).format(new Date(value));
}

export default async function OrganizationOverviewPage({
  params
}: {
  params: Promise<{ locale: string; organizationId: string }>;
}) {
  const { organizationId, locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const organization = await getOrganization(organizationId);
  if (!organization) notFound();

  return (
    <>
      <PageHeading
        title={t('Resumen de organización')}
        action={
          <Link
            className="rounded-md bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700"
            href={localePath(locale, `/organizer/${organizationId}/events/new`) as Route}
          >
            {t('Crear evento')}
          </Link>
        }
      />
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">{organization.name}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {organization.description || t('Esta organización aún no tiene una descripción.')}
              </p>
            </div>
            <span
              className={
                organization.state === 'ACTIVE'
                  ? 'rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800'
                  : 'rounded-full bg-slate-200 px-3 py-1 text-sm font-bold text-slate-700'
              }
            >
              {t(organization.state === 'ACTIVE' ? 'Activa' : 'Inactiva')}
            </span>
          </div>
          <dl className="mt-9 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">{t('Creada')}</dt>
              <dd className="mt-1 font-semibold">{formatDate(organization.createdAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">{t('Última actualización')}</dt>
              <dd className="mt-1 font-semibold">{formatDate(organization.updatedAt, locale)}</dd>
            </div>
          </dl>
        </div>
        <aside className="relative overflow-hidden bg-[#102a43] p-6 text-white sm:p-8">
          <div className="timing-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative">
            <p className="text-blue-200">{t('Eventos registrados')}</p>
            <p className="display-font mt-3 text-7xl font-semibold leading-none">{organization.eventCount ?? 0}</p>
            <Link
              className="mt-8 inline-flex border-b border-[#f97316] pb-1 font-bold text-white"
              href={localePath(locale, `/organizer/${organizationId}/events`) as Route}
            >
              {t('Gestionar eventos')}
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
