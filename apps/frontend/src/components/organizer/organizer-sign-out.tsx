'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function OrganizerSignOut({ inverse = false }: { inverse?: boolean }) {
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
      className={
        inverse
          ? 'w-full rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60'
          : 'rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-slate-500 disabled:opacity-60'
      }
      disabled={pending}
      onClick={signOut}
      type="button"
    >
      {pending ? 'Cerrando…' : 'Cerrar sesión'}
    </button>
  );
}
