-- =============================================================
-- Migración 3 — agrega labels (array de colores) a cards
-- Correr en: Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================

alter table public.cards
  add column if not exists labels text[] not null default '{}';
