import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { getAuthQueryErrorMessage } from '@/lib/auth-errors';

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell title="Nueva contraseña" intro="Elige una contraseña que no uses en otros servicios.">
      <ResetPasswordForm token={query.token} linkError={getAuthQueryErrorMessage(query.error)} />
    </AuthShell>
  );
}
