import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Board, Card, List } from "@/lib/types";
import BoardView from "./BoardView";

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

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
            >
              ← Tableros
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">
              {(board as Board).title}
            </h1>
          </div>
        </div>
      </header>

      <BoardView
        boardId={id}
        lists={(lists ?? []) as List[]}
        cards={(cards ?? []) as Card[]}
      />
    </div>
  );
}
