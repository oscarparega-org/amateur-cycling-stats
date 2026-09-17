'use client';

import { eventLocalDateTime, type AvailableCategories, type Event, type Race } from '@acs/shared';
import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { RaceFormState } from '@/lib/race-actions';
import { translate, type Locale } from '@/lib/i18n';

type RaceAction = (state: RaceFormState, formData: FormData) => Promise<RaceFormState>;
type CategoryKind = keyof AvailableCategories;
const kinds: Array<{ id: CategoryKind; label: string; name: string }> = [
  { id: 'age', label: 'Edad', name: 'raceCategoryAgeId' },
  { id: 'gender', label: 'Género', name: 'raceCategoryGenderId' },
  { id: 'distance', label: 'Distancia', name: 'raceCategoryDistanceId' }
];

function Submit({ editing, locale }: { editing: boolean; locale: Locale }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-md bg-[#102a43] px-5 py-3 font-bold text-white disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {translate(locale, pending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear carrera')}
    </button>
  );
}

export function RaceForm({
  action,
  available,
  event,
  locale,
  race
}: {
  action: RaceAction;
  available: AvailableCategories;
  event: Event;
  locale: Locale;
  race?: Race;
}) {
  const [state, formAction] = useActionState(action, {});
  const [selected, setSelected] = useState<Record<CategoryKind, string>>({
    age: race?.raceCategoryAgeId ?? '',
    gender: race?.raceCategoryGenderId ?? '',
    distance: race?.raceCategoryDistanceId ?? ''
  });
  const t = (text: string) => translate(locale, text);
  const labels = useMemo(
    () =>
      kinds
        .map(
          ({ id }) =>
            Object.values(available[id])
              .flat()
              .find((item) => item.id === selected[id])?.name
        )
        .filter(Boolean),
    [available, selected]
  );
  const input = 'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 focus:border-blue-600';
  return (
    <form action={formAction} className="space-y-7">
      {state.error ? (
        <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 font-semibold text-red-900" role="alert">
          {state.error}
        </p>
      ) : null}
      <section aria-live="polite" className="border-l-4 border-[#5f7382] bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-slate-500">{t('Nombre generado')}</p>
        <p className="display-font mt-1 text-2xl font-semibold">
          {labels.length === 3 ? labels.join(' - ') : t('Selecciona una categoría de cada tipo')}
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        {kinds.map(({ id, label, name }) => (
          <fieldset className="border border-slate-200 bg-white p-5" key={id}>
            <legend className="px-1 text-lg font-bold">{t(label)}</legend>
            {(['event', 'organization', 'global'] as const).map((scope) =>
              available[id][scope].length ? (
                <div className="mt-4" key={scope}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t(scope === 'event' ? 'Del evento' : scope === 'organization' ? 'De la organización' : 'Globales')}
                  </p>
                  <div className="space-y-2">
                    {available[id][scope].map((category) => (
                      <label
                        className="flex cursor-pointer items-start gap-3 border border-slate-200 px-3 py-2.5 hover:border-slate-400"
                        key={category.id}
                      >
                        <input
                          checked={selected[id] === category.id}
                          className="mt-1"
                          name={name}
                          onChange={() => setSelected((current) => ({ ...current, [id]: category.id }))}
                          required
                          type="radio"
                          value={category.id}
                        />
                        <span className="font-semibold">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </fieldset>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-semibold">
          {t('Fecha y hora')}
          <input
            className={input}
            defaultValue={
              race
                ? eventLocalDateTime(race.dateTime, event.timeZone).slice(0, 16)
                : eventLocalDateTime(event.dateTime, event.timeZone).slice(0, 16)
            }
            name="localDateTime"
            required
            type="datetime-local"
          />
        </label>
        <div>
          <p className="font-semibold">{t('Zona horaria')}</p>
          <p className="mt-2 border border-slate-200 bg-slate-50 px-3 py-2.5">{event.timeZone}</p>
        </div>
      </div>
      <label className="block font-semibold">
        {t('Descripción')}
        <textarea className={`${input} min-h-28 resize-y`} defaultValue={race?.description ?? ''} name="description" />
      </label>
      <div className="border-t border-slate-200 pt-6">
        <Submit editing={Boolean(race)} locale={locale} />
      </div>
    </form>
  );
}
