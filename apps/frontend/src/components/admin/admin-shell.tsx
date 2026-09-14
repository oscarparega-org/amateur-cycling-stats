import type { Route } from 'next';
import type { ReactNode } from 'react';
import { ProtectedShell } from '@/components/protected/protected-shell';

export function AdminShell({
  children,
  userEmail,
  userName
}: {
  children: ReactNode;
  userEmail: string;
  userName: string;
}) {
  return (
    <ProtectedShell
      account={{ email: userEmail, name: userName }}
      navigation={[{ href: '/admin/organizaciones' as Route, icon: 'organizations', label: 'Organizaciones' }]}
      roleLabel="Administración"
    >
      {children}
    </ProtectedShell>
  );
}
