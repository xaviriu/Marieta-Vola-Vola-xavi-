/* ================================================================
   Comunidad Marieta — service worker

   REGLAS DE SEGURIDAD (no tocar a la ligera):
   1. Solo se guarda en caché lo que es público y de esta misma web:
      hojas de estilo, fuentes, el logo y el armazón de las páginas.
   2. NUNCA se guarda nada de Supabase (vídeos, archivos, datos de las
      alumnas, sesiones) ni nada de /api/ ni de /admin/.
   3. Solo peticiones GET. Un POST nunca se cachea ni se reutiliza.
   4. Solo respuestas correctas (200) y del mismo origen.

   El armazón de /portal/ sí se guarda porque son páginas vacías:
   todo el contenido personal lo pide el navegador a Supabase después,
   y eso no pasa por aquí.
   ================================================================ */

const VERSION    = 'mvv-v1';
const SHELL      = 'shell-' + VERSION;
const RUNTIME    = 'runtime-' + VERSION;
const OFFLINE    = '/sin-conexion.html';

// Lo mínimo para que la app abra aunque no haya cobertura
const PRECACHE = [
  OFFLINE,
  '/css/fonts.css',
  '/css/app.css',
  '/css/site.css',
  '/fonts/atkinson-hyperlegible-next.woff2',
  '/fonts/bricolage-grotesque.woff2',
  '/images/app/icon-192.png',
  '/images/web/comunidad-logo.png',
  '/js/supabase-config.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      // addAll falla entero si un archivo falla; los añadimos de uno en uno
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/** ¿Podemos tocar esta petición sin riesgo? */
function esSeguroCachear(request, url) {
  if (request.method !== 'GET') return false;
  if (url.origin !== self.location.origin) return false;          // Supabase, YouTube, CDNs: fuera
  if (url.pathname.startsWith('/api/')) return false;             // funciones del servidor
  if (url.pathname.startsWith('/admin/')) return false;           // panel de Cristina: siempre en directo
  if (url.search.includes('token') || url.hash) return false;     // enlaces de acceso
  if (request.headers.has('authorization')) return false;
  return true;
}

function esRespuestaGuardable(res) {
  return res && res.status === 200 && res.type === 'basic'
    && !(res.headers.get('cache-control') || '').includes('no-store');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (!esSeguroCachear(req, url)) return;   // lo gestiona el navegador, sin pasar por aquí

  // Páginas: primero la red (para que siempre vean lo último),
  // y si no hay conexión, lo último que guardamos.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (esRespuestaGuardable(res)) {
            const copia = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE)))
    );
    return;
  }

  // Estilos, fuentes, imágenes y scripts: se sirve lo guardado al momento
  // y se refresca por detrás para la próxima vez.
  if (['style', 'script', 'font', 'image'].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const red = fetch(req).then((res) => {
          if (esRespuestaGuardable(res)) {
            const copia = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copia));
          }
          return res;
        }).catch(() => hit);
        return hit || red;
      })
    );
  }
});

// Permite que la página pida activar una versión nueva sin esperar
self.addEventListener('message', (event) => {
  if (event.data === 'saltar-espera') self.skipWaiting();
});

/* ================================================================
   Notificaciones al móvil
   El servidor manda el aviso cifrado y aquí solo lo enseñamos.
   Nunca se guarda nada de esto en la caché.
   ================================================================ */
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = {}; }

  const titulo = d.titulo || 'Comunidad Marieta';
  const opciones = {
    body: d.cuerpo || '',
    icon: '/images/app/icon-192.png',
    badge: '/images/app/badge-96.png',
    tag: d.tipo || 'mensaje',          // un aviso del mismo tipo sustituye al anterior
    renotify: true,
    lang: 'es',
    data: { url: d.url || '/portal/dashboard.html' },
    actions: [{ action: 'abrir', title: 'Ver' }]
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) || '/portal/dashboard.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      // Si la app ya está abierta, la traemos al frente en vez de abrir otra
      for (const c of lista) {
        if (c.url.indexOf(self.location.origin) === 0 && 'focus' in c) {
          c.navigate(destino).catch(() => {});
          return c.focus();
        }
      }
      return self.clients.openWindow(destino);
    })
  );
});
