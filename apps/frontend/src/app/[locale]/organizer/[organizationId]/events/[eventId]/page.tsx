import { notFound } from 'next/navigation';
import { EventManagementDetail } from '@/components/management/event-management';
import { getOrganizationEvent } from '@/lib/organizer';
import { resolveLocale } from '@/lib/i18n';

export default async function EventDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; organizationId: string; eventId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const [{ organizationId, eventId, locale: value }, query] = await Promise.all([params, searchParams]);
  const event = await getOrganizationEvent(organizationId, eventId);
  if (!event) notFound();
  return (
    <EventManagementDetail
      basePath={`/organizer/${organizationId}/events`}
      error={query.error}
      event={event}
      locale={resolveLocale(value)}
      notice={query.notice}
    />
  );
}
