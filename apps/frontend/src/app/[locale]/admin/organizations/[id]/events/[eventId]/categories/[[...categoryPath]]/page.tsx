import type { Event } from '@acs/shared';
import { notFound } from 'next/navigation';
import { CategoryManagement } from '@/components/categories/category-management';
import { backendFetch } from '@/lib/backend';
import { resolveLocale, translate } from '@/lib/i18n';

export default async function AdminEventCategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string; eventId: string; categoryPath?: string[] }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ locale: value, id, eventId, categoryPath }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const [eventResponse, organizationResponse] = await Promise.all([
    backendFetch(`/api/events/${encodeURIComponent(eventId)}`),
    backendFetch(`/api/organizations/${encodeURIComponent(id)}`)
  ]);
  if (eventResponse.status === 404 || organizationResponse.status === 404) notFound();
  if (!eventResponse.ok || !organizationResponse.ok) throw new Error('Event category context request failed');
  const event = (await eventResponse.json()) as Event;
  await organizationResponse.json();
  if (event.organizationId !== id) notFound();
  return (
    <CategoryManagement
      context={{
        scope: 'EVENT',
        basePath: `/admin/organizations/${id}/events/${eventId}/categories`,
        apiBase: `/api/events/${eventId}/categories`,
        title: event.name,
        eventBasePath: `/admin/organizations/${id}/events/${eventId}`,
        inherited: [
          { label: translate(locale, 'Categorías de la organización'), apiBase: `/api/organizations/${id}/categories` },
          { label: translate(locale, 'Categorías globales'), apiBase: '/api/categories' }
        ]
      }}
      locale={locale}
      result={query.result}
      segments={categoryPath}
    />
  );
}
