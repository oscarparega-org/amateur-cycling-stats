import Link from 'next/link';
import type { Organization } from '@acs/shared';
import { AdminStatusMessage } from '@/components/admin/status-message';
import { backendFetch } from '@/lib/backend';
import { localeDate, localePath, resolveLocale, translate, type Locale } from '@/lib/i18n';

function stateLabel(state: Organization['state'], locale: Locale) {
  return translate(locale, state === 'ACTIVE' ? 'Activa' : 'Inactiva');
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeDate(locale), { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value)
  );
}

export default async function OrganizationsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const [query, response] = await Promise.all([searchParams, backendFetch('/api/organizations')]);
  if (!response.ok) throw new Error('Organizations request failed');
  const organizations = (await response.json()) as Organization[];
  const activeCount = organizations.filter((organization) => organization.state === 'ACTIVE').length;

  return (
    <>
      <AdminStatusMessage result={query.result} />
      <div className="flex flex-col gap-6 border-b border-slate-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
            {t('Organizaciones')}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            {t('Administra los equipos responsables de publicar eventos y resultados.')}
          </p>
        </div>
        <Link
          className="w-fit rounded-md bg-[#f97316] px-5 py-3 font-bold text-white hover:bg-orange-600"
          href={localePath(locale, '/admin/organizations/new')}
        >
          {t('Nueva organización')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 py-5 text-sm">
        <p>
          <span className="display-font mr-2 text-3xl font-semibold text-[#102a43]">{organizations.length}</span>
          <span className="text-slate-500">{t('registradas')}</span>
        </p>
        <p>
          <span className="display-font mr-2 text-3xl font-semibold text-emerald-700">{activeCount}</span>
          <span className="text-slate-500">{t('activas')}</span>
        </p>
      </div>

      {organizations.length ? (
        <div className="mt-7 overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-sm text-slate-600">
                <th className="px-5 py-3 font-semibold">{t('Organización')}</th>
                <th className="px-5 py-3 font-semibold">{t('Estado')}</th>
                <th className="px-5 py-3 text-right font-semibold">{t('Eventos')}</th>
                <th className="px-5 py-3 text-right font-semibold">{t('Registro')}</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr className="border-b border-slate-200 last:border-0 hover:bg-blue-50/40" key={organization.id}>
                  <td className="px-5 py-4">
                    <Link
                      className="font-bold text-[#102a43] underline decoration-slate-300 underline-offset-4 hover:decoration-blue-700"
                      href={localePath(locale, `/admin/organizations/${organization.id}`)}
                    >
                      {organization.name}
                    </Link>
                    <p className="mt-1 max-w-md truncate text-sm text-slate-500">
                      {organization.description || t('Sin descripción')}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${
                        organization.state === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${organization.state === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-500'}`}
                        aria-hidden="true"
                      />
                      {stateLabel(organization.state, locale)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-700">
                    {organization.eventCount ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-slate-500">
                    {formatDate(organization.createdAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 border-l-4 border-[#f97316] bg-white px-6 py-8 shadow-sm">
          <h2 className="display-font text-3xl font-semibold text-[#102a43]">{t('Aún no hay organizaciones')}</h2>
          <p className="mt-2 text-slate-600">{t('Crea la primera para empezar a asignar eventos.')}</p>
          <Link
            className="mt-5 inline-block font-bold text-blue-700 underline underline-offset-4"
            href={localePath(locale, '/admin/organizations/new')}
          >
            {t('Crear organización')}
          </Link>
        </div>
      )}
    </>
  );
}
