"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { BoardLabel, Card, List } from "@/lib/types";
import { COLOR_MAP } from "@/lib/labels";
import CardModal from "@/components/CardModal";
import LabelsManager from "@/components/LabelsManager";
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
  boardLabels: BoardLabel[];
};

// Urgencia de la fecha/hora de vencimiento → color + etiqueta corta.
// due es un timestamp local ("YYYY-MM-DDTHH:mm" o con segundos).
function dueMeta(due: string | null) {
  if (!due) return null;
  const d = new Date(due.replace(" ", "T"));
  if (isNaN(d.getTime())) return null;
  const startOfDue = new Date(d);
  startOfDue.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (startOfDue.getTime() - today.getTime()) / 86400000
  );
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const dateStr = d.toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
  });
  const label = hasTime
    ? `${dateStr} ${d.toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : dateStr;
  let tone =
    "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200";
  if (d.getTime() < Date.now())
    tone = "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
  else if (diffDays <= 2)
    tone =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
  return { label, tone };
}

export default function BoardView({
  boardId,
  lists,
  cards,
  boardLabels,
}: Props) {
  // Local optimistic copy so drag feels instant; server action revalidates.
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overList, setOverList] = useState<string | null>(null);
  // Card id the dragged card would be inserted BEFORE; null = append at end.
  const [overBefore, setOverBefore] = useState<string | null>(null);
  const [editing, setEditing] = useState<Card | null>(null);
  const [query, setQuery] = useState("");
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(false);
  const [isPending, start] = useTransition();

  const labelById = useMemo(
    () => Object.fromEntries(boardLabels.map((l) => [l.id, l])),
    [boardLabels]
  );

  const filterActive = query.trim() !== "" || filterLabels.length > 0;

  function matchesFilter(card: Card) {
    const q = query.trim().toLowerCase();
    const textOk =
      !q ||
      card.title.toLowerCase().includes(q) ||
      (card.description ?? "").toLowerCase().includes(q);
    const labelOk =
      filterLabels.length === 0 ||
      filterLabels.some((l) => card.labels?.includes(l));
    return textOk && labelOk;
  }

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
    <main className="flex h-[calc(100vh-65px)] flex-col bg-slate-50 dark:bg-slate-900">
      {/* Filter / search bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-6 py-3 dark:border-slate-800">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tarjetas…"
          className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <div className="flex flex-wrap gap-1.5">
          {boardLabels.map((l) => {
            const active = filterLabels.includes(l.id);
            const color =
              COLOR_MAP[l.color]?.chip ?? COLOR_MAP.blue.chip;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                  setFilterLabels((prev) =>
                    active ? prev.filter((k) => k !== l.id) : [...prev, l.id]
                  )
                }
                className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition ${color} ${
                  active
                    ? "ring-2 ring-brand-500"
                    : "ring-black/10 hover:ring-black/20 dark:ring-white/10"
                }`}
              >
                {l.name}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowLabels(true)}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ⚙ Etiquetas
        </button>
        {filterActive && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilterLabels([]);
            }}
            className="text-xs text-slate-500 hover:underline dark:text-slate-400"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto p-6">
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
                  {filterActive
                    ? `${cardsFor(list.id).filter(matchesFilter).length}/${cardsFor(list.id).length}`
                    : cardsFor(list.id).length}
                </span>
              </div>
              <form action={deleteList}>
                <input type="hidden" name="id" value={list.id} />
                <input type="hidden" name="board_id" value={boardId} />
                <button
                  onClick={(e) => {
                    if (
                      !window.confirm(
                        `¿Eliminar la lista "${list.title}" y todas sus tarjetas?`
                      )
                    )
                      e.preventDefault();
                  }}
                  className="rounded px-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40"
                  title="Eliminar lista"
                >
                  ✕
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {cardsFor(list.id)
                .filter(matchesFilter)
                .map((card) => {
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
                        {card.labels.map((id) => {
                          const lbl = labelById[id];
                          if (!lbl) return null;
                          const color =
                            COLOR_MAP[lbl.color]?.bar ?? COLOR_MAP.blue.bar;
                          return (
                            <span
                              key={id}
                              title={lbl.name}
                              className={`h-1.5 w-6 rounded-full ${color}`}
                            />
                          );
                        })}
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
                          onClick={(e) => {
                            if (
                              !window.confirm(`¿Eliminar la tarjeta "${card.title}"?`)
                            )
                              e.preventDefault();
                          }}
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
      </div>

      {/* Card detail modal */}
      {editing && (
        <CardModal
          card={editing}
          boardId={boardId}
          boardLabels={boardLabels}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Labels manager */}
      {showLabels && (
        <LabelsManager
          boardId={boardId}
          labels={boardLabels}
          onClose={() => setShowLabels(false)}
        />
      )}
    </main>
  );
}
