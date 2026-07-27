import Link from "next/link";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => void;
  error?: string;
};

export default function AuthForm({ mode, action, error }: Props) {
  const isLogin = mode === "login";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white font-bold">
            K
          </div>
          <span className="text-lg font-semibold">Kanban</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? "Entrar" : "Crear cuenta"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? "Ingresá para ver tus tableros."
              : "Empezá a organizar en segundos."}
          </p>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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

        <p className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? (
            <>
              ¿No tenés cuenta?{" "}
              <Link
                href="/signup"
                className="font-medium text-brand-600 hover:underline"
              >
                Registrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-600 hover:underline"
              >
                Entrá
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
