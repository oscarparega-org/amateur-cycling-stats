import Link from 'next/link';
import type { Route } from 'next';
import { localePath, translate, type Locale } from '@/lib/i18n';

export function EventTabs({
  active,
  basePath,
  locale
}: {
  active: 'overview' | 'races' | 'categories';
  basePath: string;
  locale: Locale;
}) {
  const items = [
    { id: 'overview', label: 'Resumen', path: basePath },
    { id: 'races', label: 'Carreras', path: `${basePath}/races` },
    { id: 'categories', label: 'Categorías', path: `${basePath}/categories` }
  ] as const;
  return (
    <nav
      aria-label={translate(locale, 'Navegación del evento')}
      className="mb-7 flex gap-1 overflow-x-auto border-b border-slate-300"
    >
      {items.map((item) => (
        <Link
          aria-current={item.id === active ? 'page' : undefined}
          className={`border-b-3 px-4 py-3 font-semibold ${item.id === active ? 'border-[#5f7382] text-[#102a43]' : 'border-transparent text-slate-500 hover:text-[#102a43]'}`}
          href={localePath(locale, item.path) as Route}
          key={item.id}
        >
          {translate(locale, item.label)}
        </Link>
      ))}
    </nav>
  );
}
