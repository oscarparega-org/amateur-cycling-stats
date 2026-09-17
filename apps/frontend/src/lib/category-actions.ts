'use server';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { backendFetch } from './backend';
import type { CategoryType } from './category-management';
import { localePath, translate, type Locale } from './i18n';

export type CategoryFormState = {
  error?: string;
  fields?: Record<string, string>;
  values?: Record<string, string>;
};

function numberValue(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? '';
  if (!text) return { value: undefined, text };
  const number = Number(text);
  return { value: number, text };
}

function payload(type: CategoryType, formData: FormData, locale: Locale, editing: boolean) {
  const name = formData.get('name')?.toString().trim() ?? '';
  const values: Record<string, string> = { name };
  if (!name || name.length > 200) {
    return { error: translate(locale, 'Escribe un nombre de hasta 200 caracteres.'), values } as const;
  }
  if (type === 'gender') return { data: { name }, values } as const;
  if (type === 'age') {
    const fromAge = numberValue(formData.get('fromAge'));
    const toAge = numberValue(formData.get('toAge'));
    values.fromAge = fromAge.text;
    values.toAge = toAge.text;
    if (
      (fromAge.value !== undefined && (!Number.isInteger(fromAge.value) || fromAge.value < 0 || fromAge.value > 150)) ||
      (toAge.value !== undefined && (!Number.isInteger(toAge.value) || toAge.value < 0 || toAge.value > 150))
    )
      return { error: translate(locale, 'Las edades deben ser enteros entre 0 y 150.'), values } as const;
    if (fromAge.value !== undefined && toAge.value !== undefined && fromAge.value > toAge.value) {
      return { error: translate(locale, 'La edad final debe ser igual o mayor que la inicial.'), values } as const;
    }
    return {
      data: {
        name,
        fromAge: fromAge.value ?? (editing ? null : undefined),
        toAge: toAge.value ?? (editing ? null : undefined)
      },
      values
    } as const;
  }
  const distance = numberValue(formData.get('distance'));
  values.distance = distance.text;
  if (
    distance.value !== undefined &&
    (!Number.isFinite(distance.value) || distance.value < 0.001 || distance.value > 1_000)
  ) {
    return { error: translate(locale, 'La distancia debe estar entre 0.001 y 1000 km.'), values } as const;
  }
  return { data: { name, distance: distance.value ?? (editing ? null : undefined) }, values } as const;
}

async function apiError(response: Response, locale: Locale) {
  try {
    const body = (await response.json()) as {
      code?: string;
      error?: string;
      issues?: Array<{ field: string; message: string }>;
    };
    if (body.code === 'ACS05')
      return { error: translate(locale, 'Ya existe una categoría con ese nombre en este nivel.') };
    if (body.code === 'ACS03')
      return { error: translate(locale, 'La categoría predeterminada no se puede modificar.') };
    if (body.issues?.length) {
      return {
        error: translate(locale, 'Revisa los campos marcados.'),
        fields: Object.fromEntries(body.issues.map((issue) => [issue.field, translate(locale, issue.message)]))
      };
    }
    return { error: body.error || translate(locale, 'No se pudo guardar la categoría.') };
  } catch {
    return { error: translate(locale, 'No se pudo guardar la categoría.') };
  }
}

export async function saveCategoryAction(
  locale: Locale,
  type: CategoryType,
  apiBase: string,
  basePath: string,
  categoryId: string | null,
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = payload(type, formData, locale, categoryId !== null);
  if ('error' in parsed) return { error: parsed.error, values: parsed.values };
  const endpoint = categoryId ? `${apiBase}/${type}/${encodeURIComponent(categoryId)}` : `${apiBase}/${type}`;
  const response = await backendFetch(endpoint, {
    method: categoryId ? 'PATCH' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) return { ...(await apiError(response, locale)), values: parsed.values };
  revalidatePath(localePath(locale, basePath));
  const destination = categoryId ? `${basePath}/${type}/${categoryId}` : `${basePath}/${type}`;
  redirect(`${localePath(locale, destination)}?result=${categoryId ? 'updated' : 'created'}` as Route);
}

export async function deleteCategoryAction(
  locale: Locale,
  type: CategoryType,
  apiBase: string,
  basePath: string,
  categoryId: string
) {
  const response = await backendFetch(`${apiBase}/${type}/${encodeURIComponent(categoryId)}`, { method: 'DELETE' });
  if (!response.ok) {
    let code = 'delete-error';
    try {
      const body = (await response.json()) as { code?: string };
      if (body.code === 'ACS02') code = 'in-use';
      if (body.code === 'ACS03') code = 'protected';
    } catch {
      // Keep the generic error code.
    }
    redirect(`${localePath(locale, `${basePath}/${type}/${categoryId}`)}?result=${code}` as Route);
  }
  revalidatePath(localePath(locale, basePath));
  redirect(`${localePath(locale, `${basePath}/${type}`)}?result=deleted` as Route);
}
