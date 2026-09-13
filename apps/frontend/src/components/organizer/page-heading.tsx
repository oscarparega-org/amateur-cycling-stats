import type { ReactNode } from 'react';

export function PageHeading({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-4xl font-semibold leading-none tracking-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
