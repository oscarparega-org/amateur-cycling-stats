'use client';

import type { OrganizationInvitation } from '@acs/shared';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { FormField, PasswordField, StatusMessage, SubmitButton } from './form-controls';

export function InvitationForm({ invitation, defaultFirstName = '', defaultLastName = '' }: { invitation: OrganizationInvitation; defaultFirstName?: string; defaultLastName?: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ firstName: defaultFirstName, lastName: defaultLastName, password: '', confirmation: '' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function update(field: keyof typeof values, value: string) { setValues((current) => ({ ...current, [field]: value })); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    if (values.password !== values.confirmation) { setError('Las contraseñas no coinciden.'); return; }
    setPending(true);
    try {
      const response = await fetch('/api/auth/complete-organizer-setup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ firstName: values.firstName.trim(), lastName: values.lastName.trim(), password: values.password, invitationId: invitation.id }) });
      const payload = await response.json() as { error?: string; code?: string };
      if (!response.ok) { setError(payload.code ? getAuthErrorMessage(payload) : payload.error ?? 'No pudimos aceptar la invitación.'); return; }
      router.push('/'); router.refresh();
    } catch { setError('No pudimos conectar con el servicio. Inténtalo de nuevo.'); }
    finally { setPending(false); }
  }

  return <form className="space-y-5" onSubmit={submit}>
    <StatusMessage kind="info">La invitación corresponde a <strong>{invitation.email}</strong>.</StatusMessage>
    {error ? <StatusMessage>{error}</StatusMessage> : null}
    <div className="grid gap-5 sm:grid-cols-2"><FormField autoComplete="given-name" id="invite-first-name" label="Nombre" onChange={(event) => update('firstName', event.target.value)} required value={values.firstName} /><FormField autoComplete="family-name" id="invite-last-name" label="Apellido" onChange={(event) => update('lastName', event.target.value)} required value={values.lastName} /></div>
    <PasswordField autoComplete="new-password" id="invite-password" label="Contraseña" maxLength={128} minLength={8} onChange={(event) => update('password', event.target.value)} required value={values.password} />
    <PasswordField autoComplete="new-password" error={values.confirmation && values.password !== values.confirmation ? 'Las contraseñas no coinciden.' : undefined} id="invite-confirmation" label="Confirmar contraseña" maxLength={128} minLength={8} onChange={(event) => update('confirmation', event.target.value)} required value={values.confirmation} />
    <SubmitButton pending={pending} pendingText="Aceptando…">Aceptar invitación</SubmitButton>
  </form>;
}
