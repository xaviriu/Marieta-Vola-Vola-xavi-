-- ============================================================
-- MARIETA VOLA VOLA — Tienda editable desde el panel de admin
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- Requiere haber ejecutado antes curso_bloques.sql (por la función is_admin).
-- ============================================================

create table if not exists public.productos (
  id           uuid default gen_random_uuid() primary key,
  nombre       text not null,
  tipo         text not null default 'Por encargo' check (tipo in ('Por encargo', 'Hecho a mano')),
  descripcion  text,
  precio       numeric(8,2),                  -- vacío = "Pregúntame el precio"
  imagen_url   text,
  orden        integer not null default 0,
  visible      boolean not null default true,
  created_at   timestamptz default now()
);

create index if not exists productos_orden on public.productos (orden, created_at);

alter table public.productos enable row level security;

-- Cualquier visitante de la web puede VER los productos visibles
drop policy if exists "Todo el mundo ve los productos visibles" on public.productos;
create policy "Todo el mundo ve los productos visibles" on public.productos
  for select using (visible = true);

-- Solo Cristina puede crear, cambiar, ocultar y borrar (y ver los ocultos)
drop policy if exists "Admin gestiona los productos" on public.productos;
create policy "Admin gestiona los productos" on public.productos
  for all using (public.is_admin()) with check (public.is_admin());

-- Almacén PÚBLICO para las fotos de los productos (máximo 5 MB cada una)
insert into storage.buckets (id, name, public, file_size_limit)
values ('tienda', 'tienda', true, 5242880)
on conflict (id) do update set public = true, file_size_limit = 5242880;

drop policy if exists "Admin gestiona las fotos de la tienda" on storage.objects;
create policy "Admin gestiona las fotos de la tienda" on storage.objects
  for all using (bucket_id = 'tienda' and public.is_admin())
  with check (bucket_id = 'tienda' and public.is_admin());
