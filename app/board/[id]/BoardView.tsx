"use client";

import { useEffect, useState, useTransition } from "react";
import type { Card, List } from "@/lib/types";
import {
  createCard,
  createList,
  deleteCard,
  deleteList,
  moveCard,
} from "./actions";

type Props = {
  boardId: string;
  lists: List[];
  cards: Card[];
};

export default function BoardView({ boardId, lists, cards }: Props) {
  // Local optimistic copy so drag feels instant; server action revalidates.
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overList, setOverList] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  // Server revalidates after each action; keep local copy in sync with the
  // authoritative props (useState only seeds once, so without this newly
  // created / moved / deleted cards wouldn't show until a full reload).
  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  function cardsFor(listId: string) {
    return localCards
      .filter((c) => c.list_id === listId)
      .sort((a, b) => a.position - b.position);
  }

  function onDrop(targetListId: string) {
    if (!dragId) return;
    const card = localCards.find((c) => c.id === dragId);
    setOverList(null);
    setDragId(null);
    if (!card || card.list_id === targetListId) return;

    // optimistic
    setLocalCards((prev) =>
      prev.map((c) =>
        c.id === dragId ? { ...c, list_id: targetListId } : c
      )
    );
    start(() => {
      moveCard(dragId, targetListId, boardId);
    });
  }

  return (
    <main className="h-[calc(100vh-65px)] overflow-x-auto bg-slate-50 p-6">
      <div className="flex items-start gap-4">
        {lists.map((list) => (
          <div
            key={list.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverList(list.id);
            }}
            onDragLeave={() => setOverList((v) => (v === list.id ? null : v))}
            onDrop={() => onDrop(list.id)}
            className={`w-72 shrink-0 rounded-xl bg-slate-100 p-3 transition ${
              overList === list.id ? "ring-2 ring-brand-400" : ""
            }`}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700">
                {list.title}
              </h3>
              <form action={deleteList}>
                <input type="hidden" name="id" value={list.id} />
                <input type="hidden" name="board_id" value={boardId} />
                <button
                  className="rounded px-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Eliminar lista"
                >
                  ✕
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {cardsFor(list.id).map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDragId(card.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`group flex cursor-grab items-start justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm active:cursor-grabbing ${
                    dragId === card.id ? "opacity-50" : ""
                  }`}
                >
                  <span className="pr-2">{card.title}</span>
                  <form action={deleteCard}>
                    <input type="hidden" name="id" value={card.id} />
                    <input type="hidden" name="board_id" value={boardId} />
                    <button
                      className="rounded px-1 text-slate-300 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                      title="Eliminar tarjeta"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              ))}
            </div>

            {/* Add card */}
            <form action={createCard} className="mt-2">
              <input type="hidden" name="list_id" value={list.id} />
              <input type="hidden" name="board_id" value={boardId} />
              <input
                name="title"
                required
                placeholder="+ Añadir tarjeta"
                className="w-full rounded-lg border border-transparent bg-slate-100 px-2 py-1.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
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
          className="w-72 shrink-0 rounded-xl border border-dashed border-slate-300 p-3"
        >
          <input type="hidden" name="board_id" value={boardId} />
          <input
            name="title"
            required
            placeholder="+ Añadir lista"
            className="w-full rounded-lg bg-white px-2 py-1.5 text-sm outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="sr-only">
            Añadir lista
          </button>
        </form>
      </div>

      {isPending ? (
        <p className="mt-4 text-xs text-slate-400">Guardando…</p>
      ) : null}
    </main>
  );
}
