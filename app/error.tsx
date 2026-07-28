"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 dark:bg-slate-900">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-2xl dark:bg-red-900/40">
          ⚠️
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Algo salió mal
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Hubo un error al procesar la acción. Puedes reintentar.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
