import { CategoryManagement } from '@/components/categories/category-management';
import { resolveLocale, translate } from '@/lib/i18n';

export default async function GlobalCategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; categoryPath?: string[] }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ locale: value, categoryPath }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(value);
  return (
    <CategoryManagement
      context={{
        scope: 'GLOBAL',
        basePath: '/admin/categories',
        apiBase: '/api/categories',
        title: translate(locale, 'Categorías globales'),
        inherited: []
      }}
      locale={locale}
      result={query.result}
      segments={categoryPath}
    />
  );
}
