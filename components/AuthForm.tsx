import Link from "next/link";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => void;
  error?: string;
};

export default function AuthForm({ mode, action, error }: Props) {
  const isLogin = mode === "login";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white font-bold">
            K
          </div>
          <span className="font-display text-lg font-semibold dark:text-white">
            Kanban
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {isLogin ? "Entrar" : "Crear cuenta"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isLogin
              ? "Ingresa para ver tus tableros."
              : "Empieza a organizar en segundos."}
          </p>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {isLogin ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{" "}
              <Link
                href="/signup"
                className="font-medium text-brand-600 hover:underline"
              >
                Regístrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-600 hover:underline"
              >
                Entra
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
