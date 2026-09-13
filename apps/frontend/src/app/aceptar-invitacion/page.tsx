import type { OrganizationInvitation } from '@acs/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { StatusMessage } from '@/components/auth/form-controls';
import { InvitationForm } from '@/components/auth/invitation-form';
import { backendFetch, getServerSession } from '@/lib/backend';

export default async function AcceptInvitationPage() {
  const session = await getServerSession();
  if (!session) redirect('/iniciar-sesion?next=/aceptar-invitacion');
  let invitation: OrganizationInvitation | null = null;
  try {
    const response = await backendFetch(`/api/invitations?email=${encodeURIComponent(session.user.email)}`);
    if (response.ok) invitation = (await response.json()) as OrganizationInvitation | null;
  } catch {
    /* Render the actionable unavailable state below. */
  }
  return (
    <AuthShell
      title="Únete al equipo"
      intro="Completa tus datos para empezar a gestionar las carreras de tu organización."
    >
      {invitation ? (
        <InvitationForm
          invitation={invitation}
          defaultFirstName={session.user.firstName ?? ''}
          defaultLastName={session.user.lastName ?? ''}
        />
      ) : (
        <>
          <StatusMessage>
            No encontramos una invitación pendiente para {session.user.email}. Puede haber expirado o ya fue aceptada.
          </StatusMessage>
          <Link
            className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]"
            href="/"
          >
            Ir al inicio
          </Link>
        </>
      )}
    </AuthShell>
  );
}
