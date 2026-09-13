import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { getServerSession } from '@/lib/backend';

export default async function RegisterPage() {
  if (await getServerSession()) redirect('/');
  return (
    <AuthShell
      title="Toma la salida"
      intro="Crea tu perfil de ciclista y mantén todos tus resultados en un solo lugar."
    >
      <RegisterForm />
    </AuthShell>
  );
}
