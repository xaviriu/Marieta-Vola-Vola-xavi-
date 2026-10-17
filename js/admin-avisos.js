/* ================================================================
   Panel de Avisos del admin — mandar notificaciones a las alumnas

   El navegador NUNCA envía las notificaciones directamente: solo
   llama a /api/send-push con la sesión de Cristina, y el servidor
   comprueba otra vez que es ella antes de mandar nada.
   ================================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const PLANTILLAS = {
    mensaje: { titulo: '', cuerpo: '', url: '/portal/dashboard.html' },
    pagos: {
      titulo: 'Recordatorio de la cuota',
      cuerpo: 'Te recuerdo que toca la cuota de este mes. ¡Gracias!',
      url: '/portal/dashboard.html'
    },
    contenido: {
      titulo: 'Hay algo nuevo en tu curso',
      cuerpo: 'He subido material nuevo. Entra a verlo cuando quieras.',
      url: '/portal/dashboard.html'
    }
  };

  function estado(txt, error) {
    const el = $('avEstado');
    if (!el) return;
    el.textContent = txt;
    el.className = 'alert ' + (error ? 'alert--error' : 'alert--success') + (txt ? ' visible' : '');
  }

  async function cargarCursos() {
    const sel = $('avCurso');
    if (!sel) return;
    const { data } = await window.supabase.from('cursos').select('id, nombre').order('nombre');
    sel.innerHTML = (data || []).map((c) =>
      `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join('');
    if (!data || !data.length) sel.innerHTML = '<option value="">No hay cursos</option>';
  }

  async function cargarHistorial() {
    const el = $('avHistorial');
    if (!el) return;
    const { data, error } = await window.supabase
      .from('notificaciones_log')
      .select('titulo, cuerpo, destino, enviadas, fallidas, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) {
      el.innerHTML = '<p style="color:var(--texto-suave)">Aún no hay historial. ¿Has ejecutado <strong>supabase/notificaciones.sql</strong>?</p>';
      return;
    }
    if (!data || !data.length) {
      el.innerHTML = '<p style="color:var(--texto-suave)">Todavía no has mandado ningún aviso.</p>';
      return;
    }

    el.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Cuándo</th><th>Aviso</th><th>A quién</th><th>Llegó a</th></tr></thead>
          <tbody>${data.map((n) => `
            <tr>
              <td style="white-space:nowrap">${esc(new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</td>
              <td><strong>${esc(n.titulo)}</strong><br><span style="color:var(--texto-suave)">${esc(n.cuerpo)}</span></td>
              <td>${esc(n.destino)}</td>
              <td style="white-space:nowrap">${n.enviadas} móvil${n.enviadas === 1 ? '' : 'es'}${n.fallidas ? ` <span style="color:var(--t321-deep)">(${n.fallidas} fallaron)</span>` : ''}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  async function cuantasPuedenRecibir() {
    const el = $('avCuantas');
    if (!el) return;
    const { count, error } = await window.supabase
      .from('push_suscripciones')
      .select('id', { count: 'exact', head: true });
    el.textContent = error
      ? 'Falta ejecutar supabase/notificaciones.sql en Supabase.'
      : (count === 0
        ? 'Ninguna alumna ha activado los avisos todavía.'
        : `${count} dispositivo${count === 1 ? '' : 's'} recibirán el aviso.`);
  }

  function aplicarPlantilla() {
    const tipo = $('avTipo').value;
    const p = PLANTILLAS[tipo] || PLANTILLAS.mensaje;
    if (!$('avTitulo').value.trim()) $('avTitulo').value = p.titulo;
    if (!$('avCuerpo').value.trim()) $('avCuerpo').value = p.cuerpo;
  }

  function pintarDestino() {
    $('avCursoWrap').hidden = $('avDestino').value !== 'curso';
  }

  async function enviar() {
    const btn = $('avEnviar');
    const titulo = $('avTitulo').value.trim();
    const cuerpo = $('avCuerpo').value.trim();

    if (!titulo || !cuerpo) return estado('Escribe un título y un texto.', true);

    const destinoTipo = $('avDestino').value;
    const destino = destinoTipo === 'curso'
      ? { tipo: 'curso', cursoId: $('avCurso').value }
      : { tipo: 'todas' };
    const destinoTexto = destinoTipo === 'curso'
      ? ($('avCurso').options[$('avCurso').selectedIndex] || {}).text || 'Un curso'
      : 'Todas las alumnas';

    if (!confirm(`¿Mando este aviso a ${destinoTexto.toLowerCase()}?\n\n${titulo}\n${cuerpo}`)) return;

    btn.disabled = true; btn.textContent = 'Enviando...';
    estado('');

    try {
      const { data: { session } } = await window.supabase.auth.getSession();
      if (!session) throw new Error('Vuelve a iniciar sesión.');

      const r = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({
          titulo, cuerpo,
          url: $('avUrl').value.trim() || '/portal/dashboard.html',
          tipo: $('avTipo').value,
          destino, destinoTexto
        })
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'No se ha podido enviar.');

      estado(j.aviso
        ? j.aviso
        : `Enviado a ${j.enviadas} dispositivo${j.enviadas === 1 ? '' : 's'}.${j.fallidas ? ' ' + j.fallidas + ' no llegaron.' : ''}`);

      $('avTitulo').value = '';
      $('avCuerpo').value = '';
      cargarHistorial();
      cuantasPuedenRecibir();
    } catch (e) {
      estado('Error: ' + e.message, true);
    }

    btn.disabled = false; btn.textContent = 'Enviar el aviso';
  }

  window.loadAvisos = function () {
    cargarCursos();
    cargarHistorial();
    cuantasPuedenRecibir();
    pintarDestino();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('avEnviar')) return;
    $('avEnviar').addEventListener('click', enviar);
    $('avDestino').addEventListener('change', pintarDestino);
    $('avTipo').addEventListener('change', aplicarPlantilla);
  });
})();
