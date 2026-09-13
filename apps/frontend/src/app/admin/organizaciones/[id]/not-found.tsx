import Link from 'next/link';

export default function OrganizationNotFound() {
  return (
    <section className="border-l-4 border-[#f97316] bg-white p-7 shadow-sm">
      <h1 className="display-font text-4xl font-semibold text-[#102a43]">Organización no encontrada</h1>
      <p className="mt-3 text-slate-600">Puede haber sido eliminada o el enlace ya no es válido.</p>
      <Link
        className="mt-6 inline-block font-bold text-blue-700 underline underline-offset-4"
        href="/admin/organizaciones"
      >
        Volver a organizaciones
      </Link>
    </section>
  );
}
