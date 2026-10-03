// Panel "Pagos" del admin (libro de pagos por alumna + Comunidad Marieta) y ficha de cada alumna.
// Usa las tablas alumnas_fichas y pagos_registro de supabase/pagos_fichas.sql.
(function () {
  var METODOS = [['paypal', 'PayPal'], ['bizum', 'Bizum'], ['transferencia', 'Transferencia'], ['efectivo', 'Efectivo'], ['otro', 'Otro']];
  var TIPOS = [['taller', 'Taller o proyecto'], ['comunidad', 'Cuota Comunidad Marietas'], ['otro', 'Otro']];
  var S = { alumnas: [], fichas: {}, pagos: [], loaded: false, loading: null, view: 'alumnas', open: {}, q: '', filtro: 'todas', editId: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function eur(n) { return (Math.round((+n || 0) * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €'; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function mk(y, m) { return y + '-' + String(m).padStart(2, '0'); }
  function nowKey() { var d = new Date(); return mk(d.getFullYear(), d.getMonth() + 1); }
  function keyOf(date) { return date ? String(date).slice(0, 7) : null; }
  function monthLabel(key) { var p = key.split('-'); return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', ''); }
  function monthLong(key) { var p = key.split('-'); return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); }
  function fecha(d) { return d ? new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
  function metodoLabel(v) { var m = METODOS.find(function (x) { return x[0] === v; }); return m ? m[1] : (v || ''); }

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

  function ensureLoaded(force) {
    if (S.loaded && !force) return Promise.resolve();
    if (S.loading) return S.loading;
    S.loading = (async function () {
      var res = await Promise.all([
        fetchAll('profiles', 'id, nombre, created_at, es_admin'),
        fetchAll('alumnas_fichas', '*'),
        fetchAll('pagos_registro', '*')
      ]);
      S.alumnas = res[0].filter(function (p) { return !p.es_admin; }).sort(function (a, b) { return (a.nombre || '').localeCompare(b.nombre || '', 'es'); });
      S.fichas = {}; res[1].forEach(function (f) { S.fichas[f.user_id] = f; });
      S.pagos = res[2].sort(function (a, b) { return (b.fecha || '') > (a.fecha || '') ? 1 : (b.fecha || '') < (a.fecha || '') ? -1 : (b.created_at > a.created_at ? 1 : -1); });
      S.loaded = true;
    })().finally(function () { S.loading = null; });
    return S.loading;
  }

  // ---------- Cálculos ----------
  function comunidadInfo(a) {
    var f = S.fichas[a.id];
    if (!f || !f.es_comunidad) return null;
    var desde = keyOf(f.comunidad_desde) || keyOf(a.created_at);
    var tope = nowKey();
    var hasta = keyOf(f.comunidad_hasta);
    if (hasta && hasta < tope) tope = hasta;
    var meses = [];
    if (desde && desde <= tope) {
      var y = +desde.slice(0, 4), m = +desde.slice(5, 7);
      for (var guard = 0; guard < 240; guard++) {
        var k = mk(y, m); if (k > tope) break;
        meses.push(k); m++; if (m > 12) { m = 1; y++; }
      }
    }
    var pagados = {};
    S.pagos.forEach(function (p) { if (p.user_id === a.id && p.tipo === 'comunidad' && p.estado === 'pagado' && p.periodo) pagados[keyOf(p.periodo)] = true; });
    var estado = meses.map(function (k) { return { key: k, pagado: !!pagados[k] }; });
    var pend = estado.filter(function (x) { return !x.pagado; });
    var cuota = +f.comunidad_cuota || 0;
    return { meses: estado, pendientes: pend, cuota: cuota, debe: pend.length * cuota, desde: desde, baja: hasta };
  }
  function pagosDe(uid) { return S.pagos.filter(function (p) { return p.user_id === uid; }); }
  function totalPagado(uid) { return pagosDe(uid).filter(function (p) { return p.estado === 'pagado'; }).reduce(function (s, p) { return s + (+p.importe || 0); }, 0); }

  // ---------- Métricas de arriba (suma el libro nuevo y los pagos antiguos por matrícula) ----------
  window.updatePagoMetrics = function () {
    if (!$('pagoMes')) return;
    var d = new Date(), mes = mk(d.getFullYear(), d.getMonth() + 1), ano = String(d.getFullYear());
    var items = S.pagos.filter(function (p) { return p.estado === 'pagado'; }).map(function (p) { return { f: p.fecha || '', i: +p.importe || 0 }; });
    try {
      (window.allPagos || (typeof allPagos !== 'undefined' ? allPagos : [])).forEach(function (p) {
        if (p.estado_pago === 'pagado' && p.importe > 0) items.push({ f: p.fecha_pago || '', i: parseFloat(p.importe) });
      });
    } catch (e) {}
    var sum = function (fn) { return items.filter(fn).reduce(function (s, x) { return s + x.i; }, 0); };
    $('pagoMes').textContent = eur(sum(function (x) { return x.f.slice(0, 7) === mes; }));
    $('pagoAno').textContent = eur(sum(function (x) { return x.f.slice(0, 4) === ano; }));
    $('pagoTotal').textContent = eur(sum(function () { return true; }));
  };

  // ---------- Pintar ----------
  function chips(a, info, compact) {
    if (!info) return '';
    if (!info.meses.length) return '<p class="pg-muted">Todavía no le toca pagar ningún mes.</p>';
    return '<div class="pg-chips">' + info.meses.map(function (m) {
      return m.pagado
        ? '<span class="pg-chip pg-chip--ok" title="Pagado">' + esc(monthLabel(m.key)) + '</span>'
        : '<button type="button" class="pg-chip pg-chip--no" data-act="paymonth" data-uid="' + esc(a.id) + '" data-m="' + m.key + '" title="Pulsa para marcar como pagado">' + esc(monthLabel(m.key)) + '</button>';
    }).join('') + '</div>' + (compact ? '' : '<p class="pg-muted">Los meses en rojo están pendientes: pulsa uno para marcarlo como pagado (' + eur(info.cuota) + ').</p>');
  }

  function resumenBadges(a, info) {
    var b = '';
    if (info) {
      b += '<span class="pg-pill pg-pill--com">Comunidad</span>';
      b += info.pendientes.length
        ? '<span class="pg-pill pg-pill--red">Debe ' + info.pendientes.length + (info.pendientes.length === 1 ? ' mes' : ' meses') + ' · ' + eur(info.debe) + '</span>'
        : '<span class="pg-pill pg-pill--green">Al día</span>';
    }
    return b;
  }

  function contacto(f) {
    if (!f) return '';
    var parts = [];
    if (f.localidad) parts.push(esc(f.localidad));
    if (f.telefono) {
      var d = String(f.telefono).replace(/\D/g, ''); if (d.length === 9) d = '34' + d;
      parts.push('<a href="https://wa.me/' + d + '" target="_blank" rel="noopener">WhatsApp ' + esc(f.telefono) + '</a>');
    }
    if (f.instagram) { var h = String(f.instagram).replace(/^@/, '').trim(); parts.push('<a href="https://www.instagram.com/' + encodeURIComponent(h) + '/" target="_blank" rel="noopener">@' + esc(h) + '</a>'); }
    if (f.email_contacto) parts.push('<a href="mailto:' + esc(f.email_contacto) + '">' + esc(f.email_contacto) + '</a>');
    return parts.length ? '<p class="pg-contact">' + parts.join(' · ') + '</p>' : '';
  }

  function entryRow(p) {
    var pend = p.estado === 'pendiente';
    return '<li class="pg-entry' + (pend ? ' is-pend' : '') + '"><div class="pg-entry__main"><strong>' + esc(p.concepto) + '</strong>' +
      '<span class="pg-entry__meta">' + (pend ? 'Pendiente' : 'Pagado') + ' · ' + eur(p.importe) + (p.metodo ? ' · ' + esc(metodoLabel(p.metodo)) : '') + ' · ' + fecha(p.fecha) + '</span>' +
      (p.notas ? '<span class="pg-entry__meta">' + esc(p.notas) + '</span>' : '') + '</div>' +
      '<div class="pg-entry__act"><button type="button" class="btn btn-sm btn--outline" data-act="edit" data-id="' + esc(p.id) + '">Editar</button>' +
      '<button type="button" class="btn btn-sm btn-danger" data-act="del" data-id="' + esc(p.id) + '">Borrar</button></div></li>';
  }

  function form(a, info) {
    var e = S.editId ? S.pagos.find(function (p) { return p.id === S.editId && p.user_id === a.id; }) : null;
    var v = e || { tipo: 'taller', concepto: '', importe: '', metodo: 'bizum', estado: 'pagado', fecha: today(), periodo: null, notas: '' };
    var opt = function (list, cur) { return list.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + x[1] + '</option>'; }).join(''); };
    return '<form class="pg-form" data-uid="' + esc(a.id) + '">' +
      '<h4>' + (e ? 'Editar anotación' : 'Anotar un pago') + '</h4>' +
      '<div class="pg-grid">' +
      '<label>Concepto<input name="concepto" required maxlength="160" value="' + esc(v.concepto) + '" placeholder="Ej: Proyecto 1" list="pgConceptos"></label>' +
      '<label>Tipo<select name="tipo">' + opt(TIPOS, v.tipo) + '</select></label>' +
      '<label class="pg-per"' + (v.tipo === 'comunidad' ? '' : ' hidden') + '>Mes que paga<input type="month" name="periodo" value="' + esc(keyOf(v.periodo) || nowKey()) + '"></label>' +
      '<label>Importe (€)<input type="number" name="importe" step="0.01" min="0" required value="' + esc(v.importe) + '" placeholder="20"></label>' +
      '<label>Cómo pagó<select name="metodo">' + opt(METODOS, v.metodo || 'bizum') + '</select></label>' +
      '<label>Estado<select name="estado">' + opt([['pagado', 'Pagado'], ['pendiente', 'Pendiente de pago']], v.estado) + '</select></label>' +
      '<label>Fecha<input type="date" name="fecha" value="' + esc(v.fecha || today()) + '"></label>' +
      '<label class="pg-wide">Notas (opcional)<input name="notas" maxlength="300" value="' + esc(v.notas || '') + '"></label></div>' +
      '<div class="pg-row"><button type="submit" class="btn btn--primary">' + (e ? 'Guardar cambios' : 'Añadir') + '</button>' +
      (e ? '<button type="button" class="btn btn--outline" data-act="canceledit">Cancelar</button>' : '') + '</div></form>';
  }

  function alumnaCard(a) {
    var f = S.fichas[a.id], info = comunidadInfo(a);
    var open = !!S.open[a.id];
    var pagos = pagosDe(a.id);
    return '<article class="pg-card' + (info && info.pendientes.length ? ' is-help' : '') + '" data-uid="' + esc(a.id) + '">' +
      '<header class="pg-card__head"><div><h3>' + esc(a.nombre || 'Sin nombre') + '</h3>' + contacto(f) + '</div>' +
      '<div class="pg-card__side"><div class="pg-badges">' + resumenBadges(a, info) + '</div>' +
      '<span class="pg-total">Pagado en total: <strong>' + eur(totalPagado(a.id)) + '</strong></span>' +
      '<div class="pg-row"><button type="button" class="btn btn-sm btn--primary" data-act="toggle" data-uid="' + esc(a.id) + '">' + (open ? 'Cerrar' : 'Pagos') + '</button>' +
      '<button type="button" class="btn btn-sm btn--outline" data-act="ficha" data-uid="' + esc(a.id) + '">Ficha</button></div></div></header>' +
      (open ? '<div class="pg-card__body">' +
        (info ? '<h4>Cuotas de la Comunidad (desde ' + esc(monthLong(info.desde || nowKey())) + ')</h4>' + chips(a, info) : '') +
        '<h4>Pagos anotados</h4>' +
        (pagos.length ? '<ul class="pg-list">' + pagos.map(entryRow).join('') + '</ul>' : '<p class="pg-muted">Todavía no hay nada anotado.</p>') +
        form(a, info) + '</div>' : '') + '</article>';
  }

  function renderAlumnas() {
    var q = S.q.toLowerCase();
    var list = S.alumnas.filter(function (a) {
      var f = S.fichas[a.id] || {};
      if (q && ((a.nombre || '') + ' ' + (f.localidad || '') + ' ' + (f.instagram || '') + ' ' + (f.email_contacto || '')).toLowerCase().indexOf(q) < 0) return false;
      var info = comunidadInfo(a);
      if (S.filtro === 'comunidad' && !info) return false;
      if (S.filtro === 'pendientes' && !(info && info.pendientes.length)) return false;
      return true;
    });
    return '<div class="seg-filters"><input type="search" id="pgSearch" value="' + esc(S.q) + '" placeholder="Buscar por nombre, localidad..." aria-label="Buscar alumna">' +
      '<select id="pgFiltro" aria-label="Filtrar"><option value="todas"' + (S.filtro === 'todas' ? ' selected' : '') + '>Todas las alumnas</option>' +
      '<option value="comunidad"' + (S.filtro === 'comunidad' ? ' selected' : '') + '>Solo Comunidad Marietas</option>' +
      '<option value="pendientes"' + (S.filtro === 'pendientes' ? ' selected' : '') + '>Con cuotas pendientes</option></select></div>' +
      (list.length ? '<div class="seg-list" id="pgCards">' + list.map(alumnaCard).join('') + '</div>' : '<p class="seg-empty">No hay alumnas con estos filtros.</p>') +
      '<datalist id="pgConceptos">' + Array.from(new Set(S.pagos.map(function (p) { return p.concepto; }))).slice(0, 40).map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>';
  }

  function renderComunidad() {
    var miembros = S.alumnas.map(function (a) { return { a: a, info: comunidadInfo(a) }; }).filter(function (x) { return x.info; });
    if (!miembros.length) return '<p class="seg-empty">Todavía no hay nadie marcado como miembro de la Comunidad Marietas. Abre la <strong>Ficha</strong> de una alumna y marca "Es de la Comunidad".</p>';
    miembros.sort(function (x, y) { return y.info.pendientes.length - x.info.pendientes.length; });
    var mes = nowKey();
    var cobradoMes = S.pagos.filter(function (p) { return p.tipo === 'comunidad' && p.estado === 'pagado' && keyOf(p.fecha) === mes; }).reduce(function (s, p) { return s + (+p.importe || 0); }, 0);
    var debeTotal = miembros.reduce(function (s, x) { return s + x.info.debe; }, 0);
    var conPend = miembros.filter(function (x) { return x.info.pendientes.length; }).length;
    return '<div class="admin-stats seg-stats">' +
      '<div class="stat-card"><div class="stat-card__number">' + miembros.length + '</div><div class="stat-card__label">Miembros</div></div>' +
      '<div class="stat-card"><div class="stat-card__number">' + conPend + '</div><div class="stat-card__label">Con cuotas pendientes</div></div>' +
      '<div class="stat-card"><div class="stat-card__number">' + eur(debeTotal) + '</div><div class="stat-card__label">Pendiente de cobrar</div></div>' +
      '<div class="stat-card"><div class="stat-card__number">' + eur(cobradoMes) + '</div><div class="stat-card__label">Cobrado este mes</div></div></div>' +
      '<div class="seg-list">' + miembros.map(function (x) {
        var a = x.a, info = x.info;
        return '<article class="pg-card' + (info.pendientes.length ? ' is-help' : '') + '"><header class="pg-card__head"><div><h3>' + esc(a.nombre || 'Sin nombre') + '</h3>' + contacto(S.fichas[a.id]) +
          '<span class="seg-sub">Desde ' + esc(monthLong(info.desde || nowKey())) + ' · ' + eur(info.cuota) + ' al mes' + (info.baja ? ' · Baja en ' + esc(monthLong(info.baja)) : '') + '</span></div>' +
          '<div class="pg-card__side"><div class="pg-badges">' + resumenBadges(a, info) + '</div>' +
          '<div class="pg-row"><button type="button" class="btn btn-sm btn--outline" data-act="ficha" data-uid="' + esc(a.id) + '">Ficha</button>' +
          '<button type="button" class="btn btn-sm btn--outline" data-act="goto" data-uid="' + esc(a.id) + '">Ver pagos</button></div></div></header>' +
          chips(a, info, true) + '</article>';
      }).join('') + '</div>';
  }

  function render() {
    var box = $('pagosNew'); if (!box) return;
    var tabs = '<div class="seg-tabs" role="tablist">' +
      [['alumnas', 'Por alumna'], ['comunidad', 'Comunidad Marietas'], ['antiguos', 'Pagos de cursos (anteriores)']].map(function (t) {
        return '<button type="button" role="tab" class="seg-tab' + (S.view === t[0] ? ' active' : '') + '" data-act="tab" data-v="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';
    var old = $('pagosOld');
    if (old) old.hidden = S.view !== 'antiguos';
    box.innerHTML = tabs + (S.view === 'alumnas' ? renderAlumnas() : S.view === 'comunidad' ? renderComunidad() : '');
    window.updatePagoMetrics();
  }

  // ---------- Acciones ----------
  async function addPago(rec) {
    var r = await supabase.from('pagos_registro').insert(rec).select().single();
    if (r.error) { alert('No se ha podido guardar: ' + r.error.message); return false; }
    S.pagos.unshift(r.data); return true;
  }

  async function payMonth(uid, key) {
    var a = S.alumnas.find(function (x) { return x.id === uid; }), info = comunidadInfo(a);
    if (!confirm('¿Marcar ' + monthLong(key) + ' como pagado (' + eur(info.cuota) + ') para ' + (a.nombre || 'esta alumna') + '?')) return;
    // Si ya había una anotación pendiente de ese mes, se actualiza en vez de duplicar
    var prev = S.pagos.find(function (p) { return p.user_id === uid && p.tipo === 'comunidad' && keyOf(p.periodo) === key && p.estado === 'pendiente'; });
    if (prev) {
      var u = await supabase.from('pagos_registro').update({ estado: 'pagado', fecha: today(), importe: info.cuota }).eq('id', prev.id).select().single();
      if (u.error) { alert('Error: ' + u.error.message); return; }
      Object.assign(prev, u.data);
    } else {
      if (!(await addPago({ user_id: uid, tipo: 'comunidad', concepto: 'Cuota Comunidad Marietas ' + monthLong(key), periodo: key + '-01', importe: info.cuota, metodo: 'bizum', estado: 'pagado', fecha: today() }))) return;
    }
    render();
  }

  document.addEventListener('click', async function (e) {
    var el = e.target.closest && e.target.closest('[data-act]');
    if (!el || !$('pagosNew') || !$('pagosNew').contains(el)) return;
    var act = el.dataset.act;
    if (act === 'tab') { S.view = el.dataset.v; render(); }
    else if (act === 'toggle') { var u = el.dataset.uid; S.open[u] = !S.open[u]; S.editId = null; render(); }
    else if (act === 'goto') { S.view = 'alumnas'; S.q = ''; S.filtro = 'todas'; S.open[el.dataset.uid] = true; render(); var c = document.querySelector('.pg-card[data-uid="' + el.dataset.uid + '"]'); if (c) c.scrollIntoView({ block: 'start' }); }
    else if (act === 'ficha') { window.openFicha(el.dataset.uid); }
    else if (act === 'paymonth') { payMonth(el.dataset.uid, el.dataset.m); }
    else if (act === 'edit') { S.editId = el.dataset.id; render(); var f = document.querySelector('.pg-form'); if (f) f.scrollIntoView({ block: 'center' }); }
    else if (act === 'canceledit') { S.editId = null; render(); }
    else if (act === 'del') {
      var p = S.pagos.find(function (x) { return x.id === el.dataset.id; });
      if (!p || !confirm('¿Borrar la anotación "' + p.concepto + '"? No se puede deshacer.')) return;
      var r = await supabase.from('pagos_registro').delete().eq('id', p.id);
      if (r.error) { alert('Error: ' + r.error.message); return; }
      S.pagos = S.pagos.filter(function (x) { return x.id !== p.id; }); render();
    }
  });

  document.addEventListener('input', function (e) {
    if (!$('pagosNew') || !$('pagosNew').contains(e.target)) return;
    if (e.target.id === 'pgSearch') { S.q = e.target.value; var pos = e.target.selectionStart; render(); var s = $('pgSearch'); s.focus(); s.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', function (e) {
    if (!$('pagosNew') || !$('pagosNew').contains(e.target)) return;
    if (e.target.id === 'pgFiltro') { S.filtro = e.target.value; render(); return; }
    var form = e.target.closest && e.target.closest('.pg-form');
    if (form && e.target.name === 'tipo') {
      var com = e.target.value === 'comunidad';
      form.querySelector('.pg-per').hidden = !com;
      if (com) {
        var a = S.alumnas.find(function (x) { return x.id === form.dataset.uid; }), info = comunidadInfo(a);
        if (info && !form.importe.value) form.importe.value = info.cuota;
        if (!form.concepto.value) form.concepto.value = 'Cuota Comunidad Marietas';
      }
    }
  });

  document.addEventListener('submit', async function (e) {
    var form = e.target.closest && e.target.closest('.pg-form');
    if (!form) return;
    e.preventDefault();
    var uid = form.dataset.uid, d = new FormData(form);
    var tipo = d.get('tipo');
    var rec = { user_id: uid, tipo: tipo, concepto: String(d.get('concepto')).trim(), importe: parseFloat(d.get('importe')) || 0,
      metodo: d.get('metodo'), estado: d.get('estado'), fecha: d.get('fecha') || today(), notas: String(d.get('notas') || '').trim() || null,
      periodo: tipo === 'comunidad' && d.get('periodo') ? d.get('periodo') + '-01' : null };
    if (!rec.concepto) return;
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    var ok;
    if (S.editId) {
      var r = await supabase.from('pagos_registro').update(rec).eq('id', S.editId).select().single();
      ok = !r.error; if (r.error) alert('Error: ' + r.error.message); else { var i = S.pagos.findIndex(function (x) { return x.id === S.editId; }); S.pagos[i] = r.data; }
      S.editId = null;
    } else { ok = await addPago(rec); }
    btn.disabled = false;
    if (ok) render();
  });

  // ---------- Ficha de la alumna ----------
  function dlg() {
    var d = $('fichaDlg');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'fichaDlg'; d.className = 'ficha-dlg';
    d.innerHTML = '<form id="fichaForm"><h3 id="fichaTitle">Ficha</h3><p class="pg-muted">Todo es opcional. Solo lo ves tú.</p>' +
      '<div class="alert alert--error" id="fichaErr" role="alert"></div>' +
      '<div class="pg-grid">' +
      '<label class="pg-wide">Nombre<input name="nombre" maxlength="120"></label>' +
      '<label>Localidad<input name="localidad" maxlength="120" placeholder="Ej: Sant Quirze, Barcelona"></label>' +
      '<label>WhatsApp<input name="telefono" maxlength="30" placeholder="600 000 000" inputmode="tel"></label>' +
      '<label>Instagram<input name="instagram" maxlength="60" placeholder="@usuario"></label>' +
      '<label>Email de contacto<input name="email_contacto" type="email" maxlength="160" placeholder="nombre@email.com"></label>' +
      '<label class="pg-wide">Notas privadas<textarea name="notas" rows="3" maxlength="1000" placeholder="Lo que te sirva recordar de ella"></textarea></label></div>' +
      '<fieldset class="pg-com"><legend>Comunidad Marietas</legend>' +
      '<label class="pg-check"><input type="checkbox" name="es_comunidad"> Es miembro de la Comunidad Marietas (paga una cuota al mes)</label>' +
      '<div class="pg-grid" id="comOpts">' +
      '<label>Paga desde<input type="month" name="desde"></label>' +
      '<label>Cuota mensual (€)<input type="number" name="cuota" step="0.01" min="0" value="20"></label>' +
      '<label>Baja a partir de (opcional)<input type="month" name="hasta"></label></div></fieldset>' +
      '<div class="pg-row"><button type="submit" class="btn btn--primary" id="fichaSave">Guardar ficha</button><button type="button" class="btn btn--outline" id="fichaCancel">Cancelar</button></div></form>';
    document.body.appendChild(d);
    d.querySelector('[name=es_comunidad]').addEventListener('change', function (e) { $('comOpts').hidden = !e.target.checked; });
    $('fichaCancel').addEventListener('click', function () { d.close(); });
    $('fichaForm').addEventListener('submit', saveFicha);
    return d;
  }

  var fichaUid = null;
  window.openFicha = async function (uid) {
    try { await ensureLoaded(); } catch (err) { alert('No se ha podido cargar la ficha. ¿Has ejecutado supabase/pagos_fichas.sql?\n' + (err.message || err)); return; }
    var a = S.alumnas.find(function (x) { return x.id === uid; }); if (!a) return;
    var f = S.fichas[uid] || {}, d = dlg(), fm = $('fichaForm');
    fichaUid = uid;
    $('fichaTitle').textContent = 'Ficha de ' + (a.nombre || 'la alumna');
    fm.nombre.value = a.nombre || ''; fm.localidad.value = f.localidad || ''; fm.telefono.value = f.telefono || '';
    fm.instagram.value = f.instagram || ''; fm.email_contacto.value = f.email_contacto || ''; fm.notas.value = f.notas || '';
    fm.es_comunidad.checked = !!f.es_comunidad; $('comOpts').hidden = !f.es_comunidad;
    fm.desde.value = keyOf(f.comunidad_desde) || (f.es_comunidad ? '' : nowKey());
    fm.cuota.value = f.comunidad_cuota != null ? f.comunidad_cuota : 20;
    fm.hasta.value = keyOf(f.comunidad_hasta) || '';
    $('fichaErr').classList.remove('visible'); $('fichaSave').disabled = false;
    d.showModal();
  };

  async function saveFicha(e) {
    e.preventDefault();
    var fm = e.target, uid = fichaUid, t = function (n) { return (fm[n].value || '').trim() || null; };
    var rec = { user_id: uid, localidad: t('localidad'), telefono: t('telefono'), instagram: t('instagram'), email_contacto: t('email_contacto'), notas: t('notas'),
      es_comunidad: fm.es_comunidad.checked, comunidad_desde: fm.desde.value ? fm.desde.value + '-01' : null,
      comunidad_hasta: fm.hasta.value ? fm.hasta.value + '-01' : null, comunidad_cuota: parseFloat(fm.cuota.value) || 0, updated_at: new Date().toISOString() };
    if (rec.es_comunidad && !rec.comunidad_desde) { $('fichaErr').textContent = 'Indica desde qué mes paga la cuota.'; $('fichaErr').classList.add('visible'); return; }
    $('fichaSave').disabled = true;
    var r = await supabase.from('alumnas_fichas').upsert(rec, { onConflict: 'user_id' }).select().single();
    if (r.error) { $('fichaErr').textContent = 'No se ha podido guardar: ' + r.error.message; $('fichaErr').classList.add('visible'); $('fichaSave').disabled = false; return; }
    S.fichas[uid] = r.data;
    var nombre = (fm.nombre.value || '').trim();
    var a = S.alumnas.find(function (x) { return x.id === uid; });
    if (nombre && a && nombre !== a.nombre) {
      var p = await supabase.from('profiles').update({ nombre: nombre }).eq('id', uid);
      if (!p.error) { a.nombre = nombre; try { var pr = allProfiles.find(function (x) { return x.id === uid; }); if (pr) pr.nombre = nombre; if (window.loadAlumnas) loadAlumnas(); } catch (er) {} }
    }
    $('fichaDlg').close();
    if (S.loaded && $('pagosNew')) render();
  }

  window.loadPagosNuevo = async function () {
    var box = $('pagosNew'); if (!box) return;
    if (!S.loaded) box.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando...</div>';
    try { await ensureLoaded(); render(); }
    catch (err) {
      box.innerHTML = '<div class="alert alert--error visible">No se han podido cargar los pagos: ' + esc(err.message || err) + '<br>¿Has ejecutado el archivo supabase/pagos_fichas.sql en Supabase?</div>';
      var old = $('pagosOld'); if (old) old.hidden = false;
    }
  };
})();
