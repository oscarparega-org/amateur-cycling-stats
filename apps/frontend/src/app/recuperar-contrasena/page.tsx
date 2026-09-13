import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { RecoverForm } from '@/components/auth/recover-form';
import { getServerSession } from '@/lib/backend';

export default async function RecoverPasswordPage() {
  if (await getServerSession()) redirect('/');
  return <AuthShell title="Recupera el acceso" intro="Te enviaremos un enlace seguro para definir una contraseña nueva."><RecoverForm /></AuthShell>;
}
