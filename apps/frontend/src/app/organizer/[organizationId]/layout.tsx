import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { OrganizerShell } from '@/components/organizer/organizer-shell';
import { getServerSession } from '@/lib/backend';
import { getOrganizerOrganizations } from '@/lib/organizer';

export default async function OrganizerOrganizationLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const session = await getServerSession();
  if (!session) redirect('/iniciar-sesion?next=/organizer');

  let organizations;
  try {
    organizations = await getOrganizerOrganizations();
  } catch {
    redirect('/');
  }

  const { organizationId } = await params;
  const activeOrganization = organizations.find((organization) => organization.id === organizationId);
  if (!activeOrganization) notFound();

  return (
    <OrganizerShell activeOrganization={activeOrganization} organizations={organizations} session={session}>
      {children}
    </OrganizerShell>
  );
}
