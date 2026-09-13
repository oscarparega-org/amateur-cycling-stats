import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getServerSession } from '@/lib/backend';
import { safeRedirectPath } from '@/lib/safe-redirect';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const query = await searchParams;
  const destination = safeRedirectPath(query.next);
  if (await getServerSession()) redirect(destination as Route);
  return <AuthShell title="Vuelve a la ruta" intro="Inicia sesión para consultar tus resultados y gestionar tus carreras."><LoginForm next={destination} resetComplete={query.reset === 'completo'} /></AuthShell>;
}
