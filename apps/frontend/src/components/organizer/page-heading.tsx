import type { ReactNode } from 'react';

export function PageHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end">
      <h1 className="text-4xl font-semibold leading-none tracking-tight sm:text-5xl">{title}</h1>
      {action}
    </div>
  );
}
