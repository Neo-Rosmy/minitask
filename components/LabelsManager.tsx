"use client";

import { useState, useTransition } from "react";
import type { BoardLabel } from "@/lib/types";
import { COLORS, DEFAULT_COLOR } from "@/lib/labels";
import {
  createLabel,
  deleteLabel,
  updateLabel,
} from "@/app/board/[id]/actions";

function ColorDots({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {COLORS.map((c) => (
        <button
          key={c.key}
          type="button"
          title={c.name}
          onClick={() => onChange(c.key)}
          className={`h-5 w-5 rounded-full ${c.dot} ${
            value === c.key
              ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-800"
              : "opacity-60 hover:opacity-100"
          }`}
        />
      ))}
    </div>
  );
}

function LabelRow({
  label,
  boardId,
  pending,
  run,
}: {
  label: BoardLabel;
  boardId: string;
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
}) {
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);
  const dirty = name.trim() !== label.name || color !== label.color;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
      <ColorDots value={color} onChange={setColor} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      />
      {dirty && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateLabel(label.id, boardId, name, color))}
          className="rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700"
        >
          Guardar
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(`¿Eliminar la etiqueta "${label.name}"?`))
            run(() => deleteLabel(label.id, boardId));
        }}
        className="rounded-md px-2 py-1 text-xs text-slate-400 hover:text-red-600"
        title="Eliminar etiqueta"
      >
        ✕
      </button>
    </div>
  );
}

export default function LabelsManager({
  boardId,
  labels,
  onClose,
}: {
  boardId: string;
  labels: BoardLabel[];
  onClose: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>) => start(() => void fn());

  function add() {
    const name = newName.trim();
    if (!name) return;
    run(() => createLabel(boardId, name, newColor));
    setNewName("");
    setNewColor(DEFAULT_COLOR);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Etiquetas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {labels.length === 0 && (
            <p className="text-sm text-slate-400">
              Todavía no hay etiquetas. Creá la primera abajo.
            </p>
          )}
          {labels.map((l) => (
            <LabelRow
              key={l.id}
              label={l}
              boardId={boardId}
              pending={pending}
              run={run}
            />
          ))}
        </div>

        {/* Add new */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <ColorDots value={newColor} onChange={setNewColor} />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            maxLength={40}
            placeholder="Nueva etiqueta…"
            className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="rounded-md bg-brand-600 px-3 py-1 text-sm font-medium text-white hover:bg-brand-700"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
