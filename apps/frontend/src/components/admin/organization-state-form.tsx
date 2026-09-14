'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Organization } from '@acs/shared';
import { setOrganizationStateAction } from '@/lib/organization-actions';
import { useLocale } from '@/components/locale-provider';

function StateSubmitButton({ nextState, verb }: { nextState: Organization['state']; verb: string }) {
  const { pending } = useFormStatus();
  const { t } = useLocale();

  return (
    <button
      className={`rounded-md px-4 py-2.5 font-bold text-white disabled:cursor-wait disabled:opacity-65 ${
        nextState === 'ACTIVE' ? 'bg-[#102a43] hover:bg-[#173f64]' : 'bg-red-700 hover:bg-red-800'
      }`}
      disabled={pending}
      type="submit"
    >
      {pending ? t('Guardando…') : `${t('Sí')}, ${verb.toLowerCase()}`}
    </button>
  );
}

export function OrganizationStateForm({ organization }: { organization: Organization }) {
  const { locale, t } = useLocale();
  const [confirming, setConfirming] = useState(false);
  const nextState = organization.state === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const verb = nextState === 'ACTIVE' ? t('Activar') : t('Desactivar');

  if (!confirming) {
    return (
      <button
        className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-bold text-[#102a43] hover:border-[#102a43]"
        onClick={() => setConfirming(true)}
        type="button"
      >
        {verb}
      </button>
    );
  }

  return (
    <form action={setOrganizationStateAction} className="flex flex-wrap items-center gap-3">
      <input name="organizationId" type="hidden" value={organization.id} />
      <input name="locale" type="hidden" value={locale} />
      <input name="state" type="hidden" value={nextState} />
      <span className="text-sm font-semibold text-slate-700">{t('¿Confirmar?')}</span>
      <StateSubmitButton nextState={nextState} verb={verb} />
      <button
        className="rounded-md px-3 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
        onClick={() => setConfirming(false)}
        type="button"
      >
        {t('Cancelar')}
      </button>
    </form>
  );
}
