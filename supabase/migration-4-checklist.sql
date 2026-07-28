-- =============================================================
-- Migración 4 — agrega checklist (array JSON) a cards
-- Correr en: Supabase Dashboard > SQL Editor > New query > Run
-- Cada item: { "id": "...", "text": "...", "done": false }
-- =============================================================

alter table public.cards
  add column if not exists checklist jsonb not null default '[]'::jsonb;
