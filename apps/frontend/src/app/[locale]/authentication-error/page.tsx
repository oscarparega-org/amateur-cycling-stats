import Link from 'next/link';
import { Alert } from '@/components/alert';
import { AuthShell } from '@/components/auth/auth-shell';
import { getAuthQueryErrorMessage } from '@/lib/auth-errors';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function AuthErrorPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locale: value }, { error }] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const message = getAuthQueryErrorMessage(error) ?? 'No pudimos completar el acceso con ese enlace.';
  return (
    <AuthShell title="Acceso interrumpido" intro="El intento de autenticación no pudo terminar.">
      <Alert closeLabel={t('Cerrar alerta')} kind="error">
        {t(message)}
      </Alert>
      <Link
        className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]"
        href={localePath(locale, '/login')}
      >
        {t('Volver a iniciar sesión')}
      </Link>
    </AuthShell>
  );
}
