import { EventManagementList, type EventFilter } from '@/components/management/event-management';
import { getOrganizationEvents } from '@/lib/organizer';
import { resolveLocale } from '@/lib/i18n';

export default async function AdminEventsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ filter?: string; notice?: string }>;
}) {
  const [{ id, locale: value }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const filter: EventFilter = query.filter === 'future' || query.filter === 'past' ? query.filter : 'all';
  const basePath = `/admin/organizations/${id}/events`;
  return (
    <EventManagementList
      basePath={basePath}
      events={await getOrganizationEvents(id, filter)}
      filter={filter}
      locale={locale}
      notice={query.notice}
    />
  );
}
