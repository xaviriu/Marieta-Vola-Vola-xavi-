-- ============================================================
-- MARIETA VOLA VOLA — Miniaturas, notas personales y seguimiento
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- Requiere haber ejecutado antes curso_bloques.sql y progreso.sql.
-- ============================================================

-- 1. Campo de la miniatura del curso
alter table public.cursos add column if not exists imagen_url text;

-- 2. Almacén PÚBLICO solo para las miniaturas de los cursos (son imágenes de portada)
insert into storage.buckets (id, name, public, file_size_limit)
values ('curso-miniaturas', 'curso-miniaturas', true, 5242880)
on conflict (id) do update set public = true, file_size_limit = 5242880;

drop policy if exists "Admin gestiona miniaturas" on storage.objects;
create policy "Admin gestiona miniaturas" on storage.objects
  for all using (bucket_id = 'curso-miniaturas' and public.is_admin())
  with check (bucket_id = 'curso-miniaturas' and public.is_admin());

-- 3. Notas personales: solo las ve la alumna que las escribe (ni siquiera Cristina)
create table if not exists public.notas_alumna (
  user_id     uuid references auth.users(id) on delete cascade not null,
  bloque_id   uuid references public.curso_bloques(id) on delete cascade not null,
  texto       text not null,
  updated_at  timestamptz default now(),
  primary key (user_id, bloque_id)
);

alter table public.notas_alumna enable row level security;

drop policy if exists "Notas propias" on public.notas_alumna;
create policy "Notas propias" on public.notas_alumna
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4. Seguimiento: Cristina puede VER el progreso de todas las alumnas (no modificarlo)
drop policy if exists "Admin ve el progreso de bloques" on public.progreso_bloques;
create policy "Admin ve el progreso de bloques" on public.progreso_bloques
  for select using (public.is_admin());

drop policy if exists "Admin ve el progreso de cursos" on public.progreso_cursos;
create policy "Admin ve el progreso de cursos" on public.progreso_cursos
  for select using (public.is_admin());

-- 5. Último acceso y email de cada alumna (solo lo puede pedir Cristina)
create or replace function public.admin_accesos()
returns table (user_id uuid, email text, ultimo_acceso timestamptz)
language plpgsql
security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;
  return query select u.id, u.email::text, u.last_sign_in_at from auth.users u;
end;
$$;

revoke all on function public.admin_accesos() from public;
revoke all on function public.admin_accesos() from anon;
grant execute on function public.admin_accesos() to authenticated;
