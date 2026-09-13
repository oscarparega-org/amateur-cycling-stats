'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Event } from '@acs/shared';
import type { EventFormState } from '@/app/organizer/actions';

type EventAction = (state: EventFormState, formData: FormData) => Promise<EventFormState>;

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-md bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear borrador'}
    </button>
  );
}

function dateTimeValue(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function EventForm({ action, event }: { action: EventAction; event?: Event }) {
  const [state, formAction] = useActionState(action, {});
  const input =
    'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[#102a43] shadow-sm placeholder:text-slate-400 focus:border-blue-600';

  return (
    <form action={formAction} className="max-w-3xl space-y-7">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.error}
        </p>
      ) : null}
      <label className="block font-semibold">
        Nombre del evento
        <input className={input} defaultValue={event?.name} name="name" required />
      </label>
      <label className="block font-semibold">
        Descripción
        <textarea className={`${input} min-h-32 resize-y`} defaultValue={event?.description ?? ''} name="description" />
      </label>
      <label className="block font-semibold">
        Fecha y hora
        <input
          className={input}
          defaultValue={dateTimeValue(event?.dateTime)}
          name="dateTime"
          required
          type="datetime-local"
        />
      </label>
      <fieldset>
        <legend className="font-semibold">Ubicación</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            País
            <input className={input} defaultValue={event?.country} name="country" required />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Estado
            <input className={input} defaultValue={event?.state} name="state" required />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Ciudad
            <input className={input} defaultValue={event?.city ?? ''} name="city" />
          </label>
        </div>
      </fieldset>
      <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
        <SaveButton editing={Boolean(event)} />
        <p className="text-sm text-slate-500">Los eventos nuevos permanecen ocultos hasta que los publiques.</p>
      </div>
    </form>
  );
}
