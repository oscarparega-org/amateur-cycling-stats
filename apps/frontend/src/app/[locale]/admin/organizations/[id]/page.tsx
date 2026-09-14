import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Organization } from '@acs/shared';
import { OrganizationStateForm } from '@/components/admin/organization-state-form';
import { AdminStatusMessage } from '@/components/admin/status-message';
import { backendFetch } from '@/lib/backend';
import { localeDate, localePath, resolveLocale, translate, type Locale } from '@/lib/i18n';

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeDate(locale), { dateStyle: 'long' }).format(new Date(value));
}

export default async function OrganizationPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ id, locale: value }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const response = await backendFetch(`/api/organizations/${encodeURIComponent(id)}`);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Organization request failed');
  const organization = (await response.json()) as Organization;

  return (
    <>
      <AdminStatusMessage result={query.result} />
      <Link
        className="text-sm font-bold text-blue-700 hover:text-blue-900"
        href={localePath(locale, '/admin/organizations')}
      >
        {t('Volver a organizaciones')}
      </Link>

      <div className="mt-6 flex flex-col gap-6 border-b border-slate-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                organization.state === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {t(organization.state === 'ACTIVE' ? 'Activa' : 'Inactiva')}
            </span>
            <span className="text-sm text-slate-500">
              {organization.eventCount ?? 0} {t('eventos')}
            </span>
          </div>
          <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
            {organization.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <OrganizationStateForm organization={organization} />
          <Link
            className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white hover:bg-[#173f64]"
            href={localePath(locale, `/admin/organizations/${organization.id}/edit`)}
          >
            {t('Editar información')}
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)]">
        <section className="border-t-4 border-[#2563eb] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="display-font text-3xl font-semibold text-[#102a43]">{t('Información')}</h2>
          <p className="mt-5 max-w-2xl whitespace-pre-wrap text-base leading-7 text-slate-700">
            {organization.description || t('Esta organización todavía no tiene descripción.')}
          </p>
        </section>

        <dl className="divide-y divide-slate-200 border-y border-slate-300">
          <div className="py-4">
            <dt className="text-sm text-slate-500">{t('Creada')}</dt>
            <dd className="mt-1 font-semibold text-[#102a43]">{formatDate(organization.createdAt, locale)}</dd>
          </div>
          <div className="py-4">
            <dt className="text-sm text-slate-500">{t('Última actualización')}</dt>
            <dd className="mt-1 font-semibold text-[#102a43]">{formatDate(organization.updatedAt, locale)}</dd>
          </div>
          <div className="py-4">
            <dt className="text-sm text-slate-500">{t('Identificador')}</dt>
            <dd className="mt-1 break-all font-mono text-xs text-slate-600">{organization.id}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
