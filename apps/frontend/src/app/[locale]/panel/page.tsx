import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserContext, getServerSession } from '@/lib/backend';
import { localePath, resolveLocale } from '@/lib/i18n';
import { resolvePanelDestination } from '@/lib/role-navigation';

export default async function PanelPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ locale: value }, { next }] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const session = await getServerSession();
  if (!session) redirect(localePath(locale, '/login'));

  const currentUser = await getCurrentUserContext();
  redirect(resolvePanelDestination(currentUser?.roleType, locale, next) as Route);
}
