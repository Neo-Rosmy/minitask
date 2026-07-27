import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white font-bold">
            K
          </div>
          <span className="text-lg font-semibold">Kanban</span>
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Ir a mis tableros
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
          MVP · Next.js + Supabase
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Organizá tu trabajo en{" "}
          <span className="text-brand-600">tableros</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Tableros, listas y tarjetas. Arrastrá para reordenar. Tus datos,
          seguros y sincronizados. Simple como debe ser.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            {user ? "Ir a mis tableros" : "Empezar gratis"}
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Fake board preview */}
        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex gap-4 overflow-hidden text-left">
            {[
              { t: "Por hacer", cards: ["Diseñar landing", "Setup Supabase"] },
              { t: "En curso", cards: ["Auth con RLS"] },
              { t: "Hecho", cards: ["Crear repo", "Elegir stack"] },
            ].map((col) => (
              <div
                key={col.t}
                className="flex-1 rounded-xl bg-slate-100 p-3"
              >
                <p className="mb-2 px-1 text-sm font-semibold text-slate-700">
                  {col.t}
                </p>
                <div className="space-y-2">
                  {col.cards.map((c) => (
                    <div
                      key={c}
                      className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-3">
          {[
            {
              t: "Tableros ilimitados",
              d: "Un tablero por proyecto. Creá los que necesites.",
            },
            {
              t: "Drag & drop",
              d: "Mové tarjetas entre listas con arrastrar y soltar.",
            },
            {
              t: "Seguro por usuario",
              d: "Row Level Security de Supabase: solo vos ves tus datos.",
            },
          ].map((f) => (
            <div key={f.t}>
              <h3 className="text-lg font-semibold text-slate-900">{f.t}</h3>
              <p className="mt-2 text-slate-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-slate-500">
        Hecho con Next.js + Supabase · MVP demo
      </footer>
    </main>
  );
}
