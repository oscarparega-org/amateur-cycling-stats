'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Route } from 'next';
import type { Locale } from '@/lib/i18n';
import { localePath, translate } from '@/lib/i18n';

type LocaleContextValue = {
  locale: Locale;
  t: (text: string) => string;
  path: (path?: string) => Route;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'es',
  t: (text) => text,
  path: (path) => localePath('es', path)
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider
      value={{ locale, t: (text) => translate(locale, text), path: (path) => localePath(locale, path) }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  return context;
}
