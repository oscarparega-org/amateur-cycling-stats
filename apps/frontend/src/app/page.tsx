import Link from 'next/link';
import { getServerSession } from '@/lib/backend';

export default async function Home() {
  const session = await getServerSession();
  return <main><section className="relative overflow-hidden bg-[#102a43] text-white">
    <div className="timing-grid absolute inset-0 opacity-60" aria-hidden="true" />
    <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
      <div>
        <p className="mb-6 flex items-center gap-3 text-sm text-blue-100"><span className="h-px w-12 bg-[#f97316]" />Resultados de ciclismo amateur</p>
        <h1 className="max-w-3xl text-6xl font-semibold leading-[0.86] tracking-tight sm:text-7xl lg:text-8xl">La carrera termina.<br />Los números permanecen.</h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-blue-100">Encuentra eventos, consulta clasificaciones y conserva el historial de cada kilómetro competido.</p>
        <div className="mt-10 flex flex-wrap gap-3">{session ? <span className="rounded-md border border-blue-300/40 bg-white/10 px-5 py-3 font-semibold">Sesión activa como {session.user.firstName || session.user.email}</span> : <><Link className="rounded-md bg-[#f97316] px-5 py-3 font-bold text-white hover:bg-orange-600" href="/registro">Crear mi perfil</Link><Link className="rounded-md border border-white/35 px-5 py-3 font-bold text-white hover:bg-white/10" href="/iniciar-sesion">Iniciar sesión</Link></>}</div>
      </div>
      <div className="relative min-h-80 lg:min-h-[34rem]" aria-hidden="true">
        <div className="absolute right-4 top-0 grid h-40 w-40 rotate-3 place-items-center border-4 border-white bg-[#f8fafc] text-[#102a43] shadow-2xl sm:h-52 sm:w-52"><div className="text-center"><span className="display-font block text-8xl font-bold leading-none sm:text-9xl">21</span><span className="text-sm font-bold">ACS</span></div></div>
        <div className="route-profile absolute inset-x-0 bottom-10 h-64 bg-[#2563eb]" />
        <div className="route-profile absolute inset-x-0 bottom-0 h-52 translate-y-8 bg-[#f97316]" />
      </div>
    </div>
  </section></main>;
}
