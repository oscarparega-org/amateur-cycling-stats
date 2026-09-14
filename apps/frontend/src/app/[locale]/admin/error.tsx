'use client';

import { useLocale } from '@/components/locale-provider';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLocale();
  return (
    <section className="border-t-4 border-red-600 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="display-font text-4xl font-semibold tracking-tight text-[#102a43]">
        {t('No pudimos abrir el panel')}
      </h1>
      <p className="mt-3 max-w-xl text-slate-600">
        {t('El servicio de administración no respondió. Revisa la conexión e inténtalo de nuevo.')}
      </p>
      <button
        className="mt-6 rounded-md bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64]"
        onClick={reset}
        type="button"
      >
        {t('Reintentar')}
      </button>
    </section>
  );
}
