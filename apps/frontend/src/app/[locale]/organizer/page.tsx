import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { getServerSession } from '@/lib/backend';
import { getOrganizerOrganizations } from '@/lib/organizer';
import { localePath, resolveLocale, translate } from '@/lib/i18n';

export default async function OrganizerEntryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const locale = resolveLocale(value);
  const t = (text: string) => translate(locale, text);
  const session = await getServerSession();
  if (!session)
    redirect(`${localePath(locale, '/login')}?next=${encodeURIComponent(localePath(locale, '/organizer'))}`);

  let organizations;
  try {
    organizations = await getOrganizerOrganizations();
  } catch {
    redirect(localePath(locale));
  }
  if (organizations[0]) redirect(localePath(locale, `/organizer/${organizations[0].id}`) as Route);

  return (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-5xl font-semibold">{t('Aún no tienes una organización')}</h1>
      <p className="mt-5 text-lg text-slate-600">{t('Acepta una invitación de organización para abrir el panel.')}</p>
      <Link
        className="mt-8 inline-block rounded-md bg-[#102a43] px-5 py-3 font-bold text-white"
        href={localePath(locale)}
      >
        {t('Volver al inicio')}
      </Link>
    </main>
  );
}
