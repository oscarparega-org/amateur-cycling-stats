'use client';

import type { Route } from 'next';
import type { ReactNode } from 'react';
import { ProtectedShell } from '@/components/protected/protected-shell';
import { useLocale } from '@/components/locale-provider';

export function AdminShell({
  children,
  userEmail,
  userName
}: {
  children: ReactNode;
  userEmail: string;
  userName: string;
}) {
  const { t, path } = useLocale();
  return (
    <ProtectedShell
      account={{ email: userEmail, name: userName }}
      navigation={[{ href: path('/admin/organizations') as Route, icon: 'organizations', label: t('Organizaciones') }]}
      roleLabel={t('Administración')}
    >
      {children}
    </ProtectedShell>
  );
}
