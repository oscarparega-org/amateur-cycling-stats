'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import type { AuthSession } from '@/lib/auth-types';
import { useLocale } from './locale-provider';
import { BrandMark } from './brand-mark';
import { LocaleSwitcher } from './locale-switcher';

export function SiteHeader({ initialSession }: { initialSession: AuthSession | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, t, path } = useLocale();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { data: liveSession, isPending } = authClient.useSession();
  const session = isPending ? initialSession : (liveSession as AuthSession | null);
  const displayName = session?.user.firstName || session?.user.name || session?.user.email || '';
  const accountInitial = displayName.charAt(0).toLocaleUpperCase(locale === 'es' ? 'es-MX' : 'en-US');

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

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
    setMenuOpen(false);
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
          <nav className="relative flex items-center gap-1 sm:gap-2" aria-label={t('Cuenta')}>
            {session ? (
              <div ref={menuRef}>
                <button
                  ref={menuButtonRef}
                  aria-controls="account-menu"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label={`${t(menuOpen ? 'Cerrar menú de' : 'Abrir menú de')} ${displayName}`}
                  className="flex min-h-11 items-center gap-2 border border-slate-300 bg-white py-1.5 pr-2 pl-1.5 text-left text-[#102a43] hover:border-[#102a43] sm:gap-3 sm:pr-3"
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  <span
                    className="display-font grid h-8 w-8 place-items-center bg-[#102a43] text-base font-bold text-white"
                    aria-hidden="true"
                  >
                    {accountInitial}
                  </span>
                  <span className="hidden max-w-36 truncate text-sm font-semibold sm:block">{displayName}</span>
                  <svg
                    aria-hidden="true"
                    className={`h-4 w-4 text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>

                {menuOpen ? (
                  <div
                    id="account-menu"
                    className="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-72 max-w-[calc(100vw-2.5rem)] border border-slate-200 border-t-4 border-t-[#f97316] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
                  >
                    <div className="border-b border-slate-200 px-4 py-3">
                      <p className="font-semibold text-[#102a43]">{session.user.name || displayName}</p>
                      <p className="truncate text-sm text-slate-500">{session.user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        className="flex min-h-11 items-center gap-3 px-3 py-2 font-semibold text-[#102a43] hover:bg-slate-100"
                        href={path('/panel')}
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg aria-hidden="true" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24">
                          <path
                            d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
                            stroke="currentColor"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                        {t('Ir al panel')}
                      </Link>
                      <button
                        className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                        disabled={signingOut}
                        onClick={signOut}
                        type="button"
                      >
                        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <path
                            d="M10 5H5v14h5m4-3 4-4-4-4m4 4H9"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                        {signingOut ? t('Cerrando…') : t('Cerrar sesión')}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
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
