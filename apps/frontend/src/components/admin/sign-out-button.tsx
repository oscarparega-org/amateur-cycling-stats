'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      className="w-full rounded-md border border-white/20 px-3 py-2 text-left text-sm font-semibold text-blue-100 hover:border-white/45 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      onClick={signOut}
      type="button"
    >
      {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  );
}
