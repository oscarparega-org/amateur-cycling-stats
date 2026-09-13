import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { RoleTypeEnum } from '@acs/shared';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { getCurrentUserContext, getServerSession } from '@/lib/backend';

export const metadata: Metadata = {
  title: 'Administración | Amateur Cycling Stats'
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/iniciar-sesion?next=/admin/organizaciones');

  const currentUser = await getCurrentUserContext();
  if (!currentUser || currentUser.roleType !== RoleTypeEnum.ADMIN) redirect('/');

  const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ');
  return <AdminShell userName={fullName || currentUser.email}>{children}</AdminShell>;
}
