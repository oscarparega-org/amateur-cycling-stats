import Link from 'next/link';
import type { ReactNode } from 'react';
import { SignOutButton } from './sign-out-button';

export function AdminShell({ children, userName }: { children: ReactNode; userName: string }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-[#102a43] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex min-h-20 items-center justify-between gap-4 border-b border-white/15 px-5 lg:block lg:border-b-0 lg:px-6 lg:pt-7">
          <Link className="inline-flex items-center gap-3 rounded-sm" href="/admin/organizaciones">
            <span
              className="display-font grid h-10 w-10 place-items-center border-2 border-white text-lg font-bold"
              aria-hidden="true"
            >
              21
            </span>
            <span className="display-font text-xl font-semibold leading-[0.9]">
              Control de
              <br />
              carrera
            </span>
          </Link>
          <span className="rounded-full border border-orange-300/50 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-200 lg:mt-7 lg:inline-block">
            Administración
          </span>
        </div>

        <nav className="border-b border-white/15 px-3 py-3 lg:mt-8 lg:border-b-0" aria-label="Administración">
          <Link
            className="flex items-center gap-3 rounded-md bg-white px-3 py-2.5 font-bold text-[#102a43]"
            href="/admin/organizaciones"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" aria-hidden="true" />
            Organizaciones
          </Link>
        </nav>

        <div className="hidden px-6 lg:mt-auto lg:block lg:pb-6">
          <p className="mb-3 truncate text-sm text-blue-100">{userName}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-10">
          <p className="text-sm text-slate-500">
            Panel <span className="mx-2 text-slate-300">/</span>{' '}
            <span className="font-semibold text-[#102a43]">Organizaciones</span>
          </p>
          <Link className="text-sm font-bold text-blue-700 hover:text-blue-900" href="/">
            Ver sitio
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">{children}</main>
        <div className="border-t border-white/15 bg-[#102a43] px-5 py-4 lg:hidden">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
