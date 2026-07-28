-- =============================================================
-- Migración 5 — etiquetas editables por tablero + hora en due_date
-- Correr en: Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================

-- 1) due_date: date -> timestamp (permite guardar también la hora)
alter table public.cards
  alter column due_date type timestamp using due_date::timestamp;

-- 2) Etiquetas personalizables por tablero.
--    cards.labels (text[]) pasa a guardar los IDs de board_labels.
create table if not exists public.board_labels (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  color      text not null default 'blue',
  created_at timestamptz not null default now()
);

create index if not exists board_labels_board_idx
  on public.board_labels (board_id);

alter table public.board_labels enable row level security;

-- Acceso vía el dueño del tablero (misma lógica que lists/cards).
drop policy if exists "board_labels_all" on public.board_labels;
create policy "board_labels_all" on public.board_labels
  for all
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_labels.board_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.boards b
      where b.id = board_labels.board_id and b.user_id = auth.uid()
    )
  );
