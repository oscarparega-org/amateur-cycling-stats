'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { useLocale } from '@/components/locale-provider';
import { ProtectedNav, type ProtectedNavItem } from './protected-nav';
import { ProtectedSignOut } from './protected-sign-out';

export function ProtectedShell({
  account,
  children,
  navigation,
  roleLabel,
  workspace
}: {
  account: { email?: string; name: string };
  children: ReactNode;
  navigation: ProtectedNavItem[];
  roleLabel: string;
  workspace?: ReactNode;
}) {
  const { t, path } = useLocale();
  return (
    <div className="min-h-screen bg-[var(--workspace-canvas)] text-[#102a43] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden bg-[#102a43] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b border-white/10 px-7 py-7">
          <BrandMark inverse />
          <p className="mt-7 border-l-2 border-white/30 pl-3 text-sm font-semibold text-slate-300">{roleLabel}</p>
        </div>
        {workspace ? <div className="border-b border-white/10 px-5 py-5">{workspace}</div> : null}
        <ProtectedNav items={navigation} />
        <div className="mt-auto border-t border-white/10 p-5">
          <div className="mb-4">
            <LocaleSwitcher inverse />
          </div>
          <p className="truncate text-sm font-semibold">{account.name}</p>
          {account.email ? <p className="mt-0.5 truncate text-xs text-slate-300">{account.email}</p> : null}
          <div className="mt-4">
            <ProtectedSignOut />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-[#102a43] px-5 text-white lg:hidden">
          <div className="flex min-h-20 items-center justify-between gap-4">
            <BrandMark inverse />
            <ProtectedSignOut compact />
          </div>
        </header>
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <div className="flex items-center gap-4 px-5 pt-3">
            <p className="border-l-2 border-[var(--workspace-steel)] pl-3 text-sm font-semibold">{roleLabel}</p>
          </div>
          {workspace ? <div className="px-5 py-3">{workspace}</div> : null}
          <ProtectedNav items={navigation} mobile />
        </div>
        <header className="hidden min-h-16 items-center justify-between border-b border-slate-200 bg-white px-10 lg:flex">
          <ProtectedNav items={navigation} header />
          <Link className="text-sm font-bold text-[var(--workspace-steel)] hover:text-[#102a43]" href={path()}>
            {t('Ver sitio público')}
          </Link>
        </header>
        <main className="mx-auto w-full max-w-[86rem] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
