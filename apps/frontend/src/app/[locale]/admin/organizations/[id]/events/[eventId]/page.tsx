import { notFound } from 'next/navigation';
import { EventManagementDetail } from '@/components/management/event-management';
import { getOrganizationEvent } from '@/lib/organizer';
import { resolveLocale } from '@/lib/i18n';

export default async function AdminEventDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string; eventId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const [{ id, eventId, locale: value }, query] = await Promise.all([params, searchParams]);
  const event = await getOrganizationEvent(id, eventId);
  if (!event) notFound();
  return (
    <EventManagementDetail
      basePath={`/admin/organizations/${id}/events`}
      error={query.error}
      event={event}
      locale={resolveLocale(value)}
      notice={query.notice}
    />
  );
}
