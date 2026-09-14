import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Organization } from '@acs/shared';
import { OrganizationStateForm } from '@/components/admin/organization-state-form';
import { AdminStatusMessage } from '@/components/admin/status-message';
import { backendFetch } from '@/lib/backend';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(value));
}

export default async function OrganizationPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ resultado?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const response = await backendFetch(`/api/organizations/${encodeURIComponent(id)}`);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Organization request failed');
  const organization = (await response.json()) as Organization;

  return (
    <>
      <AdminStatusMessage result={query.resultado} />
      <Link
        className="text-sm font-bold text-[var(--workspace-steel)] hover:text-[#102a43]"
        href="/admin/organizaciones"
      >
        Volver a organizaciones
      </Link>

      <div className="mt-6 flex flex-col gap-6 border-b border-slate-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                organization.state === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {organization.state === 'ACTIVE' ? 'Activa' : 'Inactiva'}
            </span>
            <span className="text-sm text-slate-500">{organization.eventCount ?? 0} eventos</span>
          </div>
          <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
            {organization.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <OrganizationStateForm organization={organization} />
          <Link
            className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white hover:bg-[#173f64]"
            href={`/admin/organizaciones/${organization.id}/editar`}
          >
            Editar información
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)]">
        <section className="border-t-4 border-[var(--workspace-steel)] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="display-font text-3xl font-semibold text-[#102a43]">Información</h2>
          {organization.description ? (
            <p className="mt-5 max-w-2xl whitespace-pre-wrap text-base leading-7 text-slate-700">
              {organization.description}
            </p>
          ) : null}
        </section>

        <dl className="divide-y divide-slate-200 border-y border-slate-300">
          <div className="py-4">
            <dt className="text-sm text-slate-500">Creada</dt>
            <dd className="mt-1 font-semibold text-[#102a43]">{formatDate(organization.createdAt)}</dd>
          </div>
          <div className="py-4">
            <dt className="text-sm text-slate-500">Última actualización</dt>
            <dd className="mt-1 font-semibold text-[#102a43]">{formatDate(organization.updatedAt)}</dd>
          </div>
          <div className="py-4">
            <dt className="text-sm text-slate-500">Identificador</dt>
            <dd className="mt-1 break-all font-mono text-xs text-slate-600">{organization.id}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
