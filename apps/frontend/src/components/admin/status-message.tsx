const messages: Record<string, { kind: 'success' | 'error'; text: string }> = {
  creada: { kind: 'success', text: 'Organización creada. Puedes activarla cuando esté lista.' },
  actualizada: { kind: 'success', text: 'Cambios guardados.' },
  activada: { kind: 'success', text: 'Organización activada.' },
  desactivada: { kind: 'success', text: 'Organización desactivada.' },
  'error-estado': { kind: 'error', text: 'No se pudo cambiar el estado. Inténtalo de nuevo.' },
  'estado-invalido': { kind: 'error', text: 'El cambio de estado no es válido.' }
};

export function AdminStatusMessage({ result }: { result?: string }) {
  const message = result ? messages[result] : undefined;
  if (!message) return null;

  return (
    <div
      className={`mb-7 border-l-4 px-4 py-3 text-sm font-semibold ${
        message.kind === 'success'
          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
          : 'border-red-600 bg-red-50 text-red-900'
      }`}
      role={message.kind === 'error' ? 'alert' : 'status'}
    >
      {message.text}
    </div>
  );
}
