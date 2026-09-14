import Link from 'next/link';
import { OrganizationForm } from '@/components/admin/organization-form';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function NewOrganizationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  return (
    <>
      <Link
        className="text-sm font-bold text-blue-700 hover:text-blue-900"
        href={localePath(locale, '/admin/organizations')}
      >
        {t('Volver a organizaciones')}
      </Link>
      <div className="mt-6 border-b border-slate-300 pb-7">
        <h1 className="display-font text-5xl font-semibold leading-none tracking-tight text-[#102a43] sm:text-6xl">
          {t('Nueva organización')}
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          {t('Se creará inactiva. Actívala desde su ficha cuando esté lista para operar.')}
        </p>
      </div>
      <div className="mt-8">
        <OrganizationForm />
      </div>
    </>
  );
}
