'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useLocale } from '@/components/locale-provider';

export function ProtectedSignOut({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t, path } = useLocale();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push(path());
    router.refresh();
  }

  return (
    <button
      className={
        compact
          ? 'border border-white/25 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60'
          : 'w-full border border-white/20 px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:border-white/45 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60'
      }
      disabled={pending}
      onClick={signOut}
      type="button"
    >
      {pending ? t('Cerrando…') : compact ? t('Salir') : t('Cerrar sesión')}
    </button>
  );
}
