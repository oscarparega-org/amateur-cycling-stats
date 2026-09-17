'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Organization } from '@acs/shared';
import { ProtectedShell } from '@/components/protected/protected-shell';
import type { AuthSession } from '@/lib/auth-types';
import { useLocale } from '@/components/locale-provider';

export function OrganizerShell({
  activeOrganization,
  organizations,
  session,
  children
}: {
  activeOrganization: Organization;
  organizations: Organization[];
  session: AuthSession;
  children: ReactNode;
}) {
  const { t, path } = useLocale();
  const base = path(`/organizer/${activeOrganization.id}`);
  return (
    <ProtectedShell
      account={{ email: session.user.email, name: session.user.firstName || session.user.name }}
      navigation={[
        { href: base as Route, icon: 'overview', label: t('Resumen'), match: 'exact' },
        { href: `${base}/events` as Route, icon: 'events', label: t('Eventos') },
        { href: `${base}/categories` as Route, icon: 'categories', label: t('Categorías') }
      ]}
      roleLabel={t('Organización')}
      workspace={<OrganizationSwitcher activeOrganization={activeOrganization} organizations={organizations} />}
    >
      {children}
    </ProtectedShell>
  );
}

function OrganizationSwitcher({
  activeOrganization,
  organizations
}: {
  activeOrganization: Organization;
  organizations: Organization[];
}) {
  const { path } = useLocale();
  if (organizations.length === 1) return <p className="truncate font-semibold">{activeOrganization.name}</p>;

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
        <span className="truncate">{activeOrganization.name}</span>
        <span aria-hidden="true" className="group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <div className="mt-3 space-y-1 border-l-2 border-[var(--workspace-steel)] pl-3 lg:border-white/20">
        {organizations.map((organization) => (
          <Link
            aria-current={organization.id === activeOrganization.id ? 'page' : undefined}
            className="block py-1.5 text-sm text-[var(--workspace-steel)] hover:text-[#102a43] lg:text-slate-300 lg:hover:text-white"
            href={path(`/organizer/${organization.id}`) as Route}
            key={organization.id}
          >
            {organization.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
