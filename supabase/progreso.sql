-- ============================================================
-- MARIETA VOLA VOLA — Progreso de las alumnas (marcar como hecho)
-- Pega TODO esto en Supabase > SQL Editor y pulsa Run (se puede repetir sin problema).
-- ============================================================

-- Qué vídeos, archivos y enlaces ha marcado como hechos cada alumna
create table if not exists public.progreso_bloques (
  user_id       uuid references auth.users(id) on delete cascade not null,
  bloque_id     uuid references public.curso_bloques(id) on delete cascade not null,
  completado_at timestamptz default now(),
  primary key (user_id, bloque_id)
);

-- Qué cursos ha marcado como terminados cada alumna
create table if not exists public.progreso_cursos (
  user_id       uuid references auth.users(id) on delete cascade not null,
  curso_id      uuid references public.cursos(id) on delete cascade not null,
  completado_at timestamptz default now(),
  primary key (user_id, curso_id)
);

alter table public.progreso_bloques enable row level security;
alter table public.progreso_cursos  enable row level security;

-- Cada alumna solo ve y cambia su propio progreso
drop policy if exists "Progreso propio de bloques" on public.progreso_bloques;
create policy "Progreso propio de bloques" on public.progreso_bloques
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Progreso propio de cursos" on public.progreso_cursos;
create policy "Progreso propio de cursos" on public.progreso_cursos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
