import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { getServerSession } from '@/lib/backend';

export default async function RegisterPage() {
  if (await getServerSession()) redirect('/');
  return (
    <AuthShell title="Crear cuenta">
      <RegisterForm />
    </AuthShell>
  );
}
