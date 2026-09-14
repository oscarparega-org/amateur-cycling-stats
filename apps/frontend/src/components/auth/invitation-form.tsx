'use client';

import type { OrganizationInvitation } from '@acs/shared';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Alert } from '@/components/alert';
import { useLocale } from '@/components/locale-provider';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { FormField, PasswordField, SubmitButton } from './form-controls';

export function InvitationForm({
  invitation,
  defaultFirstName = '',
  defaultLastName = ''
}: {
  invitation: OrganizationInvitation;
  defaultFirstName?: string;
  defaultLastName?: string;
}) {
  const { t, path } = useLocale();
  const router = useRouter();
  const [values, setValues] = useState({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    password: '',
    confirmation: ''
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (values.password !== values.confirmation) {
      setError(t('Las contraseñas no coinciden.'));
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/api/auth/complete-organizer-setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          password: values.password,
          invitationId: invitation.id
        })
      });
      const payload = (await response.json()) as { error?: string; code?: string };
      if (!response.ok) {
        setError(
          t(payload.code ? getAuthErrorMessage(payload) : (payload.error ?? 'No pudimos aceptar la invitación.'))
        );
        return;
      }
      router.push(path());
      router.refresh();
    } catch {
      setError(t('No pudimos conectar con el servicio. Inténtalo de nuevo.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {error ? (
        <Alert closeLabel={t('Cerrar alerta')} key="invitation-error" kind="error">
          {error}
        </Alert>
      ) : (
        <Alert closeLabel={t('Cerrar alerta')} key="invitation-context" kind="info">
          {t('La invitación corresponde a')} <strong>{invitation.email}</strong>.
        </Alert>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          id="invite-first-name"
          label={t('Nombre')}
          onChange={(event) => update('firstName', event.target.value)}
          required
          value={values.firstName}
        />
        <FormField
          autoComplete="family-name"
          id="invite-last-name"
          label={t('Apellido')}
          onChange={(event) => update('lastName', event.target.value)}
          required
          value={values.lastName}
        />
      </div>
      <PasswordField
        autoComplete="new-password"
        id="invite-password"
        label={t('Contraseña')}
        maxLength={128}
        minLength={8}
        onChange={(event) => update('password', event.target.value)}
        required
        value={values.password}
      />
      <PasswordField
        autoComplete="new-password"
        error={
          values.confirmation && values.password !== values.confirmation
            ? t('Las contraseñas no coinciden.')
            : undefined
        }
        id="invite-confirmation"
        label={t('Confirmar contraseña')}
        maxLength={128}
        minLength={8}
        onChange={(event) => update('confirmation', event.target.value)}
        required
        value={values.confirmation}
      />
      <SubmitButton pending={pending} pendingText={t('Aceptando…')}>
        {t('Aceptar invitación')}
      </SubmitButton>
    </form>
  );
}
