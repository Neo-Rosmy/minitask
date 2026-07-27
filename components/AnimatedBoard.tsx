// Demo animada del landing: una tarea se crea, se edita y se arrastra entre
// columnas en loop. Solo CSS (keyframes en globals.css) — sin JS, funciona en
// SSR y respeta prefers-reduced-motion.
const COLUMNS = [
  { title: "Por hacer", cards: ["Configurar Supabase"] },
  { title: "En curso", cards: ["Auth con RLS"] },
  { title: "Hecho", cards: ["Crear repo", "Elegir stack"] },
];

export default function AnimatedBoard() {
  return (
    <div className="mx-auto flex max-w-full justify-center overflow-x-auto py-2">
      <div className="relative" style={{ width: 468, height: 236 }}>
        {/* Columnas */}
        <div className="flex gap-3">
          {COLUMNS.map((col) => (
            <div
              key={col.title}
              className="rounded-xl bg-slate-100 p-3"
              style={{ width: 148, height: 236 }}
            >
              <div className="mb-2 flex items-center gap-2 px-1">
                <p className="text-xs font-semibold text-slate-700">
                  {col.title}
                </p>
                <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-medium text-slate-500">
                  {col.cards.length}
                </span>
              </div>
              {/* Espacio reservado para la tarjeta animada en la 1ª columna */}
              <div className="space-y-2">
                {col.title === "Por hacer" ? (
                  <div style={{ height: 34 }} />
                ) : null}
                {col.cards.map((c) => (
                  <div
                    key={c}
                    className="rounded-lg bg-white px-2.5 py-2 text-xs text-slate-600 shadow-sm"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tarjeta animada (create → edit → drag) */}
        <div
          className="demo-card absolute"
          style={{ left: 12, top: 52, width: 124 }}
        >
          <div className="relative rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-slate-800 shadow-lg ring-1 ring-brand-200">
            {/* texto B en flujo define la altura; texto A superpuesto */}
            <span className="demo-text-b block">Diseñar landing</span>
            <span className="demo-text-a absolute inset-0 flex items-center px-2.5 text-slate-400">
              Nueva tarea…
            </span>
          </div>
        </div>

        {/* Píldora de estado (narra la fase) */}
        <div className="absolute right-1 top-1 h-5">
          <span className="demo-status-1 absolute right-0 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            + Creando
          </span>
          <span className="demo-status-2 absolute right-0 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            ✎ Editando
          </span>
          <span className="demo-status-3 absolute right-0 whitespace-nowrap rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700">
            ⇄ Moviendo
          </span>
        </div>
      </div>
    </div>
  );
}
