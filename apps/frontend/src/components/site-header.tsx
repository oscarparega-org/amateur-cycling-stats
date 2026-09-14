'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import type { AuthSession } from '@/lib/auth-types';
import { useLocale } from './locale-provider';
import { BrandMark } from './brand-mark';
import { LocaleSwitcher } from './locale-switcher';

export function SiteHeader({ initialSession }: { initialSession: AuthSession | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, path } = useLocale();
  const [signingOut, setSigningOut] = useState(false);
  const { data: liveSession, isPending } = authClient.useSession();
  const session = isPending ? initialSession : (liveSession as AuthSession | null);
  const authPaths: string[] = [
    path('/login'),
    path('/register'),
    path('/verify-email'),
    path('/email-verified'),
    path('/forgot-password'),
    path('/reset-password'),
    path('/accept-invitation'),
    path('/authentication-error')
  ];
  if (authPaths.includes(pathname) || pathname.startsWith(path('/admin')) || pathname.startsWith(path('/organizer')))
    return null;

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push(path());
    router.refresh();
    setSigningOut(false);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <BrandMark />
        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label={t('Cuenta')}>
            {session ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  {session.user.firstName || session.user.name || session.user.email}
                </span>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-[#102a43] hover:border-[#102a43] disabled:cursor-wait disabled:opacity-60 sm:px-4"
                  disabled={signingOut}
                  onClick={signOut}
                  type="button"
                >
                  {signingOut ? t('Cerrando…') : t('Cerrar sesión')}
                </button>
              </>
            ) : (
              <>
                <Link
                  className="px-2 py-2 text-sm font-semibold text-[#102a43] hover:text-blue-700 sm:px-3"
                  href={path('/login')}
                >
                  {t('Iniciar sesión')}
                </Link>
                <Link
                  className="rounded-md bg-[#102a43] px-3 py-2 text-sm font-semibold text-white hover:bg-[#173f64] sm:px-4"
                  href={path('/register')}
                >
                  {t('Crear cuenta')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
