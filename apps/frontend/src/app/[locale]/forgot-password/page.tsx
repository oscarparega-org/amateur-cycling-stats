import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { RecoverForm } from '@/components/auth/recover-form';
import { getServerSession } from '@/lib/backend';
import { localePath, resolveLocale } from '@/lib/i18n';

export default async function RecoverPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (await getServerSession()) redirect(localePath(resolveLocale(value)));
  return (
    <AuthShell title="Recupera el acceso" intro="Te enviaremos un enlace seguro para definir una contraseña nueva.">
      <RecoverForm />
    </AuthShell>
  );
}
