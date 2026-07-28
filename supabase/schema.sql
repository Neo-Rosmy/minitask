-- =============================================================
-- Kanban MVP — schema + Row Level Security
-- Pegá TODO esto en: Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================

-- ---- Tables ----
create table if not exists public.boards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.lists (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id          uuid primary key default gen_random_uuid(),
  list_id     uuid not null references public.lists (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 500),
  description text,
  due_date    timestamp,
  labels      text[] not null default '{}',
  checklist   jsonb not null default '[]'::jsonb,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Etiquetas personalizables por tablero. cards.labels guarda estos IDs.
create table if not exists public.board_labels (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  color      text not null default 'blue',
  created_at timestamptz not null default now()
);

-- ---- Indexes ----
create index if not exists boards_user_idx on public.boards (user_id);
create index if not exists lists_board_idx on public.lists (board_id);
create index if not exists cards_list_idx  on public.cards (list_id);
create index if not exists board_labels_board_idx on public.board_labels (board_id);

-- ---- Enable RLS ----
alter table public.boards enable row level security;
alter table public.lists  enable row level security;
alter table public.cards  enable row level security;
alter table public.board_labels enable row level security;

-- ---- Policies: BOARDS (owner-only) ----
drop policy if exists "boards_select" on public.boards;
create policy "boards_select" on public.boards
  for select using (auth.uid() = user_id);

drop policy if exists "boards_insert" on public.boards;
create policy "boards_insert" on public.boards
  for insert with check (auth.uid() = user_id);

drop policy if exists "boards_update" on public.boards;
create policy "boards_update" on public.boards
  for update using (auth.uid() = user_id);

drop policy if exists "boards_delete" on public.boards;
create policy "boards_delete" on public.boards
  for delete using (auth.uid() = user_id);

-- ---- Policies: LISTS (via parent board ownership) ----
drop policy if exists "lists_all" on public.lists;
create policy "lists_all" on public.lists
  for all
  using (
    exists (
      select 1 from public.boards b
      where b.id = lists.board_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.boards b
      where b.id = lists.board_id and b.user_id = auth.uid()
    )
  );

-- ---- Policies: BOARD_LABELS (via parent board ownership) ----
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

-- ---- Policies: CARDS (via list -> board ownership) ----
drop policy if exists "cards_all" on public.cards;
create policy "cards_all" on public.cards
  for all
  using (
    exists (
      select 1 from public.lists l
      join public.boards b on b.id = l.board_id
      where l.id = cards.list_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lists l
      join public.boards b on b.id = l.board_id
      where l.id = cards.list_id and b.user_id = auth.uid()
    )
  );
