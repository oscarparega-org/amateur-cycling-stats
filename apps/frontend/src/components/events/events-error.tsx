import Link from 'next/link';

export function EventsError() {
  return (
    <div className="border-y border-slate-300 py-14 text-center" role="alert">
      <p className="display-font text-3xl font-semibold text-[#102a43]">No pudimos cargar los eventos</p>
      <p className="mt-2 text-slate-600">Revisa tu conexión e intenta de nuevo.</p>
      <Link
        className="mt-6 inline-flex border-2 border-[#102a43] px-5 py-2.5 font-bold hover:bg-[#102a43] hover:text-white"
        href="/"
      >
        Intentar de nuevo
      </Link>
    </div>
  );
}
