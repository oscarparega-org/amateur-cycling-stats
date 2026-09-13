'use client';

import type { MouseEvent } from 'react';

export function ConfirmSubmit({
  children,
  message,
  className
}: {
  children: string;
  message: string;
  className: string;
}) {
  function confirm(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }
  return (
    <button className={className} onClick={confirm} type="submit">
      {children}
    </button>
  );
}
