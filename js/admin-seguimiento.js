// Panel "Seguimiento" del admin: cómo van las alumnas y cada curso.
// Solo lectura. Usa las tablas de progreso y la función admin_accesos() de supabase/extras_alumnas.sql.
(function () {
  var DAY = 86400000;
  var COMPLETABLE = ['video', 'archivo', 'enlace'];
  var cache = null;      // datos ya calculados
  var view = 'alumnas';  // 'alumnas' | 'cursos'

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function ago(iso) {
    if (!iso) return null;
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
    if (d <= 0) return 'hoy';
    if (d === 1) return 'ayer';
    if (d < 14) return 'hace ' + d + ' días';
    if (d < 60) return 'hace ' + Math.floor(d / 7) + ' semanas';
    return 'hace ' + Math.floor(d / 30) + ' meses';
  }
  function daysSince(iso) { return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : null; }

  // Supabase devuelve como máximo 1000 filas por consulta: se pide por páginas
  async function fetchAll(table, select) {
    var rows = [], from = 0, size = 1000;
    for (;;) {
      var r = await supabase.from(table).select(select).range(from, from + size - 1);
      if (r.error) throw r.error;
      rows = rows.concat(r.data || []);
      if (!r.data || r.data.length < size) break;
      from += size;
    }
    return rows;
  }

  async function load() {
    var box = $('segBody');
    box.innerHTML = '<div class="loading"><div class="spinner"></div>Calculando...</div>';
    try {
      var res = await Promise.all([
        fetchAll('profiles', 'id, nombre, created_at, es_admin'),
        fetchAll('matriculas', 'user_id, curso_id'),
        fetchAll('cursos', 'id, nombre'),
        fetchAll('curso_bloques', 'id, curso_id, tipo, titulo, orden, visible'),
        fetchAll('progreso_bloques', 'user_id, bloque_id, completado_at'),
        fetchAll('progreso_cursos', 'user_id, curso_id'),
        supabase.rpc('admin_accesos')
      ]);
      if (res[6].error) throw res[6].error;
      cache = build(res[0], res[1], res[2], res[3], res[4], res[5], res[6].data || []);
      render();
    } catch (err) {
      box.innerHTML = '<div class="alert alert--error visible">No se ha podido cargar el seguimiento: ' + esc(err.message || err) +
        '<br>¿Has ejecutado el archivo supabase/extras_alumnas.sql en Supabase?</div>';
    }
  }

  function build(profiles, matriculas, cursos, bloques, hechos, terminados, accesos) {
    var accMap = {}; accesos.forEach(function (a) { accMap[a.user_id] = a; });
    var cursoMap = {}; cursos.forEach(function (c) { cursoMap[c.id] = c; });
    var comp = bloques.filter(function (b) { return b.visible && COMPLETABLE.indexOf(b.tipo) >= 0; });
    var porCurso = {}; comp.forEach(function (b) { (porCurso[b.curso_id] = porCurso[b.curso_id] || []).push(b); });
    Object.keys(porCurso).forEach(function (k) { porCurso[k].sort(function (a, b) { return a.orden - b.orden; }); });
    var bloqueCurso = {}; comp.forEach(function (b) { bloqueCurso[b.id] = b.curso_id; });

    var hechosUser = {};   // user -> curso -> {n, last}
    var hechosBloque = {}; // bloque -> n
    hechos.forEach(function (h) {
      var cid = bloqueCurso[h.bloque_id]; if (!cid) return;
      var u = (hechosUser[h.user_id] = hechosUser[h.user_id] || {});
      var e = (u[cid] = u[cid] || { n: 0, last: null });
      e.n++; if (!e.last || h.completado_at > e.last) e.last = h.completado_at;
      hechosBloque[h.bloque_id] = (hechosBloque[h.bloque_id] || 0) + 1;
    });
    var finSet = {}; terminados.forEach(function (t) { finSet[t.user_id + '|' + t.curso_id] = true; });

    var matPorUser = {}; matriculas.forEach(function (m) { (matPorUser[m.user_id] = matPorUser[m.user_id] || []).push(m.curso_id); });

    var alumnas = profiles.filter(function (p) { return !p.es_admin; }).map(function (p) {
      var acc = accMap[p.id] || {};
      var ult = acc.ultimo_acceso || null;
      var cs = (matPorUser[p.id] || []).filter(function (cid) { return cursoMap[cid]; }).map(function (cid) {
        var total = (porCurso[cid] || []).length;
        var e = (hechosUser[p.id] || {})[cid] || { n: 0, last: null };
        return { id: cid, nombre: cursoMap[cid].nombre, total: total, n: e.n, last: e.last, fin: !!finSet[p.id + '|' + cid] };
      });
      var d = daysSince(ult);
      var pendiente = cs.some(function (c) { return !c.fin && c.total > 0 && c.n < c.total; });
      var ayuda = pendiente && (d === null || d >= 14);
      return { id: p.id, nombre: p.nombre || acc.email || 'Sin nombre', email: acc.email || '', ultimo: ult, dias: d, cursos: cs, ayuda: ayuda, creada: p.created_at };
    });

    var cursosStats = cursos.map(function (c) {
      var bl = porCurso[c.id] || [];
      var matr = alumnas.filter(function (a) { return a.cursos.some(function (x) { return x.id === c.id; }); });
      var pcts = matr.map(function (a) { var x = a.cursos.find(function (y) { return y.id === c.id; }); return x.fin ? 100 : (x.total ? x.n / x.total * 100 : 0); });
      var media = pcts.length ? Math.round(pcts.reduce(function (s, v) { return s + v; }, 0) / pcts.length) : 0;
      return {
        id: c.id, nombre: c.nombre, alumnas: matr.length, media: media,
        terminados: matr.filter(function (a) { return a.cursos.find(function (y) { return y.id === c.id; }).fin; }).length,
        bloques: bl.map(function (b) { return { titulo: b.titulo || 'Sin título', tipo: b.tipo, n: hechosBloque[b.id] || 0 }; })
      };
    });
    return { alumnas: alumnas, cursos: cursosStats };
  }

  function bar(pct) { return '<div class="seg-bar"><span style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></div>'; }

  function accesoBadge(a) {
    if (a.dias === null) return '<span class="seg-pill seg-pill--red">Nunca ha entrado</span>';
    var cls = a.dias <= 7 ? 'green' : (a.dias < 14 ? 'amber' : 'red');
    return '<span class="seg-pill seg-pill--' + cls + '">Último acceso: ' + ago(a.ultimo) + '</span>';
  }

  function renderAlumnas() {
    var q = ($('segSearch').value || '').toLowerCase();
    var cf = $('segCurso').value;
    var soloAyuda = $('segAyuda').checked;
    var list = cache.alumnas.filter(function (a) {
      if (q && (a.nombre + ' ' + a.email).toLowerCase().indexOf(q) < 0) return false;
      if (cf && !a.cursos.some(function (c) { return c.id === cf; })) return false;
      if (soloAyuda && !a.ayuda) return false;
      return true;
    }).sort(function (a, b) {
      if (a.ayuda !== b.ayuda) return a.ayuda ? -1 : 1;
      return (a.ultimo || '') < (b.ultimo || '') ? -1 : 1;
    });
    if (!list.length) return '<p class="seg-empty">No hay alumnas con estos filtros.</p>';
    return '<div class="seg-list">' + list.map(function (a) {
      var cs = a.cursos.filter(function (c) { return !cf || c.id === cf; });
      return '<article class="seg-card' + (a.ayuda ? ' is-help' : '') + '">' +
        '<header class="seg-card__head"><div><h3>' + esc(a.nombre) + '</h3>' +
        (a.email ? '<a class="seg-mail" href="mailto:' + esc(a.email) + '">' + esc(a.email) + '</a>' : '') + '</div>' +
        '<div class="seg-card__tags">' + (a.ayuda ? '<span class="seg-pill seg-pill--red">Conviene escribirle</span>' : '') + accesoBadge(a) + '</div></header>' +
        (cs.length ? cs.map(function (c) {
          var pct = c.fin ? 100 : (c.total ? Math.round(c.n / c.total * 100) : 0);
          return '<div class="seg-course"><div class="seg-course__top"><strong>' + esc(c.nombre) + '</strong><span>' +
            (c.fin ? 'Terminado' : (c.total ? c.n + ' de ' + c.total + ' (' + pct + '%)' : 'Sin contenido aún')) + '</span></div>' + bar(pct) +
            '<small>' + (c.last ? 'Última actividad: ' + ago(c.last) : 'Aún no ha marcado nada como hecho') + '</small></div>';
        }).join('') : '<p class="seg-empty" style="padding:8px 0">No tiene cursos asignados.</p>') +
        '</article>';
    }).join('') + '</div>';
  }

  function renderCursos() {
    if (!cache.cursos.length) return '<p class="seg-empty">Aún no hay cursos.</p>';
    return '<div class="seg-list">' + cache.cursos.map(function (c) {
      var max = Math.max(1, c.alumnas);
      return '<article class="seg-card"><header class="seg-card__head"><div><h3>' + esc(c.nombre) + '</h3>' +
        '<span class="seg-sub">' + c.alumnas + (c.alumnas === 1 ? ' alumna' : ' alumnas') + ' · ' + c.terminados + ' lo han terminado</span></div>' +
        '<a class="btn btn-sm btn--primary" href="curso.html?id=' + encodeURIComponent(c.id) + '">Editar contenido</a></header>' +
        '<div class="seg-course"><div class="seg-course__top"><strong>Progreso medio</strong><span>' + c.media + '%</span></div>' + bar(c.media) + '</div>' +
        (c.bloques.length ? '<h4 class="seg-h4">Cuántas lo han hecho en cada contenido</h4>' + c.bloques.map(function (b) {
          var pct = Math.round(b.n / max * 100);
          return '<div class="seg-course"><div class="seg-course__top"><span>' + esc(b.titulo) + '</span><span>' + b.n + ' de ' + c.alumnas + '</span></div>' + bar(pct) + '</div>';
        }).join('') : '<p class="seg-empty" style="padding:8px 0">Este curso aún no tiene vídeos, archivos ni enlaces.</p>') +
        '</article>';
    }).join('') + '</div>';
  }

  function render() {
    if (!cache) return;
    var al = cache.alumnas;
    var activas = al.filter(function (a) { return a.dias !== null && a.dias <= 7; }).length;
    var inactivas = al.filter(function (a) { return a.dias === null || a.dias >= 14; }).length;
    var fin = al.reduce(function (s, a) { return s + a.cursos.filter(function (c) { return c.fin; }).length; }, 0);
    var ayuda = al.filter(function (a) { return a.ayuda; }).length;
    var curSel = $('segCurso') ? $('segCurso').value : '';
    $('segBody').innerHTML =
      '<div class="admin-stats seg-stats">' +
      '<div class="stat-card"><div class="stat-card__number">' + al.length + '</div><div class="stat-card__label">Alumnas</div></div>' +
      '<div class="stat-card"><div class="stat-card__number">' + activas + '</div><div class="stat-card__label">Entraron esta semana</div></div>' +
      '<div class="stat-card"><div class="stat-card__number">' + inactivas + '</div><div class="stat-card__label">Llevan 14+ días sin entrar</div></div>' +
      '<div class="stat-card"><div class="stat-card__number">' + fin + '</div><div class="stat-card__label">Cursos terminados</div></div></div>' +
      '<div class="seg-tabs" role="tablist"><button type="button" role="tab" class="seg-tab' + (view === 'alumnas' ? ' active' : '') + '" data-v="alumnas">Por alumna</button>' +
      '<button type="button" role="tab" class="seg-tab' + (view === 'cursos' ? ' active' : '') + '" data-v="cursos">Por curso</button></div>' +
      (view === 'alumnas'
        ? '<div class="seg-filters"><input type="search" id="segSearch" placeholder="Buscar por nombre o email" aria-label="Buscar alumna">' +
          '<select id="segCurso" aria-label="Filtrar por curso"><option value="">Todos los cursos</option>' +
          cache.cursos.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === curSel ? ' selected' : '') + '>' + esc(c.nombre) + '</option>'; }).join('') + '</select>' +
          '<label class="seg-chk"><input type="checkbox" id="segAyuda"> Solo las que necesitan ayuda (' + ayuda + ')</label></div>' +
          '<div id="segResult"></div>'
        : renderCursos());
    if (view === 'alumnas') {
      var upd = function () { $('segResult').innerHTML = renderAlumnas(); };
      ['segSearch', 'segCurso', 'segAyuda'].forEach(function (id) { $(id).addEventListener('input', upd); $(id).addEventListener('change', upd); });
      upd();
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.seg-tab');
    if (!t) return;
    view = t.dataset.v; render();
  });
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'segReload') load();
  });

  window.loadSeguimiento = function () { if (!cache) load(); };
})();
