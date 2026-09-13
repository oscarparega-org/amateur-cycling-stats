import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { getServerSession } from '@/lib/backend';
import { getOrganizerOrganizations } from '@/lib/organizer';

export default async function OrganizerEntryPage() {
  const session = await getServerSession();
  if (!session) redirect('/iniciar-sesion?next=/organizer');

  let organizations;
  try {
    organizations = await getOrganizerOrganizations();
  } catch {
    redirect('/');
  }
  if (organizations[0]) redirect(`/organizer/${organizations[0].id}` as Route);

  return (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-5xl font-semibold">Aún no tienes una organización</h1>
      <p className="mt-5 text-lg text-slate-600">Acepta una invitación de organización para abrir el panel.</p>
      <Link className="mt-8 inline-block rounded-md bg-[#102a43] px-5 py-3 font-bold text-white" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
