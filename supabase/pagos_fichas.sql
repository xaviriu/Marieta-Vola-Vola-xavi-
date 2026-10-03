-- ============================================================
-- MARIETA VOLA VOLA — Fichas de alumnas y libro de pagos
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- Requiere haber ejecutado antes curso_bloques.sql (por la función is_admin).
-- ============================================================

-- 1. Cristina puede corregir el nombre de una alumna
drop policy if exists "Admin edita perfiles" on public.profiles;
create policy "Admin edita perfiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- 2. Ficha de cada alumna: datos extra opcionales y rol de Comunidad Marieta.
--    Está en una tabla aparte y SOLO la ve Cristina (las alumnas no pueden leerla).
create table if not exists public.alumnas_fichas (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  localidad        text,
  telefono         text,
  instagram        text,
  email_contacto   text,
  notas            text,
  es_comunidad     boolean not null default false,
  comunidad_desde  date,                       -- primer mes que debe pagar
  comunidad_hasta  date,                       -- si se da de baja, último mes
  comunidad_cuota  numeric(8,2) not null default 20,
  updated_at       timestamptz default now()
);

alter table public.alumnas_fichas enable row level security;

drop policy if exists "Admin gestiona las fichas" on public.alumnas_fichas;
create policy "Admin gestiona las fichas" on public.alumnas_fichas
  for all using (public.is_admin()) with check (public.is_admin());

-- 3. Libro de pagos: Cristina anota lo que va pagando cada alumna
create table if not exists public.pagos_registro (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  tipo        text not null default 'taller' check (tipo in ('taller', 'comunidad', 'otro')),
  concepto    text not null,                     -- por ejemplo "Proyecto 1" o "Cuota Comunidad junio"
  periodo     date,                              -- solo cuotas de comunidad: día 1 del mes que se paga
  importe     numeric(8,2) not null default 0,
  metodo      text,                              -- paypal, bizum, transferencia, efectivo...
  estado      text not null default 'pagado' check (estado in ('pagado', 'pendiente')),
  fecha       date default current_date,
  notas       text,
  created_at  timestamptz default now()
);

create index if not exists pagos_registro_user on public.pagos_registro (user_id, created_at desc);

alter table public.pagos_registro enable row level security;

drop policy if exists "Admin gestiona el libro de pagos" on public.pagos_registro;
create policy "Admin gestiona el libro de pagos" on public.pagos_registro
  for all using (public.is_admin()) with check (public.is_admin());
