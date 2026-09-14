'use client';

import { Alert } from '@/components/alert';
import { useLocale } from '@/components/locale-provider';

const messages: Record<string, { kind: 'success' | 'error'; text: string; autoCloseMs?: number }> = {
  created: { kind: 'success', text: 'Organización creada. Puedes activarla cuando esté lista.', autoCloseMs: 6000 },
  updated: { kind: 'success', text: 'Cambios guardados.', autoCloseMs: 6000 },
  activated: { kind: 'success', text: 'Organización activada.', autoCloseMs: 6000 },
  deactivated: { kind: 'success', text: 'Organización desactivada.', autoCloseMs: 6000 },
  'state-error': { kind: 'error', text: 'No se pudo cambiar el estado. Inténtalo de nuevo.' },
  'invalid-state': { kind: 'error', text: 'El cambio de estado no es válido.' }
};

export function AdminStatusMessage({ result }: { result?: string }) {
  const { t } = useLocale();
  const message = result ? messages[result] : undefined;
  if (!message) return null;

  return (
    <Alert autoCloseMs={message.autoCloseMs} closeLabel={t('Cerrar alerta')} kind={message.kind}>
      {t(message.text)}
    </Alert>
  );
}
