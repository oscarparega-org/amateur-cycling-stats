'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type ProtectedNavItem = {
  href: Route;
  icon: 'overview' | 'events' | 'organizations' | 'results' | 'profile';
  label: string;
  match?: 'exact' | 'prefix';
};

function NavIcon({ kind }: { kind: ProtectedNavItem['icon'] }) {
  const paths = {
    overview: 'M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z',
    events: 'M7 3v3m10-3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Z',
    organizations: 'M4 20V8l8-4 8 4v12M8 20v-5h8v5M8 10h.01M12 10h.01M16 10h.01',
    results: 'M5 4h14v16H5V4Zm3 11 2-3 2 2 4-5',
    profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0'
  } as const;
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

function isActive(pathname: string, item: ProtectedNavItem) {
  return item.match === 'exact'
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function ProtectedNav({
  header = false,
  items,
  mobile = false
}: {
  header?: boolean;
  items: ProtectedNavItem[];
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const activeItem = items.find((item) => isActive(pathname, item));
  if (header) return <p className="font-semibold">{activeItem?.label ?? items[0]?.label}</p>;

  return (
    <nav
      aria-label="Navegación del panel"
      className={mobile ? 'flex gap-1 overflow-x-auto px-3' : 'space-y-1 px-4 py-6'}
    >
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={
              mobile
                ? `flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold ${active ? 'border-[var(--workspace-steel)] text-[#102a43]' : 'border-transparent text-slate-500'}`
                : `flex items-center gap-3 border-l-2 px-4 py-3 font-semibold ${active ? 'border-white/40 bg-white text-[#102a43]' : 'border-transparent text-slate-300 hover:bg-white/10 hover:text-white'}`
            }
            href={item.href}
            key={item.href}
          >
            <NavIcon kind={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
