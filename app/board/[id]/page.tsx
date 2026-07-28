import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Board, BoardLabel, Card, List } from "@/lib/types";
import BoardView from "./BoardView";
import ThemeToggle from "@/components/ThemeToggle";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!board) notFound();

  const { data: lists } = await supabase
    .from("lists")
    .select("*")
    .eq("board_id", id)
    .order("position", { ascending: true });

  const listIds = (lists ?? []).map((l) => l.id);
  const { data: cards } = listIds.length
    ? await supabase
        .from("cards")
        .select("*")
        .in("list_id", listIds)
        .order("position", { ascending: true })
    : { data: [] as Card[] };

  const { data: boardLabels } = await supabase
    .from("board_labels")
    .select("*")
    .eq("board_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              ← Tableros
            </Link>
            <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {(board as Board).title}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <BoardView
        boardId={id}
        lists={(lists ?? []) as List[]}
        cards={(cards ?? []) as Card[]}
        boardLabels={(boardLabels ?? []) as BoardLabel[]}
      />
    </div>
  );
}
