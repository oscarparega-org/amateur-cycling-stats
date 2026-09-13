import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { AuthSession } from '@/lib/auth-types';
import type { Organization } from '@acs/shared';
import { BrandMark } from '@/components/brand-mark';
import { OrganizerNav } from './organizer-nav';
import { OrganizerSignOut } from './organizer-sign-out';

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
  const base = `/organizer/${activeOrganization.id}`;
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#102a43]">
      <header className="border-b border-slate-200 bg-white lg:hidden">
        <div className="flex min-h-18 items-center justify-between gap-3 px-5">
          <BrandMark />
          <OrganizerSignOut />
        </div>
      </header>
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[17rem_1fr]">
        <aside className="hidden border-r border-slate-800 bg-[#102a43] text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-7 py-7">
            <BrandMark inverse />
          </div>
          <div className="px-5 py-6">
            <p className="text-sm text-blue-200">Organización activa</p>
            <details className="group mt-2">
              <summary className="cursor-pointer list-none rounded-md border border-white/15 bg-white/5 px-3 py-3 font-semibold hover:bg-white/10">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate">{activeOrganization.name}</span>
                  <span aria-hidden="true" className="text-blue-200 group-open:rotate-180">
                    ⌄
                  </span>
                </span>
              </summary>
              {organizations.length > 1 ? (
                <div className="mt-2 overflow-hidden rounded-md border border-white/10 bg-[#173f64] p-1">
                  {organizations.map((organization) => (
                    <Link
                      className="block rounded px-3 py-2 text-sm hover:bg-white/10"
                      href={`/organizer/${organization.id}` as Route}
                      key={organization.id}
                    >
                      {organization.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-3 pt-3 text-xs leading-5 text-blue-200">Esta es tu única organización.</p>
              )}
            </details>
          </div>
          <OrganizerNav base={base} />
          <div className="mt-auto border-t border-white/10 p-5">
            <p className="truncate text-sm font-semibold">{session.user.firstName || session.user.name}</p>
            <p className="truncate text-xs text-blue-200">{session.user.email}</p>
            <div className="mt-4">
              <OrganizerSignOut inverse />
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="border-b border-slate-200 bg-white px-5 py-3 sm:px-8 lg:hidden">
            <details>
              <summary className="cursor-pointer list-none truncate text-sm font-semibold">
                {activeOrganization.name} <span aria-hidden="true">⌄</span>
              </summary>
              {organizations.length > 1 ? (
                <div className="mt-2 space-y-1 border-l-2 border-slate-200 pl-3">
                  {organizations.map((organization) => (
                    <Link
                      className="block py-1 text-sm text-blue-700"
                      href={`/organizer/${organization.id}` as Route}
                      key={organization.id}
                    >
                      {organization.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </details>
            <OrganizerNav base={base} mobile />
          </div>
          <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
