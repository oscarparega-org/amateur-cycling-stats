import Link from 'next/link';
import { Alert } from '@/components/alert';
import { AuthShell } from '@/components/auth/auth-shell';
import { getAuthQueryErrorMessage } from '@/lib/auth-errors';
import { getServerSession } from '@/lib/backend';
import { localePath, resolveLocale, translate } from '@/lib/i18n';
import { getPostLoginPath } from '@/lib/role-navigation';

export default async function EmailVerifiedPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locale: value }, { error }] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const message = getAuthQueryErrorMessage(error);
  const session = await getServerSession();
  return (
    <AuthShell title={message ? 'El enlace no funcionó' : 'Correo confirmado'}>
      {message ? (
        <>
          <Alert closeLabel={t('Cerrar alerta')} kind="error">
            {t(message)}
          </Alert>
          <Link
            className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]"
            href={localePath(locale, '/verify-email')}
          >
            {t('Solicitar otro enlace')}
          </Link>
        </>
      ) : (
        <>
          <Alert closeLabel={t('Cerrar alerta')} kind="success">
            {t('Tu correo quedó verificado correctamente.')}
          </Alert>
          <Link
            className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]"
            href={session ? getPostLoginPath(localePath(locale), locale) : localePath(locale, '/login')}
          >
            {session ? t('Ir al panel') : t('Iniciar sesión')}
          </Link>
        </>
      )}
    </AuthShell>
  );
}
