import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AnimatedBoard from "@/components/AnimatedBoard";
import ThemeToggle from "@/components/ThemeToggle";

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
          <span className="text-lg font-semibold dark:text-white">Kanban</span>
        </div>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
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
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          Organiza tu trabajo en{" "}
          <span className="text-brand-600 dark:text-brand-400">tableros</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
          Tableros, listas y tarjetas. Arrastra para reordenar. Tus datos,
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
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Demo animada: crear → editar → drag & drop */}
        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <AnimatedBoard />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
            Todo lo que necesitas
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                i: "🗂️",
                t: "Tableros, listas y tarjetas",
                d: "Organiza cada proyecto en su tablero. Crea los que necesites.",
              },
              {
                i: "✋",
                t: "Drag & drop",
                d: "Mueve y reordena tarjetas entre listas arrastrando y soltando.",
              },
              {
                i: "🏷️",
                t: "Etiquetas de color",
                d: "Crea, edita y elimina etiquetas propias para clasificar tarjetas.",
              },
              {
                i: "📅",
                t: "Fecha y hora de vencimiento",
                d: "Asigna vencimientos con hora y mira de un vistazo qué está por vencer.",
              },
              {
                i: "☑️",
                t: "Checklists",
                d: "Divide cada tarjeta en sub-tareas con barra de progreso.",
              },
              {
                i: "📝",
                t: "Descripciones",
                d: "Suma detalles y notas a cada tarjeta desde su ficha.",
              },
              {
                i: "🔍",
                t: "Buscar y filtrar",
                d: "Encuentra tarjetas por texto o filtra por etiqueta al instante.",
              },
              {
                i: "🌙",
                t: "Modo oscuro",
                d: "Alterna entre claro y oscuro; recuerda tu preferencia.",
              },
              {
                i: "🔒",
                t: "Seguro por usuario",
                d: "RLS de Supabase: cada usuario solo ve y edita sus propios datos.",
              },
            ].map((f) => (
              <div key={f.t}>
                <div className="text-2xl">{f.i}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  {f.t}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        Hecho con Next.js + Supabase · MVP demo
      </footer>
    </main>
  );
}
