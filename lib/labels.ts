// Paleta fija de etiquetas de color. Cada tarjeta guarda un array de `key`
// en la columna cards.labels (text[]). Sin tablas extra: simple y con la RLS
// de cards ya cubierta.
export type LabelDef = {
  key: string;
  name: string;
  bar: string; // barra en la cara de la tarjeta
  chip: string; // chip en el selector del modal
};

export const LABELS: LabelDef[] = [
  { key: "green", name: "Verde", bar: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200" },
  { key: "blue", name: "Azul", bar: "bg-blue-400", chip: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
  { key: "purple", name: "Violeta", bar: "bg-violet-400", chip: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200" },
  { key: "red", name: "Rojo", bar: "bg-red-400", chip: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
  { key: "amber", name: "Ámbar", bar: "bg-amber-400", chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" },
  { key: "slate", name: "Gris", bar: "bg-slate-400", chip: "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200" },
];

export const LABEL_MAP: Record<string, LabelDef> = Object.fromEntries(
  LABELS.map((l) => [l.key, l])
);
