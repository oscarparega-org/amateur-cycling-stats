import { notFound } from 'next/navigation';
import { RaceManagement } from '@/components/management/race-management';
import { getOrganizationEvent } from '@/lib/organizer';
import { resolveLocale } from '@/lib/i18n';

export default async function AdminRacesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string; eventId: string; racePath?: string[] }>;
  searchParams: Promise<{ notice?: string; error?: string; deletedResults?: string }>;
}) {
  const [{ locale: value, id, eventId, racePath }, query] = await Promise.all([params, searchParams]);
  const event = await getOrganizationEvent(id, eventId);
  if (!event) notFound();
  return (
    <RaceManagement
      deletedResults={query.deletedResults}
      error={query.error}
      event={event}
      eventBasePath={`/admin/organizations/${id}/events/${eventId}`}
      locale={resolveLocale(value)}
      notice={query.notice}
      segments={racePath}
    />
  );
}
