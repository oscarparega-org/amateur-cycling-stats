import Link from 'next/link';
import { OrganizationForm } from '@/components/admin/organization-form';

export default function NewOrganizationPage() {
  return (
    <>
      <Link
        className="text-sm font-bold text-[var(--workspace-steel)] hover:text-[#102a43]"
        href="/admin/organizaciones"
      >
        Volver a organizaciones
      </Link>
      <div className="mt-6 border-b border-slate-300 pb-7">
        <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
          Nueva organización
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          Se creará inactiva. Actívala desde su ficha cuando esté lista para operar.
        </p>
      </div>
      <div className="mt-8">
        <OrganizationForm />
      </div>
    </>
  );
}
