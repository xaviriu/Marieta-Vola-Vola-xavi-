/* ================================================================
   Comunidad Marieta — activar las notificaciones en el móvil

   Lo que hace:
     · Pide permiso SOLO cuando la alumna pulsa un botón (los móviles
       lo exigen, y además es lo correcto: nadie quiere que le salte
       un permiso de la nada).
     · Guarda el dispositivo en Supabase, en su propia fila. Las
       reglas de la base de datos impiden que una alumna vea o borre
       los dispositivos de otra.
     · Al cerrar sesión, borra el dispositivo de esa alumna.

   Necesita: js/push-config.js y js/pwa.js cargados antes.
   ================================================================ */
(function () {
  'use strict';

  const PREFS_DEFECTO = { contenido: true, pagos: true, mensajes: true };

  function soportado() {
    return 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window;
  }

  /** En iPhone las notificaciones SOLO existen si la app está instalada */
  function esIosSinInstalar() {
    const ua = navigator.userAgent || '';
    const esIos = /iPad|iPhone|iPod/.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return esIos && !(window.mvvEsApp && window.mvvEsApp());
  }

  function estado() {
    if (!soportado())        return 'no-soportado';
    if (esIosSinInstalar())  return 'instalar-primero';
    if (Notification.permission === 'denied')  return 'bloqueado';
    if (Notification.permission === 'granted') return 'concedido';
    return 'sin-pedir';
  }

  function base64UrlABytes(base64) {
    const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
    const limpio  = (base64 + relleno).replace(/-/g, '+').replace(/_/g, '/');
    const crudo   = window.atob(limpio);
    const bytes   = new Uint8Array(crudo.length);
    for (let i = 0; i < crudo.length; i++) bytes[i] = crudo.charCodeAt(i);
    return bytes;
  }

  /** Activa las notificaciones. Devuelve 'ok' o el motivo del fallo. */
  async function activar() {
    if (!soportado()) return 'no-soportado';
    if (esIosSinInstalar()) return 'instalar-primero';

    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') return permiso === 'denied' ? 'bloqueado' : 'sin-pedir';

    const reg = await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,     // obligatorio: nada de avisos invisibles
        applicationServerKey: base64UrlABytes(window.MVV_VAPID_PUBLIC_KEY)
      });
    }

    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) return 'sin-sesion';

    const json = sub.toJSON();
    const { error } = await window.supabase.from('push_suscripciones').upsert({
      user_id:    user.id,
      endpoint:   json.endpoint,
      p256dh:     json.keys.p256dh,
      auth:       json.keys.auth,
      user_agent: (navigator.userAgent || '').slice(0, 300),
      last_seen:  new Date().toISOString()
    }, { onConflict: 'endpoint' });

    if (error) return 'error';

    // Crear sus preferencias si aún no las tiene
    await window.supabase.from('notificaciones_prefs')
      .upsert({ user_id: user.id, ...PREFS_DEFECTO }, { onConflict: 'user_id', ignoreDuplicates: true });

    return 'ok';
  }

  /** Desactiva las notificaciones en ESTE dispositivo */
  async function desactivar() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await window.supabase.from('push_suscripciones').delete().eq('endpoint', endpoint);
      }
      return 'ok';
    } catch (e) { return 'error'; }
  }

  /** ¿Está este dispositivo suscrito ahora mismo? */
  async function activas() {
    if (estado() !== 'concedido') return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      return !!(await reg.pushManager.getSubscription());
    } catch (e) { return false; }
  }

  async function leerPrefs() {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) return PREFS_DEFECTO;
    const { data } = await window.supabase
      .from('notificaciones_prefs')
      .select('contenido, pagos, mensajes')
      .eq('user_id', user.id).maybeSingle();
    return data || PREFS_DEFECTO;
  }

  async function guardarPrefs(prefs) {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) return false;
    const { error } = await window.supabase.from('notificaciones_prefs').upsert({
      user_id: user.id,
      contenido: !!prefs.contenido,
      pagos:     !!prefs.pagos,
      mensajes:  !!prefs.mensajes,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    return !error;
  }

  window.mvvPush = { estado, activar, desactivar, activas, leerPrefs, guardarPrefs, soportado };
})();
