import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { RoleTypeEnum } from '@acs/shared';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { getCurrentUserContext, getServerSession } from '@/lib/backend';
import { localePath, resolveLocale } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  return { title: `${resolveLocale(value) === 'es' ? 'Administración' : 'Administration'} | Amateur Cycling Stats` };
}

export default async function AdminLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  const session = await getServerSession();
  if (!session)
    redirect(`${localePath(locale, '/login')}?next=${encodeURIComponent(localePath(locale, '/admin/organizations'))}`);

  const currentUser = await getCurrentUserContext();
  if (!currentUser || currentUser.roleType !== RoleTypeEnum.ADMIN) redirect(localePath(locale));

  const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ');
  return (
    <AdminShell userEmail={currentUser.email} userName={fullName || currentUser.email}>
      {children}
    </AdminShell>
  );
}
