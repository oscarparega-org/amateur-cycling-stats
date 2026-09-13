import Link from 'next/link';

export default function EventNotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-3xl place-items-center px-5 py-16 text-center sm:px-8">
      <div>
        <p className="display-font text-8xl font-bold leading-none text-[#f97316]">404</p>
        <h1 className="mt-5 text-5xl font-semibold leading-none text-[#102a43]">Evento no encontrado</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
          El evento no existe o todavía no está disponible públicamente.
        </p>
        <Link className="mt-8 inline-flex bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64]" href="/">
          Ver próximos eventos
        </Link>
      </div>
    </main>
  );
}
