import type { Organization } from '@acs/shared';
import { notFound } from 'next/navigation';
import { CategoryManagement } from '@/components/categories/category-management';
import { backendFetch } from '@/lib/backend';
import { resolveLocale, translate } from '@/lib/i18n';

export default async function AdminOrganizationCategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string; categoryPath?: string[] }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ locale: value, id, categoryPath }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  const response = await backendFetch(`/api/organizations/${encodeURIComponent(id)}`);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Organization request failed');
  const organization = (await response.json()) as Organization;
  return (
    <CategoryManagement
      context={{
        scope: 'ORGANIZATION',
        basePath: `/admin/organizations/${id}/categories`,
        apiBase: `/api/organizations/${id}/categories`,
        title: organization.name,
        inherited: [{ label: translate(locale, 'Categorías globales'), apiBase: '/api/categories' }]
      }}
      locale={locale}
      result={query.result}
      segments={categoryPath}
    />
  );
}
