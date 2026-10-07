-- ============================================================
-- MARIETA VOLA VOLA — Cifras de redes sociales editables desde el panel de admin
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- Requiere haber ejecutado antes curso_bloques.sql (por la función is_admin).
-- ============================================================

create table if not exists public.cifras (
  clave       text primary key check (clave in ('facebook', 'instagram', 'youtube', 'comunidad')),
  valor       integer not null check (valor >= 0),
  updated_at  timestamptz default now()
);

alter table public.cifras enable row level security;

-- Cualquier visitante de la web puede VER las cifras
drop policy if exists "Todo el mundo ve las cifras" on public.cifras;
create policy "Todo el mundo ve las cifras" on public.cifras
  for select using (true);

-- Solo Cristina puede cambiarlas
drop policy if exists "Admin gestiona las cifras" on public.cifras;
create policy "Admin gestiona las cifras" on public.cifras
  for all using (public.is_admin()) with check (public.is_admin());

-- Valores de partida (los mismos que tenía la web). No pisa los que ya hayas cambiado.
insert into public.cifras (clave, valor) values
  ('facebook', 4927),
  ('instagram', 4677),
  ('youtube', 1900),
  ('comunidad', 95)
on conflict (clave) do nothing;
