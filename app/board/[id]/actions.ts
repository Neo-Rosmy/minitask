"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function client() {
  return await createClient();
}

// ---- Lists ----
export async function createList(formData: FormData) {
  const supabase = await client();
  const boardId = String(formData.get("board_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!boardId || !title) return;

  const { data: last } = await supabase
    .from("lists")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;
  await supabase.from("lists").insert({ board_id: boardId, title, position });
  revalidatePath(`/board/${boardId}`);
}

export async function deleteList(formData: FormData) {
  const supabase = await client();
  const id = String(formData.get("id") ?? "");
  const boardId = String(formData.get("board_id") ?? "");
  if (!id) return;
  await supabase.from("lists").delete().eq("id", id);
  revalidatePath(`/board/${boardId}`);
}

// ---- Cards ----
export async function createCard(formData: FormData) {
  const supabase = await client();
  const listId = String(formData.get("list_id") ?? "");
  const boardId = String(formData.get("board_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!listId || !title) return;

  const { data: last } = await supabase
    .from("cards")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;
  await supabase.from("cards").insert({ list_id: listId, title, position });
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(formData: FormData) {
  const supabase = await client();
  const id = String(formData.get("id") ?? "");
  const boardId = String(formData.get("board_id") ?? "");
  if (!id) return;
  await supabase.from("cards").delete().eq("id", id);
  revalidatePath(`/board/${boardId}`);
}

export async function updateCard(formData: FormData) {
  const supabase = await client();
  const id = String(formData.get("id") ?? "");
  const boardId = String(formData.get("board_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const labels = formData.getAll("labels").map(String);
  if (!id || !title) return;

  await supabase
    .from("cards")
    .update({
      title,
      description: description || null,
      due_date: dueDate || null,
      labels,
    })
    .eq("id", id);

  revalidatePath(`/board/${boardId}`);
}

// ---- Move card (drag & drop) ----
export async function moveCard(
  cardId: string,
  targetListId: string,
  boardId: string
) {
  const supabase = await client();
  if (!cardId || !targetListId) return;

  const { data: last } = await supabase
    .from("cards")
    .select("position")
    .eq("list_id", targetListId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;
  await supabase
    .from("cards")
    .update({ list_id: targetListId, position })
    .eq("id", cardId);

  revalidatePath(`/board/${boardId}`);
}
