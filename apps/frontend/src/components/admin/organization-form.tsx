'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Organization } from '@acs/shared';
import type { OrganizationActionState } from '@/lib/organization-actions';
import { createOrganizationAction, updateOrganizationAction } from '@/lib/organization-actions';

const initialState: OrganizationActionState = {};

export function OrganizationForm({ organization }: { organization?: Organization }) {
  const action = organization ? updateOrganizationAction.bind(null, organization.id) : createOrganizationAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const name = state.values?.name ?? organization?.name ?? '';
  const description = state.values?.description ?? organization?.description ?? '';

  return (
    <form action={formAction} className="max-w-2xl space-y-7">
      {state.error ? (
        <div className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block font-semibold text-[#102a43]" htmlFor="name">
          Nombre de la organización
        </label>
        <input
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-[#102a43] shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
          defaultValue={name}
          id="name"
          maxLength={120}
          minLength={3}
          name="name"
          placeholder="Ej. Liga Ciclista del Bajío"
          required
        />
        <p className="mt-2 text-sm text-slate-500">Este nombre aparecerá en eventos y clasificaciones.</p>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <label className="font-semibold text-[#102a43]" htmlFor="description">
            Descripción
          </label>
          <span className="text-sm text-slate-500">Opcional</span>
        </div>
        <textarea
          className="min-h-36 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-base leading-6 text-[#102a43] shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
          defaultValue={description}
          id="description"
          maxLength={1000}
          name="description"
          placeholder="Región, disciplina o propósito de la organización."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
        <button
          className="rounded-md bg-[#f97316] px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-65"
          disabled={pending}
          type="submit"
        >
          {pending ? 'Guardando…' : organization ? 'Guardar cambios' : 'Crear organización'}
        </button>
        <Link
          className="rounded-md border border-slate-300 bg-white px-5 py-3 font-bold text-[#102a43] hover:border-[#102a43]"
          href={organization ? `/admin/organizaciones/${organization.id}` : '/admin/organizaciones'}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
