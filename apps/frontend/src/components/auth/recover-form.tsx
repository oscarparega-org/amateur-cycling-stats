'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { FormField, StatusMessage, SubmitButton } from './form-controls';

export function RecoverForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(null);
    const result = await authClient.requestPasswordReset({ email, redirectTo: '/restablecer-contrasena' });
    setPending(false);
    if (result.error) setError(getAuthErrorMessage(result.error));
    else setSent(true);
  }

  if (sent) return <><StatusMessage kind="success">Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.</StatusMessage><p className="mt-7 text-center text-sm"><Link className="font-bold text-blue-700 hover:text-blue-900" href="/iniciar-sesion">Volver a iniciar sesión</Link></p></>;
  return <><form className="space-y-5" onSubmit={submit}>{error ? <StatusMessage>{error}</StatusMessage> : null}<FormField autoComplete="email" id="recovery-email" label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} placeholder="nombre@correo.com" required type="email" value={email} /><SubmitButton pending={pending} pendingText="Enviando…">Enviar enlace</SubmitButton></form><p className="mt-8 text-center text-sm"><Link className="font-bold text-blue-700 hover:text-blue-900" href="/iniciar-sesion">Volver a iniciar sesión</Link></p></>;
}
