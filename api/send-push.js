// Vercel Serverless Function — Enviar notificaciones al móvil de las alumnas
//
// SEGURIDAD
//   · Solo Cristina (es_admin + su email) puede llamar aquí.
//   · La clave privada VAPID vive solo en las variables de entorno de Vercel.
//   · La URL del aviso tiene que ser una ruta de esta misma web, nunca un
//     enlace de fuera: así nadie puede usar los avisos para llevar a las
//     alumnas a una página falsa.
//   · Los dispositivos que ya no existen se borran solos.

const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

const ADMIN_EMAIL = 'cristina@marietavolavola.com';
const TIPOS = ['contenido', 'pagos', 'mensaje'];
const MAX_TITULO = 80;
const MAX_CUERPO = 180;

/** Solo rutas internas: "/portal/curso.html?id=..." */
function rutaSegura(url) {
  if (!url) return '/portal/dashboard.html';
  if (typeof url !== 'string') return '/portal/dashboard.html';
  if (!url.startsWith('/') || url.startsWith('//')) return '/portal/dashboard.html';
  if (url.length > 300) return '/portal/dashboard.html';
  return url;
}

function limpiar(txt, max) {
  return String(txt == null ? '' : txt).replace(/\s+/g, ' ').trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Faltan las claves VAPID en Vercel.' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // ---- 1. Comprobar que quien llama es Cristina ----
  const { data: { user }, error: tokenError } = await supabaseAdmin.auth.getUser(token);
  if (tokenError || !user) return res.status(401).json({ error: 'Token inválido' });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('es_admin').eq('id', user.id).single();

  if (!profile?.es_admin || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }

  // ---- 2. Validar lo que llega ----
  const body = req.body || {};
  const titulo = limpiar(body.titulo, MAX_TITULO);
  const cuerpo = limpiar(body.cuerpo, MAX_CUERPO);
  const url    = rutaSegura(body.url);
  const tipo   = TIPOS.includes(body.tipo) ? body.tipo : 'mensaje';

  if (!titulo || !cuerpo) {
    return res.status(400).json({ error: 'Hace falta un título y un texto.' });
  }

  // ---- 3. ¿A quién va? ----
  const destino = body.destino || { tipo: 'todas' };
  let userIds = null;   // null = todas

  if (destino.tipo === 'curso' && destino.cursoId) {
    const { data: mats } = await supabaseAdmin
      .from('matriculas').select('user_id').eq('curso_id', destino.cursoId);
    userIds = [...new Set((mats || []).map((m) => m.user_id))];
  } else if (destino.tipo === 'alumnas' && Array.isArray(destino.userIds)) {
    userIds = [...new Set(destino.userIds.filter((x) => typeof x === 'string'))].slice(0, 500);
  }

  if (userIds && userIds.length === 0) {
    return res.status(200).json({ enviadas: 0, fallidas: 0, sinDispositivo: 0, aviso: 'No hay nadie en ese grupo.' });
  }

  // ---- 4. Quitar a quien ha dicho que no quiere este tipo de aviso ----
  let prefsQuery = supabaseAdmin.from('notificaciones_prefs').select('user_id, ' + tipoColumna(tipo));
  if (userIds) prefsQuery = prefsQuery.in('user_id', userIds);
  const { data: prefs } = await prefsQuery;

  const apagado = new Set(
    (prefs || []).filter((p) => p[tipoColumna(tipo)] === false).map((p) => p.user_id)
  );

  // ---- 5. Buscar los dispositivos ----
  let subsQuery = supabaseAdmin
    .from('push_suscripciones').select('id, user_id, endpoint, p256dh, auth');
  if (userIds) subsQuery = subsQuery.in('user_id', userIds);
  const { data: subs, error: subsError } = await subsQuery;

  if (subsError) return res.status(500).json({ error: subsError.message });

  const destinatarios = (subs || []).filter((s) => !apagado.has(s.user_id));
  if (!destinatarios.length) {
    return res.status(200).json({ enviadas: 0, fallidas: 0, sinDispositivo: 0, aviso: 'Ninguna alumna de ese grupo tiene las notificaciones activadas.' });
  }

  // ---- 6. Enviar ----
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:' + ADMIN_EMAIL,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  const carga = JSON.stringify({ titulo, cuerpo, url, tipo });
  const caducadas = [];
  let enviadas = 0, fallidas = 0;

  // De 50 en 50 para no saturar la función
  for (let i = 0; i < destinatarios.length; i += 50) {
    const lote = destinatarios.slice(i, i + 50);
    const resultados = await Promise.allSettled(lote.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        carga,
        { TTL: 60 * 60 * 24, urgency: 'normal' }
      )
    ));

    resultados.forEach((r, j) => {
      if (r.status === 'fulfilled') { enviadas++; return; }
      fallidas++;
      const code = r.reason && r.reason.statusCode;
      // 404/410 = ese móvil ya no existe o desinstaló la app
      if (code === 404 || code === 410) caducadas.push(lote[j].id);
    });
  }

  if (caducadas.length) {
    await supabaseAdmin.from('push_suscripciones').delete().in('id', caducadas);
  }

  // ---- 7. Dejar constancia ----
  await supabaseAdmin.from('notificaciones_log').insert({
    titulo, cuerpo, url, tipo,
    destino: limpiar(body.destinoTexto, 80) || 'Todas',
    enviadas, fallidas
  });

  return res.status(200).json({ enviadas, fallidas, limpiadas: caducadas.length });
};

function tipoColumna(tipo) {
  if (tipo === 'contenido') return 'contenido';
  if (tipo === 'pagos') return 'pagos';
  return 'mensajes';
}
