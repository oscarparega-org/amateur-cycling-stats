'use client';

export default function EventError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-3xl place-items-center px-5 py-16 text-center sm:px-8">
      <div role="alert">
        <h1 className="text-5xl font-semibold leading-none text-[#102a43]">No pudimos cargar el evento</h1>
        <p className="mt-5 text-lg text-slate-600">Revisa tu conexión e intenta de nuevo.</p>
        <button
          className="mt-8 bg-[#102a43] px-5 py-3 font-bold text-white hover:bg-[#173f64]"
          onClick={reset}
          type="button"
        >
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}
