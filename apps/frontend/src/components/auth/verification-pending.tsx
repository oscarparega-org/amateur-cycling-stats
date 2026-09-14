'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { FormField, StatusMessage, SubmitButton } from './form-controls';
import { useLocale } from '@/components/locale-provider';

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(2, Math.min(name.length - 2, 5)))}@${domain}`;
}

export function VerificationPending({ initialEmail = '' }: { initialEmail?: string }) {
  const { t, path } = useLocale();
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await authClient.sendVerificationEmail({ email, callbackURL: path('/email-verified') });
    setPending(false);
    if (result.error) setError(t(getAuthErrorMessage(result.error)));
    else setMessage(t('Enviamos un nuevo enlace. Revisa también tu carpeta de correo no deseado.'));
  }

  return (
    <>
      <div className="mb-6 border-l-4 border-[#f97316] bg-orange-50 px-4 py-4 text-sm leading-6 text-orange-950">
        {initialEmail ? (
          <>
            {t('Enviamos el enlace a')} <strong>{maskEmail(initialEmail)}</strong>.
          </>
        ) : (
          t('Escribe el correo que usaste al registrarte.')
        )}{' '}
        {t('El enlace vence en una hora.')}
      </div>
      <form className="space-y-5" onSubmit={resend}>
        {message ? <StatusMessage kind="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage>{error}</StatusMessage> : null}
        <FormField
          autoComplete="email"
          id="verification-email"
          label={t('Correo electrónico')}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <SubmitButton pending={pending} pendingText={t('Enviando…')}>
          {t('Reenviar enlace')}
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
