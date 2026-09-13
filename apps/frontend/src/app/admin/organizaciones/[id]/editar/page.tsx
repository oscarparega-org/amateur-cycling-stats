import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Organization } from '@acs/shared';
import { OrganizationForm } from '@/components/admin/organization-form';
import { backendFetch } from '@/lib/backend';

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await backendFetch(`/api/organizations/${encodeURIComponent(id)}`);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Organization request failed');
  const organization = (await response.json()) as Organization;

  return (
    <>
      <Link
        className="text-sm font-bold text-blue-700 hover:text-blue-900"
        href={`/admin/organizaciones/${organization.id}`}
      >
        Volver a {organization.name}
      </Link>
      <div className="mt-6 border-b border-slate-300 pb-7">
        <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
          Editar organización
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          Actualiza la información visible para administradores y organizadores.
        </p>
      </div>
      <div className="mt-8">
        <OrganizationForm organization={organization} />
      </div>
    </>
  );
}
