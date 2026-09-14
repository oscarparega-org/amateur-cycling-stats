'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { localeCookieName, locales, type Locale } from '@/lib/i18n';
import { useLocale } from './locale-provider';

const labels: Record<Locale, string> = { en: 'EN', es: 'ES' };

export function LocaleSwitcher({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const segments = pathname.split('/');

  return (
    <nav aria-label={locale === 'es' ? 'Idioma' : 'Language'} className="flex items-center gap-1">
      {locales.map((nextLocale) => {
        segments[1] = nextLocale;
        const href = segments.join('/') || `/${nextLocale}`;
        const active = nextLocale === locale;
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={`rounded px-2 py-1 text-xs font-bold ${
              active
                ? inverse
                  ? 'bg-white text-[#102a43]'
                  : 'bg-[#102a43] text-white'
                : inverse
                  ? 'text-blue-100 hover:bg-white/10'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            href={href as Route}
            key={nextLocale}
            hrefLang={nextLocale}
            onClick={() => {
              document.cookie = `${localeCookieName}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
            }}
          >
            {labels[nextLocale]}
          </Link>
        );
      })}
    </nav>
  );
}
