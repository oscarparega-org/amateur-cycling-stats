'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Alert } from '@/components/alert';
import { useLocale } from '@/components/locale-provider';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { FormField, SubmitButton } from './form-controls';

export function RecoverForm() {
  const { t, path } = useLocale();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await authClient.requestPasswordReset({ email, redirectTo: path('/reset-password') });
    setPending(false);
    if (result.error) setError(t(getAuthErrorMessage(result.error)));
    else setSent(true);
  }

  if (sent)
    return (
      <>
        <Alert closeLabel={t('Cerrar alerta')} kind="success">
          {t('Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.')}
        </Alert>
        <p className="mt-7 text-center text-sm">
          <Link className="font-bold text-blue-700 hover:text-blue-900" href={path('/login')}>
            {t('Volver a iniciar sesión')}
          </Link>
        </p>
      </>
    );
  return (
    <>
      <form className="space-y-5" onSubmit={submit}>
        {error ? (
          <Alert closeLabel={t('Cerrar alerta')} kind="error">
            {error}
          </Alert>
        ) : null}
        <FormField
          autoComplete="email"
          id="recovery-email"
          label={t('Correo electrónico')}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <SubmitButton pending={pending} pendingText={t('Enviando…')}>
          {t('Enviar enlace')}
        </SubmitButton>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link className="font-bold text-blue-700 hover:text-blue-900" href={path('/login')}>
          {t('Volver a iniciar sesión')}
        </Link>
      </p>
    </>
  );
}
