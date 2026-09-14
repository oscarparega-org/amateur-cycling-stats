'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';

export default function OrganizationNotFound() {
  const { t, path } = useLocale();
  return (
    <section className="border-l-4 border-[#f97316] bg-white p-7 shadow-sm">
      <h1 className="display-font text-4xl font-semibold text-[#102a43]">{t('Organización no encontrada')}</h1>
      <p className="mt-3 text-slate-600">{t('Puede haber sido eliminada o el enlace ya no es válido.')}</p>
      <Link
        className="mt-6 inline-block font-bold text-blue-700 underline underline-offset-4"
        href={path('/admin/organizations')}
      >
        {t('Volver a organizaciones')}
      </Link>
    </section>
  );
}
