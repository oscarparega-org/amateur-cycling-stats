import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';

export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(22rem,0.9fr)_minmax(32rem,1.1fr)]">
      <aside className="timing-grid relative hidden overflow-hidden bg-[#102a43] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <BrandMark inverse />
        <div className="relative z-10 max-w-md pb-14">
          <p className="display-font text-6xl font-semibold leading-[0.88] tracking-tight xl:text-7xl">
            Tu carrera.
            <br />
            Tus números.
          </p>
        </div>
        <div className="route-profile absolute inset-x-0 bottom-0 h-64 bg-[#2563eb] opacity-75" aria-hidden="true" />
        <div
          className="route-profile absolute inset-x-0 bottom-0 h-48 translate-y-10 bg-[#f97316] opacity-90"
          aria-hidden="true"
        />
      </aside>
      <section className="flex items-center justify-center bg-white px-5 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <BrandMark />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#102a43] sm:text-5xl">{title}</h1>
          {intro ? <p className="mt-3 max-w-sm text-base leading-7 text-slate-600">{intro}</p> : null}
          <div className="mt-9">{children}</div>
        </div>
      </section>
    </main>
  );
}
