import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { getServerSession } from '@/lib/backend';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amateur Cycling Stats',
  description: 'Amateur cycling events, races, and results'
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession();
  return (
    <html lang="es">
      <body><SiteHeader initialSession={session} />{children}</body>
    </html>
  );
}
