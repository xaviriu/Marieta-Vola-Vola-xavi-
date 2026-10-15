-- ============================================================
-- MARIETA VOLA VOLA — Quién puede ver cada sección de un curso
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
--
-- Para qué sirve: dentro de un curso (por ejemplo "Anuario bordado") cada
-- sección puede ser de acceso libre para todas las matriculadas, o estar
-- reservada a las alumnas que Cristina elija. Así María puede ver julio y
-- agosto pero no enero, aunque las tres secciones estén en el mismo curso.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Cada bloque guarda a qué sección pertenece
--    Hasta ahora se deducía por el orden de la lista. Eso vale para pintar la
--    página, pero no para proteger el contenido: hace falta guardarlo de verdad.
-- ------------------------------------------------------------
alter table public.curso_bloques
  add column if not exists seccion_id uuid references public.curso_bloques(id) on delete set null;

-- Marca si la sección está reservada. false = la ven todas las matriculadas.
alter table public.curso_bloques
  add column if not exists restringida boolean not null default false;

create index if not exists curso_bloques_seccion on public.curso_bloques (seccion_id);

-- ------------------------------------------------------------
-- 2. Rellenar seccion_id en el contenido que ya existe
--    Cada bloque se queda con la última sección que tiene por encima.
-- ------------------------------------------------------------
with marcado as (
  select id, curso_id, tipo,
         count(*) filter (where tipo = 'seccion') over (
           partition by curso_id
           order by orden, created_at
           rows between unbounded preceding and current row
         ) as grupo
  from public.curso_bloques
),
cabeceras as (
  select curso_id, grupo, id as sec_id
  from marcado
  where tipo = 'seccion'
)
update public.curso_bloques b
set seccion_id = c.sec_id
from marcado m
join cabeceras c on c.curso_id = m.curso_id and c.grupo = m.grupo
where b.id = m.id
  and m.tipo <> 'seccion'
  and m.grupo > 0
  and b.seccion_id is null;

-- ------------------------------------------------------------
-- 3. Tabla con los permisos: qué alumna entra a qué sección reservada
-- ------------------------------------------------------------
create table if not exists public.seccion_accesos (
  seccion_id  uuid references public.curso_bloques(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now(),
  primary key (seccion_id, user_id)
);

create index if not exists seccion_accesos_user on public.seccion_accesos (user_id);

alter table public.seccion_accesos enable row level security;

drop policy if exists "Admin gestiona los accesos" on public.seccion_accesos;
create policy "Admin gestiona los accesos" on public.seccion_accesos
  for all using (public.is_admin()) with check (public.is_admin());

-- Cada alumna puede comprobar a qué secciones entra (lo usa su página de curso
-- para saber si pintar el candado). Solo ve las suyas, nunca las de otras.
drop policy if exists "Cada alumna ve sus propios accesos" on public.seccion_accesos;
create policy "Cada alumna ve sus propios accesos" on public.seccion_accesos
  for select using (user_id = auth.uid());

-- ------------------------------------------------------------
-- 4. La función que decide si quien pregunta puede ver una sección
--    Es SECURITY DEFINER a propósito: la consulta necesita mirar curso_bloques
--    desde dentro de una regla sobre curso_bloques, y si no se bloquearía a sí misma.
-- ------------------------------------------------------------
create or replace function public.puede_ver_seccion(sec uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select case
    -- Contenido suelto, fuera de cualquier sección: lo ven todas
    when sec is null then true
    -- Sección de acceso libre
    when not exists (
      select 1 from public.curso_bloques s where s.id = sec and s.restringida
    ) then true
    -- Sección reservada: solo si tiene permiso
    else exists (
      select 1 from public.seccion_accesos a
      where a.seccion_id = sec and a.user_id = auth.uid()
    )
  end;
$$;

-- ------------------------------------------------------------
-- 5. Nueva regla de lectura de los bloques
--    Los títulos de sección los ven todas las matriculadas (así aparece el
--    candado). El contenido de dentro solo quien tenga permiso.
-- ------------------------------------------------------------
drop policy if exists "Alumnas ven los bloques visibles de sus cursos" on public.curso_bloques;
create policy "Alumnas ven los bloques visibles de sus cursos" on public.curso_bloques
  for select using (
    visible = true
    and exists (
      select 1 from public.matriculas m
      where m.curso_id = curso_bloques.curso_id and m.user_id = auth.uid()
    )
    and (tipo = 'seccion' or public.puede_ver_seccion(seccion_id))
  );

-- ------------------------------------------------------------
-- 6. Los archivos de una sección reservada tampoco se descargan
--    Sin esto, el contenido estaría escondido en la página pero el archivo
--    seguiría siendo accesible a quien supiera su dirección.
--
--    Esta función también es SECURITY DEFINER, y aquí es imprescindible:
--    la regla necesita buscar el bloque que dice que el archivo es reservado,
--    pero ese bloque es precisamente uno que la alumna no puede ver. Si la
--    búsqueda se hiciera con sus permisos no encontraría nada y daría el
--    archivo por libre. Consultando por encima de las reglas, sí lo encuentra.
-- ------------------------------------------------------------
create or replace function public.puede_descargar_archivo(ruta text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select not exists (
    select 1 from public.curso_bloques b
    where b.archivo_path = ruta
      and not public.puede_ver_seccion(b.seccion_id)
  );
$$;

drop policy if exists "Alumnas descargan archivos de sus cursos" on storage.objects;
create policy "Alumnas descargan archivos de sus cursos" on storage.objects
  for select using (
    bucket_id = 'curso-archivos'
    and exists (
      select 1 from public.matriculas m
      where m.user_id = auth.uid()
        and m.curso_id::text = (storage.foldername(name))[1]
    )
    and public.puede_descargar_archivo(name)
  );
