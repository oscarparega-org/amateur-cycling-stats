import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { OrganizerShell } from '@/components/organizer/organizer-shell';
import { getServerSession } from '@/lib/backend';
import { getOrganizerOrganizations } from '@/lib/organizer';
import { localePath, resolveLocale } from '@/lib/i18n';

export default async function OrganizerOrganizationLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string; organizationId: string }>;
}) {
  const { organizationId, locale: value } = await params;
  const locale = resolveLocale(value);
  const session = await getServerSession();
  if (!session)
    redirect(`${localePath(locale, '/login')}?next=${encodeURIComponent(localePath(locale, '/organizer'))}`);

  let organizations;
  try {
    organizations = await getOrganizerOrganizations();
  } catch {
    redirect(localePath(locale));
  }

  const activeOrganization = organizations.find((organization) => organization.id === organizationId);
  if (!activeOrganization) notFound();

  return (
    <OrganizerShell activeOrganization={activeOrganization} organizations={organizations} session={session}>
      {children}
    </OrganizerShell>
  );
}
