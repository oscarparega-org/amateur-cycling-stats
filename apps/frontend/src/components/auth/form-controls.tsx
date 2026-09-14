'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';

export function FormField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const describedBy = error ? `${props.id}-error` : props['aria-describedby'];
  return (
    <div>
      <label className="block text-sm font-semibold text-[#102a43]" htmlFor={props.id}>
        {label}
      </label>
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="mt-2 block h-12 w-full rounded-md border border-slate-300 bg-white px-3.5 text-base font-normal text-slate-950 shadow-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 aria-invalid:border-red-600 aria-invalid:ring-red-100"
      />
      {error ? (
        <span className="mt-1.5 block text-sm text-red-700" id={`${props.id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function PasswordField(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string; error?: string }
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <FormField {...props} type={visible ? 'text' : 'password'} />
      <button
        className="absolute right-3 top-[2.35rem] rounded px-1.5 py-1 text-sm font-semibold text-slate-600 hover:text-blue-700"
        onClick={() => setVisible((value) => !value)}
        type="button"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}

export function SubmitButton({
  pending,
  pendingText,
  children
}: {
  pending: boolean;
  pendingText: string;
  children: ReactNode;
}) {
  return (
    <button
      className="flex h-12 w-full items-center justify-center rounded-md bg-[#102a43] px-5 text-base font-bold text-white hover:bg-[#173f64] disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function StatusMessage({
  kind = 'error',
  children
}: {
  kind?: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  const styles =
    kind === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : kind === 'info'
        ? 'border-blue-200 bg-blue-50 text-blue-900'
        : 'border-red-200 bg-red-50 text-red-800';
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm leading-6 ${styles}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-slate-500" aria-hidden="true">
      <span className="h-px flex-1 bg-slate-200" />o continúa con
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
