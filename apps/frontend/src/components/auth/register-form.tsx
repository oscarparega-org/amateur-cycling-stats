'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Alert } from '@/components/alert';
import { useLocale } from '@/components/locale-provider';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { FormField, PasswordField, SubmitButton } from './form-controls';

export function RegisterForm() {
  const { t, path } = useLocale();
  const router = useRouter();
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (values.password !== values.confirmPassword) {
      setError(t('Las contraseñas no coinciden.'));
      return;
    }
    setPending(true);
    const result = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      callbackURL: path('/email-verified')
    });
    setPending(false);
    if (result.error) {
      setError(t(getAuthErrorMessage(result.error)));
      return;
    }
    router.push(`${path('/verify-email')}?email=${encodeURIComponent(values.email)}` as Route);
  }

  return (
    <>
      <form className="space-y-5" onSubmit={submit}>
        {error ? (
          <Alert closeLabel={t('Cerrar alerta')} kind="error">
            {error}
          </Alert>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            autoComplete="given-name"
            id="firstName"
            label={t('Nombre')}
            onChange={(event) => update('firstName', event.target.value)}
            required
            value={values.firstName}
          />
          <FormField
            autoComplete="family-name"
            id="lastName"
            label={t('Apellido')}
            onChange={(event) => update('lastName', event.target.value)}
            required
            value={values.lastName}
          />
        </div>
        <FormField
          autoComplete="email"
          id="email"
          label={t('Correo electrónico')}
          onChange={(event) => update('email', event.target.value)}
          placeholder="nombre@correo.com"
          required
          type="email"
          value={values.email}
        />
        <PasswordField
          autoComplete="new-password"
          id="password"
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
            values.confirmPassword && values.password !== values.confirmPassword
              ? t('Las contraseñas no coinciden.')
              : undefined
          }
          id="confirmPassword"
          label={t('Confirmar contraseña')}
          maxLength={128}
          minLength={8}
          onChange={(event) => update('confirmPassword', event.target.value)}
          required
          value={values.confirmPassword}
        />
        <p className="text-sm leading-6 text-slate-500">{t('Usa entre 8 y 128 caracteres.')}</p>
        <SubmitButton pending={pending} pendingText={t('Creando cuenta…')}>
          {t('Crear cuenta')}
        </SubmitButton>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">
        {t('¿Ya tienes cuenta?')}{' '}
        <Link className="font-bold text-blue-700 hover:text-blue-900" href={path('/login')}>
          {t('Iniciar sesión')}
        </Link>
      </p>
    </>
  );
}
