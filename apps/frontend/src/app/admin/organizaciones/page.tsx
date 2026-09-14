import Link from 'next/link';
import type { Organization } from '@acs/shared';
import { AdminStatusMessage } from '@/components/admin/status-message';
import { backendFetch } from '@/lib/backend';

function stateLabel(state: Organization['state']) {
  return state === 'ACTIVE' ? 'Activa' : 'Inactiva';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<{ resultado?: string }> }) {
  const [query, response] = await Promise.all([searchParams, backendFetch('/api/organizations')]);
  if (!response.ok) throw new Error('Organizations request failed');
  const organizations = (await response.json()) as Organization[];
  const activeCount = organizations.filter((organization) => organization.state === 'ACTIVE').length;

  return (
    <>
      <AdminStatusMessage result={query.resultado} />
      <div className="flex flex-col gap-6 border-b border-slate-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
          Organizaciones
        </h1>
        <Link
          className="w-fit rounded-md bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64]"
          href="/admin/organizaciones/nueva"
        >
          Nueva organización
        </Link>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 py-5 text-sm">
        <p>
          <span className="display-font mr-2 text-3xl font-semibold text-[#102a43]">{organizations.length}</span>
          <span className="text-slate-500">registradas</span>
        </p>
        <p>
          <span className="display-font mr-2 text-3xl font-semibold text-emerald-700">{activeCount}</span>
          <span className="text-slate-500">activas</span>
        </p>
      </div>

      {organizations.length ? (
        <div className="mt-7 overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-sm text-slate-600">
                <th className="px-5 py-3 font-semibold">Organización</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Eventos</th>
                <th className="px-5 py-3 text-right font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr
                  className="border-b border-slate-200 last:border-0 hover:bg-[var(--workspace-fog)]"
                  key={organization.id}
                >
                  <td className="px-5 py-4">
                    <Link
                      className="font-bold text-[#102a43] underline decoration-slate-300 underline-offset-4 hover:decoration-[var(--workspace-steel)]"
                      href={`/admin/organizaciones/${organization.id}`}
                    >
                      {organization.name}
                    </Link>
                    {organization.description ? (
                      <p className="mt-1 max-w-md truncate text-sm text-slate-500">{organization.description}</p>
                    ) : null}
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
                      {stateLabel(organization.state)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-700">
                    {organization.eventCount ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-slate-500">{formatDate(organization.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 border-l-4 border-[var(--workspace-steel)] bg-white px-6 py-8 shadow-sm">
          <h2 className="display-font text-3xl font-semibold text-[#102a43]">Aún no hay organizaciones</h2>
          <Link
            className="mt-5 inline-block font-bold text-[#102a43] underline decoration-slate-300 underline-offset-4"
            href="/admin/organizaciones/nueva"
          >
            Crear organización
          </Link>
        </div>
      )}
    </>
  );
}
