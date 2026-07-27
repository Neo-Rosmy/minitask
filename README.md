# Kanban MVP — Next.js + Supabase

Mini app tipo Trello: **tableros → listas → tarjetas**, con drag & drop, auth de usuarios y datos protegidos por Row Level Security.

## Stack
- **Next.js 15** (App Router, Server Actions, TypeScript)
- **Supabase** (Auth email/password + Postgres + RLS)
- **Tailwind CSS**

## Puesta en marcha (local)

### 1. Crear proyecto Supabase
1. [supabase.com](https://supabase.com) → New project (guarda la DB password).
2. Espera a que el proyecto termine de provisionar (~2 min).

### 2. Cargar el schema
Dashboard Supabase → **SQL Editor** → New query → pega todo `supabase/schema.sql` → **Run**.
Crea tablas `boards`, `lists`, `cards` + políticas RLS (cada usuario solo ve lo suyo).

### 3. Auth: desactivar confirmación por email (para demo rápida)
Dashboard → **Authentication → Providers → Email** → apaga "Confirm email".
Así el signup loguea al instante sin correo de verificación.

### 4. Variables de entorno
```bash
cp .env.local.example .env.local
```
Rellena con Dashboard → **Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key

### 5. Correr
```bash
npm install
npm run dev
```
Abre http://localhost:3000

## Estructura
```
app/
  page.tsx              landing pública
  login/ signup/        auth (server actions en login/actions.ts)
  dashboard/            lista de tableros + crear/borrar
  board/[id]/           tablero: listas + tarjetas + drag&drop
lib/supabase/           clients browser / server / middleware
supabase/schema.sql     tablas + RLS (correr una vez)
middleware.ts           protege /dashboard y /board, refresca sesión
```

## Modelo de datos
`boards (1) → (N) lists (1) → (N) cards`. Borrado en cascada. RLS ata todo al `auth.uid()` dueño del board.

## Deploy
Ver sección de deploy — recomendado **Vercel** (Next) + **Supabase** (ya cloud). Variables de entorno idénticas en Vercel.
