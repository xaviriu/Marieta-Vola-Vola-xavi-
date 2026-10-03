-- ============================================================
-- MARIETA VOLA VOLA — Contenido de los cursos en bloques
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- ============================================================

-- 1. Función que dice si quien pregunta es Cristina (admin y con su email)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select es_admin from public.profiles where id = auth.uid()), false)
     and lower(coalesce(auth.jwt() ->> 'email', '')) = 'cristina@marietavolavola.com';
$$;

-- 2. Tabla de bloques: cada curso es una lista ordenada de secciones, textos, vídeos, archivos y enlaces
create table if not exists public.curso_bloques (
  id              uuid default gen_random_uuid() primary key,
  curso_id        uuid references public.cursos(id) on delete cascade not null,
  tipo            text not null check (tipo in ('seccion', 'texto', 'video', 'archivo', 'enlace')),
  titulo          text,
  contenido       text,
  url             text,
  archivo_path    text,
  archivo_nombre  text,
  orden           integer not null default 0,
  visible         boolean not null default true,
  created_at      timestamptz default now()
);

create index if not exists curso_bloques_curso_orden on public.curso_bloques (curso_id, orden);

alter table public.curso_bloques enable row level security;

drop policy if exists "Admin gestiona los bloques" on public.curso_bloques;
create policy "Admin gestiona los bloques" on public.curso_bloques
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Alumnas ven los bloques visibles de sus cursos" on public.curso_bloques;
create policy "Alumnas ven los bloques visibles de sus cursos" on public.curso_bloques
  for select using (
    visible = true
    and exists (
      select 1 from public.matriculas m
      where m.curso_id = curso_bloques.curso_id and m.user_id = auth.uid()
    )
  );

-- 3. Almacén PRIVADO para los archivos descargables (PDF, imágenes, zip...). Máximo 50 MB por archivo.
insert into storage.buckets (id, name, public, file_size_limit)
values ('curso-archivos', 'curso-archivos', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "Admin gestiona archivos de cursos" on storage.objects;
create policy "Admin gestiona archivos de cursos" on storage.objects
  for all using (bucket_id = 'curso-archivos' and public.is_admin())
  with check (bucket_id = 'curso-archivos' and public.is_admin());

-- La primera carpeta de cada archivo es el id del curso: solo las alumnas matriculadas en él pueden descargarlo
drop policy if exists "Alumnas descargan archivos de sus cursos" on storage.objects;
create policy "Alumnas descargan archivos de sus cursos" on storage.objects
  for select using (
    bucket_id = 'curso-archivos'
    and exists (
      select 1 from public.matriculas m
      where m.user_id = auth.uid()
        and m.curso_id::text = (storage.foldername(name))[1]
    )
  );

-- ============================================================
-- 4. (OPCIONAL, ejecutar UNA sola vez) Pasar los vídeos y materiales que ya había a bloques.
--    Solo copia en los cursos que todavía no tienen bloques.
-- ============================================================
insert into public.curso_bloques (curso_id, tipo, titulo, contenido, url, orden)
select v.curso_id, 'video', v.titulo, v.descripcion, v.youtube_url,
       row_number() over (partition by v.curso_id order by v.orden, v.created_at)
from public.videos v
where not exists (select 1 from public.curso_bloques b where b.curso_id = v.curso_id);

do $$
begin
  if to_regclass('public.materiales') is not null then
    insert into public.curso_bloques (curso_id, tipo, titulo, url, archivo_nombre, orden)
    select m.curso_id, 'archivo', m.nombre, m.archivo_url, m.nombre,
           1000 + row_number() over (partition by m.curso_id order by m.created_at)
    from public.materiales m
    where not exists (
      select 1 from public.curso_bloques b where b.curso_id = m.curso_id and b.tipo = 'archivo'
    );
  end if;
end $$;
