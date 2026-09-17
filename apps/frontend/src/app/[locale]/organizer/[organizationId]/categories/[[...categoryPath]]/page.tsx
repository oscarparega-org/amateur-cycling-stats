import { CategoryManagement } from '@/components/categories/category-management';
import { getOrganization } from '@/lib/organizer';
import { notFound } from 'next/navigation';
import { resolveLocale, translate } from '@/lib/i18n';

export default async function OrganizerCategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; organizationId: string; categoryPath?: string[] }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ locale: value, organizationId, categoryPath }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const organization = await getOrganization(organizationId);
  if (!organization) notFound();
  return (
    <CategoryManagement
      context={{
        scope: 'ORGANIZATION',
        basePath: `/organizer/${organizationId}/categories`,
        apiBase: `/api/organizations/${organizationId}/categories`,
        title: organization.name,
        inherited: [{ label: translate(locale, 'Categorías globales'), apiBase: '/api/categories' }]
      }}
      locale={locale}
      result={query.result}
      segments={categoryPath}
    />
  );
}
