import type { Category } from '@/lib/category-management';
import type { Route } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { EventTabs } from '@/components/management/event-tabs';
import { ConfirmSubmit } from '@/components/organizer/confirm-submit';
import { backendFetch } from '@/lib/backend';
import { deleteCategoryAction, saveCategoryAction } from '@/lib/category-actions';
import {
  categoryTypeLabel,
  categoryTypes,
  categoryValue,
  isCategoryType,
  type CategoryContext,
  type CategoryType
} from '@/lib/category-management';
import { localeDate, localePath, translate, type Locale } from '@/lib/i18n';
import { CategoryForm } from './category-form';

function tabs(locale: Locale, context: CategoryContext, active: CategoryType) {
  return (
    <nav
      aria-label={translate(locale, 'Tipos de categoría')}
      className="mb-7 flex gap-1 overflow-x-auto border-b border-slate-300"
    >
      {categoryTypes.map((type) => (
        <Link
          className={`border-b-3 px-4 py-3 font-semibold ${active === type ? 'border-[#5f7382] text-[#102a43]' : 'border-transparent text-slate-500 hover:text-[#102a43]'}`}
          href={localePath(locale, `${context.basePath}/${type}`)}
          key={type}
        >
          {translate(locale, categoryTypeLabel(type))}
        </Link>
      ))}
    </nav>
  );
}

async function fetchCategories(apiBase: string, type: CategoryType): Promise<Category[]> {
  const response = await backendFetch(`${apiBase}/${type}`);
  if (!response.ok) throw new Error('Category request failed');
  return (await response.json()) as Category[];
}

async function fetchCategory(apiBase: string, type: CategoryType, id: string): Promise<Category | null> {
  const response = await backendFetch(`${apiBase}/${type}/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Category request failed');
  return (await response.json()) as Category;
}

function notice(locale: Locale, result?: string) {
  const messages: Record<string, { kind: 'success' | 'error'; text: string }> = {
    created: { kind: 'success', text: 'Categoría creada.' },
    updated: { kind: 'success', text: 'Cambios guardados.' },
    deleted: { kind: 'success', text: 'Categoría eliminada.' },
    'in-use': { kind: 'error', text: 'No puedes eliminar esta categoría porque una carrera la está usando.' },
    protected: { kind: 'error', text: 'La categoría predeterminada no se puede modificar.' },
    'delete-error': { kind: 'error', text: 'No se pudo eliminar la categoría.' }
  };
  const message = result ? messages[result] : undefined;
  return message ? (
    <p
      className={`mb-6 border-l-4 px-4 py-3 font-semibold ${message.kind === 'success' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-red-600 bg-red-50 text-red-900'}`}
      role={message.kind === 'error' ? 'alert' : 'status'}
    >
      {translate(locale, message.text)}
    </p>
  ) : null;
}

function table(locale: Locale, type: CategoryType, items: Category[], basePath?: string) {
  if (!items.length)
    return (
      <p className="border-l-4 border-slate-300 bg-white px-5 py-6 text-slate-600">
        {translate(locale, 'No hay categorías en este nivel.')}
      </p>
    );
  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-50 text-sm text-slate-600">
            <th className="px-5 py-3 font-semibold">{translate(locale, 'Nombre')}</th>
            {type !== 'gender' ? (
              <th className="px-5 py-3 font-semibold">{translate(locale, type === 'age' ? 'Rango' : 'Distancia')}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr className="border-b border-slate-200 last:border-0" key={item.id}>
              <td className="px-5 py-4 font-bold">
                {basePath ? (
                  <Link
                    className="underline decoration-slate-300 underline-offset-4 hover:decoration-blue-700"
                    href={`${basePath}/${item.id}` as Route}
                  >
                    {item.name}
                  </Link>
                ) : (
                  item.name
                )}
                {item.isDefault ? (
                  <span className="ml-3 rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700">
                    {translate(locale, 'Predeterminada')}
                  </span>
                ) : null}
              </td>
              {type !== 'gender' ? <td className="px-5 py-4 text-slate-600">{categoryValue(item, type)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function CategoryManagement({
  context,
  locale,
  result,
  segments = []
}: {
  context: CategoryContext;
  locale: Locale;
  result?: string;
  segments?: string[];
}) {
  if (!segments.length) redirect(localePath(locale, `${context.basePath}/age`));
  const [typeValue, second, third] = segments;
  if (!isCategoryType(typeValue) || segments.length > 3 || (third && third !== 'edit')) notFound();
  const type = typeValue;
  const localizedBase = localePath(locale, `${context.basePath}/${type}`);
  const heading = translate(locale, categoryTypeLabel(type));
  const eventNavigation = context.eventBasePath ? (
    <EventTabs active="categories" basePath={context.eventBasePath} locale={locale} />
  ) : null;

  if (second === 'new') {
    const action = saveCategoryAction.bind(null, locale, type, context.apiBase, context.basePath, null);
    return (
      <>
        {eventNavigation}
        <Link className="font-bold text-blue-700" href={localizedBase}>
          ← {translate(locale, 'Volver a categorías')}
        </Link>
        <h1 className="display-font my-6 border-b border-slate-300 pb-6 text-5xl font-semibold">
          {translate(locale, 'Nueva categoría de')} {heading.toLowerCase()}
        </h1>
        <CategoryForm action={action} cancelPath={localizedBase} type={type} />
      </>
    );
  }

  if (second) {
    const category = await fetchCategory(context.apiBase, type, second);
    if (!category) notFound();
    if (third === 'edit') {
      if (category.isDefault) redirect(`${localizedBase}/${category.id}` as Route);
      const action = saveCategoryAction.bind(null, locale, type, context.apiBase, context.basePath, category.id);
      return (
        <>
          {eventNavigation}
          <Link className="font-bold text-blue-700" href={`${localizedBase}/${category.id}` as Route}>
            ← {translate(locale, 'Volver al detalle')}
          </Link>
          <h1 className="display-font my-6 border-b border-slate-300 pb-6 text-5xl font-semibold">
            {translate(locale, 'Editar categoría')}
          </h1>
          <CategoryForm
            action={action}
            cancelPath={`${localizedBase}/${category.id}`}
            category={category}
            type={type}
          />
        </>
      );
    }
    const remove = deleteCategoryAction.bind(null, locale, type, context.apiBase, context.basePath, category.id);
    return (
      <>
        {eventNavigation}
        <Link className="font-bold text-blue-700" href={localizedBase}>
          ← {translate(locale, 'Volver a categorías')}
        </Link>
        {notice(locale, result)}
        <div className="my-6 flex flex-col gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="display-font text-5xl font-semibold">{category.name}</h1>
          {!category.isDefault ? (
            <div className="flex gap-3">
              <Link
                className="rounded-md bg-[#102a43] px-4 py-2.5 font-bold text-white"
                href={`${localizedBase}/${category.id}/edit` as Route}
              >
                {translate(locale, 'Editar')}
              </Link>
              <form action={remove}>
                <ConfirmSubmit
                  className="rounded-md border border-red-300 bg-white px-4 py-2.5 font-bold text-red-700 hover:bg-red-50"
                  message={translate(locale, 'Esta acción eliminará la categoría de forma permanente. ¿Continuar?')}
                >
                  {translate(locale, 'Eliminar')}
                </ConfirmSubmit>
              </form>
            </div>
          ) : null}
        </div>
        <dl className="max-w-2xl divide-y divide-slate-200 border-y border-slate-300">
          <div className="py-4">
            <dt className="text-sm text-slate-500">{translate(locale, 'Nombre')}</dt>
            <dd className="mt-1 font-semibold">{category.name}</dd>
          </div>
          {type !== 'gender' ? (
            <div className="py-4">
              <dt className="text-sm text-slate-500">{translate(locale, type === 'age' ? 'Rango' : 'Distancia')}</dt>
              <dd className="mt-1 font-semibold">{categoryValue(category, type)}</dd>
            </div>
          ) : null}
          <div className="py-4">
            <dt className="text-sm text-slate-500">{translate(locale, 'Última actualización')}</dt>
            <dd className="mt-1 font-semibold">
              {new Intl.DateTimeFormat(localeDate(locale), { dateStyle: 'long' }).format(new Date(category.updatedAt))}
            </dd>
          </div>
        </dl>
      </>
    );
  }

  const [owned, ...inherited] = await Promise.all([
    fetchCategories(context.apiBase, type),
    ...context.inherited.map((item) => fetchCategories(item.apiBase, type))
  ]);
  return (
    <>
      {eventNavigation}
      {notice(locale, result)}
      <div className="mb-6 flex flex-col gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-semibold text-slate-500">{context.title}</p>
          <h1 className="display-font text-5xl font-semibold">{translate(locale, 'Categorías')}</h1>
        </div>
        <Link
          className="rounded-md bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64]"
          href={`${localizedBase}/new` as Route}
        >
          {translate(locale, 'Nueva categoría')}
        </Link>
      </div>
      {tabs(locale, context, type)}
      <section>
        <h2 className="display-font mb-4 text-3xl font-semibold">{translate(locale, 'Categorías de este nivel')}</h2>
        {table(locale, type, owned, localizedBase)}
      </section>
      {inherited.map((items, index) => (
        <section className="mt-9 border-t border-slate-300 pt-7" key={context.inherited[index]?.label}>
          <h2 className="display-font mb-4 text-3xl font-semibold">{context.inherited[index]?.label}</h2>
          {table(locale, type, items)}
        </section>
      ))}
    </>
  );
}
