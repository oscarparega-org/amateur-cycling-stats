import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getServerSession } from '@/lib/backend';
import { getPostLoginPath } from '@/lib/role-navigation';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { localePath, resolveLocale } from '@/lib/i18n';

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const [{ locale: value }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const destination = safeRedirectPath(query.next, localePath(locale));
  if (await getServerSession()) redirect(getPostLoginPath(destination, locale) as Route);
  return (
    <AuthShell title="Vuelve a la ruta" intro="Inicia sesión para consultar tus resultados y gestionar tus carreras.">
      <LoginForm next={destination} resetComplete={query.reset === 'complete'} />
    </AuthShell>
  );
}
