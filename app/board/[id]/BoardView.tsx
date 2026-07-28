"use client";

import { useEffect, useState, useTransition } from "react";
import type { Card, List } from "@/lib/types";
import { LABEL_MAP } from "@/lib/labels";
import CardModal from "@/components/CardModal";
import {
  createCard,
  createList,
  deleteCard,
  deleteList,
  reorderList,
} from "./actions";

type Props = {
  boardId: string;
  lists: List[];
  cards: Card[];
};

// Urgencia de la fecha de vencimiento → color + etiqueta corta.
function dueMeta(due: string | null) {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString("es", { day: "2-digit", month: "short" });
  let tone =
    "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200";
  if (diffDays < 0)
    tone = "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
  else if (diffDays <= 2)
    tone =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
  return { label, tone };
}

export default function BoardView({ boardId, lists, cards }: Props) {
  // Local optimistic copy so drag feels instant; server action revalidates.
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overList, setOverList] = useState<string | null>(null);
  // Card id the dragged card would be inserted BEFORE; null = append at end.
  const [overBefore, setOverBefore] = useState<string | null>(null);
  const [editing, setEditing] = useState<Card | null>(null);
  const [isPending, start] = useTransition();

  // Server revalidates after each action; keep local copy in sync with the
  // authoritative props (useState only seeds once, so without this newly
  // created / moved / deleted cards wouldn't show until a full reload).
  useEffect(() => {
    setLocalCards(cards);
    // keep the open modal fresh if its card changed server-side
    setEditing((cur) =>
      cur ? cards.find((c) => c.id === cur.id) ?? null : null
    );
  }, [cards]);

  function cardsFor(listId: string) {
    return localCards
      .filter((c) => c.list_id === listId)
      .sort((a, b) => a.position - b.position);
  }

  // Final order of a target list after inserting `draggedId` before `beforeId`
  // (null = append). The dragged card is removed first so it can't duplicate.
  function computeOrder(
    listId: string,
    draggedId: string,
    beforeId: string | null
  ) {
    const targetIds = cardsFor(listId)
      .filter((c) => c.id !== draggedId)
      .map((c) => c.id);
    const order: string[] = [];
    let inserted = false;
    for (const id of targetIds) {
      if (id === beforeId) {
        order.push(draggedId);
        inserted = true;
      }
      order.push(id);
    }
    if (!inserted) order.push(draggedId);
    return order;
  }

  function handleDrop(listId: string) {
    const draggedId = dragId;
    const beforeId = overBefore;
    setDragId(null);
    setOverList(null);
    setOverBefore(null);
    if (!draggedId) return;

    const order = computeOrder(listId, draggedId, beforeId);
    const current = cardsFor(listId).map((c) => c.id);
    const dragged = localCards.find((c) => c.id === draggedId);
    // No-op: same list and identical order.
    if (
      dragged?.list_id === listId &&
      current.length === order.length &&
      current.every((id, i) => id === order[i])
    ) {
      return;
    }

    // Optimistic: apply new list_id + positions locally.
    setLocalCards((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));
      order.forEach((id, i) => {
        const c = map.get(id);
        if (c) map.set(id, { ...c, list_id: listId, position: i });
      });
      return [...map.values()];
    });
    start(() => {
      reorderList(boardId, listId, order);
    });
  }

  return (
    <main className="h-[calc(100vh-65px)] overflow-x-auto bg-slate-50 p-6 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        {lists.map((list) => (
          <div
            key={list.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverList(list.id);
              setOverBefore(null); // over column gap → append at end
            }}
            onDragLeave={() => setOverList((v) => (v === list.id ? null : v))}
            onDrop={() => handleDrop(list.id)}
            className={`w-72 shrink-0 rounded-xl bg-slate-100 p-3 transition dark:bg-slate-800 ${
              overList === list.id ? "ring-2 ring-brand-400" : ""
            }`}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {list.title}
                </h3>
                <span className="rounded-full bg-slate-200 px-2 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {cardsFor(list.id).length}
                </span>
              </div>
              <form action={deleteList}>
                <input type="hidden" name="id" value={list.id} />
                <input type="hidden" name="board_id" value={boardId} />
                <button
                  className="rounded px-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40"
                  title="Eliminar lista"
                >
                  ✕
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {cardsFor(list.id).map((card) => {
                const due = dueMeta(card.due_date);
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => setDragId(card.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverList(null);
                      setOverBefore(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!dragId || card.id === dragId) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const after = e.clientY > rect.top + rect.height / 2;
                      const listCards = cardsFor(list.id);
                      const idx = listCards.findIndex((c) => c.id === card.id);
                      const next = after ? listCards[idx + 1] : listCards[idx];
                      setOverList(list.id);
                      setOverBefore(next ? next.id : null);
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDrop(list.id);
                    }}
                    onClick={() => setEditing(card)}
                    className={`group cursor-pointer rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-700 dark:text-slate-100 ${
                      dragId === card.id ? "opacity-50" : ""
                    } ${
                      overList === list.id && overBefore === card.id
                        ? "border-t-2 border-brand-500"
                        : "border-t-2 border-transparent"
                    }`}
                  >
                    {card.labels?.length ? (
                      <div className="mb-1.5 flex flex-wrap gap-1">
                        {card.labels.map((k) =>
                          LABEL_MAP[k] ? (
                            <span
                              key={k}
                              title={LABEL_MAP[k].name}
                              className={`h-1.5 w-6 rounded-full ${LABEL_MAP[k].bar}`}
                            />
                          ) : null
                        )}
                      </div>
                    ) : null}
                    <div className="flex items-start justify-between">
                      <span className="pr-2">{card.title}</span>
                      <form
                        action={deleteCard}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input type="hidden" name="id" value={card.id} />
                        <input
                          type="hidden"
                          name="board_id"
                          value={boardId}
                        />
                        <button
                          className="rounded px-1 text-slate-300 opacity-0 transition hover:text-red-600 group-hover:opacity-100 dark:text-slate-500"
                          title="Eliminar tarjeta"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                    {(() => {
                      const cl = card.checklist ?? [];
                      const clDone = cl.filter((i) => i.done).length;
                      const allDone = cl.length > 0 && clDone === cl.length;
                      if (!due && !card.description && cl.length === 0)
                        return null;
                      return (
                        <div className="mt-1.5 flex items-center gap-2">
                          {due && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${due.tone}`}
                            >
                              📅 {due.label}
                            </span>
                          )}
                          {cl.length > 0 && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                                allDone
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200"
                              }`}
                              title="Checklist"
                            >
                              ☑ {clDone}/{cl.length}
                            </span>
                          )}
                          {card.description && (
                            <span
                              className="text-slate-400 dark:text-slate-500"
                              title="Tiene descripción"
                            >
                              ☰
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Add card */}
            <form action={createCard} className="mt-2">
              <input type="hidden" name="list_id" value={list.id} />
              <input type="hidden" name="board_id" value={boardId} />
              <input
                name="title"
                required
                placeholder="+ Añadir tarjeta"
                className="w-full rounded-lg border border-transparent bg-slate-100 px-2 py-1.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500 dark:focus:bg-slate-600"
              />
              <button type="submit" className="sr-only">
                Añadir tarjeta
              </button>
            </form>
          </div>
        ))}

        {/* Add list */}
        <form
          action={createList}
          className="w-72 shrink-0 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700"
        >
          <input type="hidden" name="board_id" value={boardId} />
          <input
            name="title"
            required
            placeholder="+ Añadir lista"
            className="w-full rounded-lg bg-white px-2 py-1.5 text-sm outline-none placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
          <button type="submit" className="sr-only">
            Añadir lista
          </button>
        </form>
      </div>

      {isPending ? (
        <p className="mt-4 text-xs text-slate-400">Guardando…</p>
      ) : null}

      {/* Card detail modal */}
      {editing && (
        <CardModal
          card={editing}
          boardId={boardId}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
