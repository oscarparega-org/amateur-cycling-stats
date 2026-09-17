'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { eventLocalDateTime, type Event } from '@acs/shared';
import type { EventFormState } from '@/lib/event-actions';
import { Alert } from '@/components/alert';
import { translate, type Locale } from '@/lib/i18n';

type EventAction = (state: EventFormState, formData: FormData) => Promise<EventFormState>;

function SaveButton({ editing, locale }: { editing: boolean; locale: Locale }) {
  const { pending } = useFormStatus();
  const t = (text: string) => translate(locale, text);
  return (
    <button
      className="rounded-md bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? t('Guardando…') : editing ? t('Guardar cambios') : t('Crear borrador')}
    </button>
  );
}

function dateTimeValue(event?: Event) {
  if (!event) return '';
  return eventLocalDateTime(event.dateTime, event.timeZone).slice(0, 16);
}

export function EventForm({ action, event, locale = 'es' }: { action: EventAction; event?: Event; locale?: Locale }) {
  const [state, formAction] = useActionState(action, {});
  const timeZoneInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!event && timeZoneInput.current) {
      timeZoneInput.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
  }, [event]);
  const t = (text: string) => translate(locale, text);
  const input =
    'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[#102a43] shadow-sm placeholder:text-slate-400 focus:border-blue-600';

  return (
    <form action={formAction} className="max-w-3xl space-y-7">
      {state.error ? (
        <Alert closeLabel={t('Cerrar alerta')} kind="error">
          {state.error}
        </Alert>
      ) : null}
      <label className="block font-semibold">
        {t('Nombre del evento')}
        <input className={input} defaultValue={event?.name} name="name" required />
      </label>
      <label className="block font-semibold">
        {t('Descripción')}
        <textarea className={`${input} min-h-32 resize-y`} defaultValue={event?.description ?? ''} name="description" />
      </label>
      <label className="block font-semibold">
        {t('Fecha y hora')}
        <input
          className={input}
          defaultValue={dateTimeValue(event)}
          name="localDateTime"
          required
          type="datetime-local"
        />
      </label>
      <label className="block font-semibold">
        {t('Zona horaria IANA')}
        <input className={input} defaultValue={event?.timeZone ?? 'UTC'} name="timeZone" ref={timeZoneInput} required />
      </label>
      <fieldset>
        <legend className="font-semibold">{t('Ubicación')}</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            {t('País')}
            <input className={input} defaultValue={event?.country} name="country" required />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            {t('Estado')}
            <input className={input} defaultValue={event?.state} name="state" required />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            {t('Ciudad')}
            <input className={input} defaultValue={event?.city ?? ''} name="city" />
          </label>
        </div>
      </fieldset>
      <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
        <SaveButton editing={Boolean(event)} locale={locale} />
      </div>
    </form>
  );
}
