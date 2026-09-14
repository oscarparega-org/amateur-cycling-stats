import { AuthShell } from '@/components/auth/auth-shell';
import { VerificationPending } from '@/components/auth/verification-pending';

export default async function VerifyPendingPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <AuthShell title="Revisa tu correo">
      <VerificationPending initialEmail={email ?? ''} />
    </AuthShell>
  );
}
