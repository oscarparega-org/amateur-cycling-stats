import { redirect } from 'next/navigation';
import { localePath, resolveLocale } from '@/lib/i18n';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  redirect(localePath(resolveLocale(value), '/admin/organizations'));
}
