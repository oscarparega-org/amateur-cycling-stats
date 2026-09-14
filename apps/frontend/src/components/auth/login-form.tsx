'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import type { AuthApiError } from '@/lib/auth-types';
import { getPostLoginPath } from '@/lib/role-navigation';
import { Divider, FormField, PasswordField, StatusMessage, SubmitButton } from './form-controls';
import { useLocale } from '@/components/locale-provider';

export function LoginForm({ next = '/', resetComplete = false }: { next?: string; resetComplete?: boolean }) {
  const { locale, t, path } = useLocale();
  const router = useRouter();
  const destination = getPostLoginPath(next, locale);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState<AuthApiError | null>(null);
  const [resent, setResent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setResent(false);
    const result = await authClient.signIn.email({ email, password, rememberMe: true });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(destination as Route);
    router.refresh();
  }

  async function resendVerification() {
    setPending(true);
    setError(null);
    const result = await authClient.sendVerificationEmail({ email, callbackURL: path('/email-verified') });
    setPending(false);
    if (result.error) setError(result.error);
    else setResent(true);
  }

  async function signInWithGoogle() {
    setGooglePending(true);
    setError(null);
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: destination,
      errorCallbackURL: path('/authentication-error')
    });
    if (result.error) {
      setError(result.error);
      setGooglePending(false);
    }
  }

  const isUnverified = error?.code === 'EMAIL_NOT_VERIFIED';
  return (
    <>
      <form className="space-y-5" onSubmit={submit}>
        {resetComplete ? (
          <StatusMessage kind="success">{t('Tu contraseña cambió. Ya puedes iniciar sesión.')}</StatusMessage>
        ) : null}
        {error ? (
          <StatusMessage>
            {t(getAuthErrorMessage(error))}
            {isUnverified ? (
              <button
                className="ml-1 font-bold underline underline-offset-2"
                disabled={pending}
                onClick={resendVerification}
                type="button"
              >
                {t('Reenviar correo')}
              </button>
            ) : null}
          </StatusMessage>
        ) : null}
        {resent ? <StatusMessage kind="success">{t('Enviamos un nuevo correo de verificación.')}</StatusMessage> : null}
        <FormField
          autoComplete="email"
          id="email"
          label={t('Correo electrónico')}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <div>
          <PasswordField
            autoComplete="current-password"
            id="password"
            label={t('Contraseña')}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            value={password}
          />
          <div className="mt-2 text-right">
            <Link className="text-sm font-semibold text-blue-700 hover:text-blue-900" href={path('/forgot-password')}>
              {t('Olvidé mi contraseña')}
            </Link>
          </div>
        </div>
        <SubmitButton pending={pending} pendingText={t('Iniciando…')}>
          {t('Iniciar sesión')}
        </SubmitButton>
      </form>
      <Divider />
      <button
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-5 font-semibold text-[#102a43] hover:border-[#102a43] disabled:cursor-wait disabled:opacity-65"
        disabled={googlePending || pending}
        onClick={signInWithGoogle}
        type="button"
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 font-bold text-blue-700"
          aria-hidden="true"
        >
          G
        </span>
        {googlePending ? t('Conectando…') : t('Continuar con Google')}
      </button>
      <p className="mt-8 text-center text-sm text-slate-600">
        {t('¿Aún no tienes cuenta?')}{' '}
        <Link className="font-bold text-blue-700 hover:text-blue-900" href={path('/register')}>
          {t('Crear cuenta')}
        </Link>
      </p>
    </>
  );
}
