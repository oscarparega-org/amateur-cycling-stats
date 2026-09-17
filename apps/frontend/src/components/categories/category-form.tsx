'use client';

import type { RaceCategoryAge, RaceCategoryDistance } from '@acs/shared';
import Link from 'next/link';
import type { Route } from 'next';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Category } from '@/lib/category-management';
import type { CategoryFormState } from '@/lib/category-actions';
import type { CategoryType } from '@/lib/category-management';
import { useLocale } from '@/components/locale-provider';

type Action = (state: CategoryFormState, data: FormData) => Promise<CategoryFormState>;

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <button
      className="rounded-md bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64] disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? t('Guardando…') : editing ? t('Guardar cambios') : t('Crear categoría')}
    </button>
  );
}

export function CategoryForm({
  action,
  cancelPath,
  category,
  type
}: {
  action: Action;
  cancelPath: string;
  category?: Category;
  type: CategoryType;
}) {
  const [state, formAction] = useActionState(action, {});
  const { t } = useLocale();
  const age = type === 'age' ? (category as RaceCategoryAge | undefined) : undefined;
  const distance = type === 'distance' ? (category as RaceCategoryDistance | undefined) : undefined;
  const input =
    'mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15';
  const value = (field: string, fallback: string | number | null | undefined) =>
    state.values?.[field] ?? fallback ?? '';
  return (
    <form action={formAction} className="max-w-2xl space-y-7">
      {state.error ? (
        <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 font-semibold text-red-900" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="block font-semibold" htmlFor="category-name">
        {t('Nombre')}
        <input
          className={input}
          defaultValue={value('name', category?.name)}
          id="category-name"
          maxLength={200}
          name="name"
          required
        />
      </label>
      {type === 'age' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block font-semibold" htmlFor="from-age">
            {t('Edad inicial (opcional)')}
            <input
              className={input}
              defaultValue={value('fromAge', age?.fromAge)}
              id="from-age"
              max={150}
              min={0}
              name="fromAge"
              type="number"
            />
          </label>
          <label className="block font-semibold" htmlFor="to-age">
            {t('Edad final (opcional)')}
            <input
              className={input}
              defaultValue={value('toAge', age?.toAge)}
              id="to-age"
              max={150}
              min={0}
              name="toAge"
              type="number"
            />
          </label>
        </div>
      ) : null}
      {type === 'distance' ? (
        <label className="block font-semibold" htmlFor="distance">
          {t('Distancia en kilómetros (opcional)')}
          <input
            className={input}
            defaultValue={value('distance', distance?.distance)}
            id="distance"
            max={1000}
            min={0.001}
            name="distance"
            step="0.001"
            type="number"
          />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <Submit editing={Boolean(category)} />
        <Link
          className="rounded-md border border-slate-300 bg-white px-5 py-3 font-bold hover:border-[#102a43]"
          href={cancelPath as Route}
        >
          {t('Cancelar')}
        </Link>
      </div>
    </form>
  );
}
