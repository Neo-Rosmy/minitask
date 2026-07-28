import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "../login/actions";
import { createBoard, deleteBoard } from "./actions";
import type { Board } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmButton from "@/components/ConfirmButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white font-bold">
              K
            </div>
            <span className="text-lg font-semibold dark:text-white">Kanban</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 dark:text-slate-400 sm:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <form action={signout}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Mis tableros
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Un tablero por proyecto.
            </p>
          </div>
        </div>

        {/* Create board */}
        <form
          action={createBoard}
          className="mt-6 flex max-w-md gap-2"
        >
          <input
            name="title"
            required
            maxLength={80}
            placeholder="Nombre del nuevo tablero…"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Crear
          </button>
        </form>

        {/* Board grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(boards as Board[] | null)?.length ? (
            (boards as Board[]).map((b) => (
              <div
                key={b.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <Link href={`/board/${b.id}`} className="block">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Creado{" "}
                    {new Date(b.created_at).toLocaleDateString("es")}
                  </p>
                </Link>
                <form action={deleteBoard} className="absolute right-3 top-3">
                  <input type="hidden" name="id" value={b.id} />
                  <ConfirmButton
                    message={`¿Eliminar el tablero "${b.title}" y todas sus listas y tarjetas? Esta acción no se puede deshacer.`}
                    title="Eliminar tablero"
                    className="rounded-md px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  >
                    ✕
                  </ConfirmButton>
                </form>
              </div>
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
              Todavía no tienes tableros. Crea el primero arriba.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
