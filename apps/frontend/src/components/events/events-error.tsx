import Link from 'next/link';
import { localePath, translate, type Locale } from '@/lib/i18n';

export function EventsError({ locale = 'es' }: { locale?: Locale }) {
  const t = (text: string) => translate(locale, text);
  return (
    <div className="border-y border-slate-300 py-14 text-center" role="alert">
      <p className="display-font text-3xl font-semibold text-[#102a43]">{t('No pudimos cargar los eventos')}</p>
      <p className="mt-2 text-slate-600">{t('Revisa tu conexión e intenta de nuevo.')}</p>
      <Link
        className="mt-6 inline-flex border-2 border-[#102a43] px-5 py-2.5 font-bold hover:bg-[#102a43] hover:text-white"
        href={localePath(locale)}
      >
        {t('Intentar de nuevo')}
      </Link>
    </div>
  );
}
