import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";
import { updateEmail, updatePassword, updateProfile } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ?? "";

  const inputCls =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400";
  const labelCls =
    "block text-xs font-medium text-slate-500 dark:text-slate-400";
  const btnCls =
    "rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700";
  const cardCls =
    "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            ← Tableros
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Mi cuenta
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Actualiza tu nombre, email y contraseña.
        </p>

        {ok ? (
          <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {ok}
          </p>
        ) : null}
        {error ? (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-8 space-y-6">
          {/* Perfil */}
          <section className={cardCls}>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Perfil
            </h2>
            <form action={updateProfile} className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Nombre para mostrar</label>
                <input
                  name="display_name"
                  defaultValue={displayName}
                  maxLength={60}
                  placeholder="Tu nombre"
                  className={inputCls}
                />
              </div>
              <button className={btnCls}>Guardar perfil</button>
            </form>
          </section>

          {/* Email */}
          <section className={cardCls}>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Email
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Email actual:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {user?.email}
              </span>
            </p>
            <form action={updateEmail} className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Nuevo email</label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nuevo@email.com"
                  className={inputCls}
                />
              </div>
              <button className={btnCls}>Cambiar email</button>
              <p className="text-xs text-slate-400">
                Recibirás un enlace de confirmación en el nuevo correo.
              </p>
            </form>
          </section>

          {/* Contraseña */}
          <section className={cardCls}>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Contraseña
            </h2>
            <form action={updatePassword} className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Nueva contraseña</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Repetir contraseña</label>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  className={inputCls}
                />
              </div>
              <button className={btnCls}>Cambiar contraseña</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
