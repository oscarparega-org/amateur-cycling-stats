'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { PasswordField, StatusMessage, SubmitButton } from './form-controls';
import { useLocale } from '@/components/locale-provider';

export function ResetPasswordForm({ token, linkError }: { token?: string; linkError?: string | null }) {
  const { t, path } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(linkError ?? null);

  if (!token)
    return (
      <>
        <StatusMessage>{t(error ?? 'El enlace no incluye un token válido.')}</StatusMessage>
        <Link
          className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]"
          href={path('/forgot-password')}
        >
          {t('Solicitar otro enlace')}
        </Link>
      </>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError(t('Las contraseñas no coinciden.'));
      return;
    }
    setPending(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (result.error) {
      setError(t(getAuthErrorMessage(result.error)));
      return;
    }
    router.push(`${path('/login')}?reset=complete` as Route);
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {error ? <StatusMessage>{error}</StatusMessage> : null}
      <PasswordField
        autoComplete="new-password"
        id="new-password"
        label={t('Nueva contraseña')}
        maxLength={128}
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        required
        value={password}
      />
      <PasswordField
        autoComplete="new-password"
        error={confirmation && password !== confirmation ? t('Las contraseñas no coinciden.') : undefined}
        id="confirm-new-password"
        label={t('Confirmar contraseña')}
        maxLength={128}
        minLength={8}
        onChange={(event) => setConfirmation(event.target.value)}
        required
        value={confirmation}
      />
      <p className="text-sm leading-6 text-slate-500">{t('Usa entre 8 y 128 caracteres.')}</p>
      <SubmitButton pending={pending} pendingText={t('Guardando…')}>
        {t('Cambiar contraseña')}
      </SubmitButton>
    </form>
  );
}
