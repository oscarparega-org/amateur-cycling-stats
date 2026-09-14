import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { getServerSession } from '@/lib/backend';
import { localePath, resolveLocale } from '@/lib/i18n';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  if (await getServerSession()) redirect(localePath(locale));
  return (
    <AuthShell
      title="Toma la salida"
      intro="Crea tu perfil de ciclista y mantén todos tus resultados en un solo lugar."
    >
      <RegisterForm />
    </AuthShell>
  );
}
