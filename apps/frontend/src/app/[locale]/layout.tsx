import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/components/locale-provider';
import { SiteHeader } from '@/components/site-header';
import { getServerSession } from '@/lib/backend';
import { isLocale, locales } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getServerSession();

  return (
    <LocaleProvider locale={locale}>
      <SiteHeader initialSession={session} />
      {children}
    </LocaleProvider>
  );
}
