'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type AlertKind = 'success' | 'error' | 'info';

const kindStyles: Record<AlertKind, string> = {
  success: 'border-emerald-600 bg-emerald-50 text-emerald-950',
  error: 'border-red-600 bg-red-50 text-red-950',
  info: 'border-blue-600 bg-blue-50 text-blue-950'
};

export function Alert({
  children,
  kind = 'info',
  closeLabel,
  autoCloseMs,
  onClose
}: {
  children: ReactNode;
  kind?: AlertKind;
  closeLabel: string;
  autoCloseMs?: number;
  onClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<number>(undefined);

  useEffect(() => {
    if (autoCloseMs === undefined) return;

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, autoCloseMs);

    return () => window.clearTimeout(timeoutRef.current);
  }, [autoCloseMs, onClose]);

  if (!visible) return null;

  function close() {
    window.clearTimeout(timeoutRef.current);
    setVisible(false);
    onClose?.();
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-end sm:left-auto sm:w-full sm:max-w-md">
      <div
        className={`pointer-events-auto flex w-full items-start gap-3 border-l-4 px-4 py-3 text-sm font-semibold shadow-lg ${kindStyles[kind]}`}
        role={kind === 'error' ? 'alert' : 'status'}
      >
        <p className="min-w-0 flex-1 leading-6">{children}</p>
        <button
          aria-label={closeLabel}
          className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-sm hover:bg-black/5"
          onClick={close}
          type="button"
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
          </svg>
        </button>
      </div>
    </div>
  );
}
