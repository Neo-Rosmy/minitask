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

  // checklist arrives as a JSON string; validate shape before persisting.
  let checklist: { id: string; text: string; done: boolean }[] = [];
  const rawChecklist = formData.get("checklist");
  if (typeof rawChecklist === "string" && rawChecklist) {
    try {
      const parsed = JSON.parse(rawChecklist);
      if (Array.isArray(parsed)) {
        checklist = parsed
          .filter((x) => x && typeof x.text === "string")
          .map((x) => ({
            id: String(x.id ?? ""),
            text: String(x.text).slice(0, 300),
            done: !!x.done,
          }));
      }
    } catch {
      // malformed payload — keep checklist empty rather than failing the save.
    }
  }

  await supabase
    .from("cards")
    .update({
      title,
      description: description || null,
      due_date: dueDate || null,
      labels,
      checklist,
    })
    .eq("id", id);

  revalidatePath(`/board/${boardId}`);
}

// ---- Reorder / move cards (drag & drop) ----
// orderedIds = the full, final order of cards in targetListId (including the
// dragged card). Sets list_id + position = index for each, so it handles both
// reordering within a list and moving between lists at a specific spot.
export async function reorderList(
  boardId: string,
  targetListId: string,
  orderedIds: string[]
) {
  const supabase = await client();
  if (!targetListId || orderedIds.length === 0) return;

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("cards")
        .update({ list_id: targetListId, position: index })
        .eq("id", id)
    )
  );

  revalidatePath(`/board/${boardId}`);
}
