-- ============================================================
-- MARIETA VOLA VOLA — Fotos de las labores terminadas
-- Las alumnas envían una foto de lo que han bordado y Cristina la ve en su panel.
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- Requiere haber ejecutado antes curso_bloques.sql.
-- ============================================================

create table if not exists public.labores (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  curso_id    uuid references public.cursos(id) on delete cascade not null,
  foto_path   text not null,
  created_at  timestamptz default now()
);

create index if not exists labores_created on public.labores (created_at desc);

alter table public.labores enable row level security;

-- La alumna ve y envía sus propias fotos (solo de cursos en los que está matriculada)
drop policy if exists "Alumna ve sus labores" on public.labores;
create policy "Alumna ve sus labores" on public.labores
  for select using (user_id = auth.uid());

drop policy if exists "Alumna envía su labor" on public.labores;
create policy "Alumna envía su labor" on public.labores
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.matriculas m where m.user_id = auth.uid() and m.curso_id = labores.curso_id)
  );

-- Cristina ve y puede borrar todas
drop policy if exists "Admin gestiona las labores" on public.labores;
create policy "Admin gestiona las labores" on public.labores
  for all using (public.is_admin()) with check (public.is_admin());

-- Almacén PRIVADO para las fotos (máximo 10 MB). Cada alumna solo escribe en su carpeta.
insert into storage.buckets (id, name, public, file_size_limit)
values ('labores', 'labores', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = 10485760;

drop policy if exists "Alumna sube su labor" on storage.objects;
create policy "Alumna sube su labor" on storage.objects
  for insert with check (bucket_id = 'labores' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Alumna retira su labor" on storage.objects;
create policy "Alumna retira su labor" on storage.objects
  for delete using (bucket_id = 'labores' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Admin gestiona las fotos de labores" on storage.objects;
create policy "Admin gestiona las fotos de labores" on storage.objects
  for all using (bucket_id = 'labores' and public.is_admin())
  with check (bucket_id = 'labores' and public.is_admin());

-- (Opcional) Los campos del diploma que se crearon antes ya no se usan. Se pueden quitar con:
-- alter table public.cursos drop column if exists certificado_path, drop column if exists cert_nombre,
--   drop column if exists cert_nombre_x, drop column if exists cert_nombre_y,
--   drop column if exists cert_nombre_size, drop column if exists cert_nombre_color;
