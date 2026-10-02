-- ============================================================
-- MARIETA VOLA VOLA — Schema de base de datos
-- Copia y pega esto en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLA: perfiles de usuario
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  nombre      text,
  es_admin    boolean default false,
  created_at  timestamptz default now()
);

-- 2. TABLA: cursos
create table if not exists public.cursos (
  id           uuid default gen_random_uuid() primary key,
  nombre       text not null,
  descripcion  text,
  imagen_url   text,
  created_at   timestamptz default now()
);

-- 3. TABLA: videos de cada curso
create table if not exists public.videos (
  id           uuid default gen_random_uuid() primary key,
  curso_id     uuid references public.cursos(id) on delete cascade not null,
  titulo       text not null,
  descripcion  text,
  youtube_url  text not null,
  orden        integer default 0,
  created_at   timestamptz default now()
);

-- 4. TABLA: matrículas (qué alumno accede a qué curso)
create table if not exists public.matriculas (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  curso_id    uuid references public.cursos(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, curso_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles   enable row level security;
alter table public.cursos     enable row level security;
alter table public.videos     enable row level security;
alter table public.matriculas enable row level security;

-- PROFILES --------------------------------------------------

create policy "Usuarios ven su propio perfil" on public.profiles
  for select using (id = auth.uid());

-- Función auxiliar (security definer) para evitar recursión infinita de RLS en profiles
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select es_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "Admins ven todos los perfiles" on public.profiles
  for select using (public.is_admin());

-- CURSOS ----------------------------------------------------

create policy "Alumnos ven cursos en los que están matriculados" on public.cursos
  for select using (
    exists (
      select 1 from public.matriculas m
      where m.curso_id = cursos.id and m.user_id = auth.uid()
    )
  );

create policy "Admins ven todos los cursos" on public.cursos
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

create policy "Admins crean cursos" on public.cursos
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

create policy "Admins actualizan cursos" on public.cursos
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

create policy "Admins eliminan cursos" on public.cursos
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

-- VIDEOS ----------------------------------------------------

create policy "Alumnos ven videos de cursos matriculados" on public.videos
  for select using (
    exists (
      select 1 from public.matriculas m
      where m.curso_id = videos.curso_id and m.user_id = auth.uid()
    )
  );

create policy "Admins ven todos los videos" on public.videos
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

create policy "Admins crean videos" on public.videos
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

create policy "Admins actualizan videos" on public.videos
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

create policy "Admins eliminan videos" on public.videos
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

-- MATRÍCULAS ------------------------------------------------

create policy "Alumnos ven sus propias matrículas" on public.matriculas
  for select using (user_id = auth.uid());

create policy "Admins gestionan todas las matrículas" on public.matriculas
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
  );

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al crear usuario
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DATOS INICIALES: los 3 cursos del sitio
-- ============================================================

insert into public.cursos (nombre, descripcion) values
  (
    'Bordado Floral para Principiantes',
    'Aprende los puntos esenciales del bordado bordando un ramo de flores silvestres. El punto de partida perfecto.'
  ),
  (
    'Bastidor Decorativo',
    'Crea un cuadro de bordado en bastidor con diseños botánicos y geométricos para decorar tu hogar.'
  ),
  (
    'Sashiko: Bordado Japonés',
    'El arte del bordado geométrico japonés sobre tela índigo. Una técnica meditativa e hipnótica.'
  );

-- ============================================================
-- PASO FINAL: crear la cuenta admin de Marieta
-- (Ejecutar DESPUÉS de crear la cuenta desde Authentication > Users)
-- Sustituye 'ID_DE_USUARIO_MARIETA' por el UUID real de su cuenta
-- ============================================================

-- update public.profiles set es_admin = true where id = 'ID_DE_USUARIO_MARIETA';
