'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavIcon({ kind }: { kind: 'overview' | 'events' }) {
  return kind === 'overview' ? (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3v3m10-3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function OrganizerNav({ base, mobile = false }: { base: string; mobile?: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: base as Route, label: 'Resumen', icon: 'overview' as const, active: pathname === base },
    {
      href: `${base}/events` as Route,
      label: 'Eventos',
      icon: 'events' as const,
      active: pathname.startsWith(`${base}/events`)
    }
  ];

  return (
    <nav aria-label="Panel del organizador" className={mobile ? 'mt-2 flex gap-2 overflow-x-auto' : 'space-y-1 px-4'}>
      {links.map((link) => (
        <Link
          aria-current={link.active ? 'page' : undefined}
          className={
            mobile
              ? `flex items-center gap-2 border-b-2 px-2 py-2 text-sm font-semibold ${link.active ? 'border-[#f97316] text-[#102a43]' : 'border-transparent text-slate-500'}`
              : `flex items-center gap-3 rounded-md px-4 py-3 font-semibold ${link.active ? 'bg-white text-[#102a43]' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`
          }
          href={link.href}
          key={link.href}
        >
          <NavIcon kind={link.icon} />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
