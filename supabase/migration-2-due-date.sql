-- =============================================================
-- Migración 2 — agrega due_date a cards
-- Correr en: Supabase Dashboard > SQL Editor > New query > Run
-- (description ya existe desde el schema inicial)
-- =============================================================

alter table public.cards
  add column if not exists due_date date;
