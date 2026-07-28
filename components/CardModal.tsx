"use client";

import { useState } from "react";
import type { Card, ChecklistItem } from "@/lib/types";
import { LABELS } from "@/lib/labels";
import { deleteCard, updateCard } from "@/app/board/[id]/actions";

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  }
}

export default function CardModal({
  card,
  boardId,
  onClose,
}: {
  card: Card;
  boardId: string;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(card.checklist ?? []);
  const [newText, setNewText] = useState("");

  const doneCount = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  function addItem() {
    const text = newText.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: newId(), text, done: false }]);
    setNewText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          action={async (fd) => {
            await updateCard(fd);
            onClose();
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={card.id} />
          <input type="hidden" name="board_id" value={boardId} />
          <input
            type="hidden"
            name="checklist"
            value={JSON.stringify(items)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Título
            </label>
            <input
              name="title"
              required
              defaultValue={card.title}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Descripción
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={card.description ?? ""}
              placeholder="Detalles, notas…"
              className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Etiquetas
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LABELS.map((l) => (
                <label key={l.key} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="labels"
                    value={l.key}
                    defaultChecked={card.labels?.includes(l.key)}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium opacity-40 ring-2 ring-transparent transition peer-checked:opacity-100 peer-checked:ring-brand-500 ${l.chip}`}
                  >
                    {l.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Checklist
              </label>
              {items.length > 0 && (
                <span className="text-xs text-slate-400">
                  {doneCount}/{items.length}
                </span>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            <ul className="mt-2 space-y-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === item.id ? { ...i, done: !i.done } : i
                        )
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.done
                        ? "text-slate-400 line-through dark:text-slate-500"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) => prev.filter((i) => i.id !== item.id))
                    }
                    className="text-slate-300 hover:text-red-600 dark:text-slate-500"
                    title="Quitar item"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex gap-2">
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="+ Añadir item"
                className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={addItem}
                className="rounded-lg border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Añadir
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Fecha de vencimiento
            </label>
            <input
              name="due_date"
              type="date"
              defaultValue={card.due_date ?? ""}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={async () => {
                const fd = new FormData();
                fd.set("id", card.id);
                fd.set("board_id", boardId);
                onClose();
                await deleteCard(fd);
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Eliminar
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
