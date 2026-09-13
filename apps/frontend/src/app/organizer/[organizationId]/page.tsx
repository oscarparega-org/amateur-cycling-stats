import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/organizer/page-heading';
import { getOrganization } from '@/lib/organizer';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(value));
}

export default async function OrganizationOverviewPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;
  const organization = await getOrganization(organizationId);
  if (!organization) notFound();

  return (
    <>
      <PageHeading
        title="Resumen de organización"
        description="La información principal y el acceso rápido a la operación de tus eventos."
        action={
          <Link
            className="rounded-md bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700"
            href={`/organizer/${organizationId}/events/new` as Route}
          >
            Crear evento
          </Link>
        }
      />
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">{organization.name}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {organization.description || 'Esta organización aún no tiene una descripción.'}
              </p>
            </div>
            <span
              className={
                organization.state === 'ACTIVE'
                  ? 'rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800'
                  : 'rounded-full bg-slate-200 px-3 py-1 text-sm font-bold text-slate-700'
              }
            >
              {organization.state === 'ACTIVE' ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <dl className="mt-9 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Creada</dt>
              <dd className="mt-1 font-semibold">{formatDate(organization.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Última actualización</dt>
              <dd className="mt-1 font-semibold">{formatDate(organization.updatedAt)}</dd>
            </div>
          </dl>
        </div>
        <aside className="relative overflow-hidden bg-[#102a43] p-6 text-white sm:p-8">
          <div className="timing-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative">
            <p className="text-blue-200">Eventos registrados</p>
            <p className="display-font mt-3 text-7xl font-semibold leading-none">{organization.eventCount ?? 0}</p>
            <Link
              className="mt-8 inline-flex border-b border-[#f97316] pb-1 font-bold text-white"
              href={`/organizer/${organizationId}/events` as Route}
            >
              Gestionar eventos
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
