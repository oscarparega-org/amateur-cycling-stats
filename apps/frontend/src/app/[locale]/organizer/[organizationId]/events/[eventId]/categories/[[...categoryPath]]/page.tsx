import { CategoryManagement } from '@/components/categories/category-management';
import { getOrganization, getOrganizationEvent } from '@/lib/organizer';
import { notFound } from 'next/navigation';
import { resolveLocale, translate } from '@/lib/i18n';

export default async function OrganizerEventCategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; organizationId: string; eventId: string; categoryPath?: string[] }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ locale: value, organizationId, eventId, categoryPath }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const [event, organization] = await Promise.all([
    getOrganizationEvent(organizationId, eventId),
    getOrganization(organizationId)
  ]);
  if (!event || !organization) notFound();
  return (
    <CategoryManagement
      context={{
        scope: 'EVENT',
        basePath: `/organizer/${organizationId}/events/${eventId}/categories`,
        apiBase: `/api/events/${eventId}/categories`,
        title: event.name,
        eventBasePath: `/organizer/${organizationId}/events/${eventId}`,
        inherited: [
          {
            label: translate(locale, 'Categorías de la organización'),
            apiBase: `/api/organizations/${organizationId}/categories`
          },
          { label: translate(locale, 'Categorías globales'), apiBase: '/api/categories' }
        ]
      }}
      locale={locale}
      result={query.result}
      segments={categoryPath}
    />
  );
}
