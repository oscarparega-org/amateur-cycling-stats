import { RoleTypeEnum } from '@acs/shared';
import { HealthCheck } from '@/components/health-check';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Next.js 16 · React 19 · App Router
      </div>

      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
        Amateur Cycling Stats
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        The new frontend workspace is ready for the application migration.
      </p>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Shared workspace</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">@acs/shared connected</p>
          <code className="mt-3 block rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-100">
            RoleTypeEnum.ADMIN = {RoleTypeEnum.ADMIN}
          </code>
        </div>
        <HealthCheck />
      </section>
    </main>
  );
}
