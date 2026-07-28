// Paleta de COLORES para las etiquetas. Las etiquetas en sí ahora son
// editables por tablero (tabla board_labels); cada una referencia un color
// de esta paleta por su `key`.
export type ColorDef = {
  key: string;
  name: string;
  bar: string; // barra en la cara de la tarjeta
  chip: string; // chip (fondo + texto)
  dot: string; // swatch sólido para el selector de color
};

export const COLORS: ColorDef[] = [
  { key: "green", name: "Verde", bar: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200", dot: "bg-emerald-500" },
  { key: "blue", name: "Azul", bar: "bg-blue-400", chip: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200", dot: "bg-blue-500" },
  { key: "purple", name: "Violeta", bar: "bg-violet-400", chip: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200", dot: "bg-violet-500" },
  { key: "red", name: "Rojo", bar: "bg-red-400", chip: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200", dot: "bg-red-500" },
  { key: "amber", name: "Ámbar", bar: "bg-amber-400", chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200", dot: "bg-amber-500" },
  { key: "slate", name: "Gris", bar: "bg-slate-400", chip: "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200", dot: "bg-slate-500" },
];

export const COLOR_MAP: Record<string, ColorDef> = Object.fromEntries(
  COLORS.map((c) => [c.key, c])
);

export const DEFAULT_COLOR = "blue";
