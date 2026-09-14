import type { OrganizationInvitation } from '@acs/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Alert } from '@/components/alert';
import { AuthShell } from '@/components/auth/auth-shell';
import { InvitationForm } from '@/components/auth/invitation-form';
import { backendFetch, getServerSession } from '@/lib/backend';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function AcceptInvitationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const session = await getServerSession();
  if (!session)
    redirect(`${localePath(locale, '/login')}?next=${encodeURIComponent(localePath(locale, '/accept-invitation'))}`);
  let invitation: OrganizationInvitation | null = null;
  try {
    const response = await backendFetch(`/api/invitations?email=${encodeURIComponent(session.user.email)}`);
    if (response.ok) invitation = (await response.json()) as OrganizationInvitation | null;
  } catch {
    /* Render the actionable unavailable state below. */
  }
  return (
    <AuthShell title="Aceptar invitación">
      {invitation ? (
        <InvitationForm
          invitation={invitation}
          defaultFirstName={session.user.firstName ?? ''}
          defaultLastName={session.user.lastName ?? ''}
        />
      ) : (
        <>
          <Alert closeLabel={t('Cerrar alerta')} kind="error">
            {t('No encontramos una invitación pendiente para')} {session.user.email}.{' '}
            {t('Puede haber expirado o ya fue aceptada.')}
          </Alert>
          <Link
            className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]"
            href={localePath(locale)}
          >
            {t('Ir al inicio')}
          </Link>
        </>
      )}
    </AuthShell>
  );
}
