-- ================================================================
-- MARIETA VOLA VOLA — Notificaciones al móvil (Web Push)
--
-- Ejecutar DESPUÉS de schema.sql (necesita la función is_admin()).
-- Crea:
--   1. push_suscripciones   — un móvil o tablet que ha dicho que sí
--   2. notificaciones_prefs — qué avisos quiere recibir cada alumna
--   3. notificaciones_log   — historial de lo enviado
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Los dispositivos suscritos
-- ----------------------------------------------------------------
create table if not exists public.push_suscripciones (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,           -- la dirección que da el navegador
  p256dh      text not null,                  -- clave pública del dispositivo
  auth        text not null,                  -- secreto del dispositivo
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

create index if not exists push_suscripciones_user_idx
  on public.push_suscripciones (user_id);

alter table public.push_suscripciones enable row level security;

-- Cada alumna solo ve y gestiona SUS dispositivos.
-- (El servidor envía con la clave service_role, que se salta RLS.)
drop policy if exists "Alumna gestiona sus dispositivos" on public.push_suscripciones;
create policy "Alumna gestiona sus dispositivos" on public.push_suscripciones
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Admin ve los dispositivos" on public.push_suscripciones;
create policy "Admin ve los dispositivos" on public.push_suscripciones
  for select using (public.is_admin());

-- ----------------------------------------------------------------
-- 2. Qué avisos quiere cada alumna
-- ----------------------------------------------------------------
create table if not exists public.notificaciones_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  contenido  boolean not null default true,   -- vídeo o archivo nuevo
  pagos      boolean not null default true,   -- recordatorio de cuota
  mensajes   boolean not null default true,   -- avisos sueltos de Cristina
  updated_at timestamptz not null default now()
);

alter table public.notificaciones_prefs enable row level security;

drop policy if exists "Alumna gestiona sus avisos" on public.notificaciones_prefs;
create policy "Alumna gestiona sus avisos" on public.notificaciones_prefs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Admin ve los avisos" on public.notificaciones_prefs;
create policy "Admin ve los avisos" on public.notificaciones_prefs
  for select using (public.is_admin());

-- ----------------------------------------------------------------
-- 3. Historial de lo enviado (para que Cristina vea qué mandó)
-- ----------------------------------------------------------------
create table if not exists public.notificaciones_log (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  cuerpo      text not null,
  url         text,
  tipo        text not null default 'mensaje',  -- contenido | pagos | mensaje
  destino     text not null default 'todas',    -- texto legible: "Todas", "Anuario Bordado"...
  enviadas    integer not null default 0,
  fallidas    integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.notificaciones_log enable row level security;

drop policy if exists "Admin lee el historial" on public.notificaciones_log;
create policy "Admin lee el historial" on public.notificaciones_log
  for select using (public.is_admin());

-- Nadie escribe aquí desde el navegador: solo el servidor (service_role).

-- ================================================================
-- DESPUÉS DE EJECUTAR ESTO, EN VERCEL:
--   VAPID_PUBLIC_KEY   = (la que está en js/push-config.js)
--   VAPID_PRIVATE_KEY  = (la secreta, nunca en el código)
--   VAPID_SUBJECT      = mailto:cristina@marietavolavola.com
-- ================================================================
